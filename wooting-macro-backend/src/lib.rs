#[cfg(not(debug_assertions))]
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::{thread, time};

use anyhow::{bail, Error, Result};
use tauri::Manager;
use fastrand;
#[cfg(not(debug_assertions))]
use dirs;
use halfbrown::HashMap;
use itertools::Itertools;
use log::*;
use rayon::prelude::*;
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use tokio::sync::RwLock;
use tokio::sync::Mutex;
use tokio::task;

use config::{ApplicationConfig, ConfigFile};

// This has to be imported for release build
#[allow(unused_imports)]
use crate::config::CONFIG_DIR;
use crate::hid_table::*;
//Plugin imports
use crate::plugin::delay;
#[allow(unused_imports)]
use crate::plugin::discord;
use crate::plugin::key_press;
use crate::plugin::mouse;
#[allow(unused_imports)]
use crate::plugin::obs;
use crate::plugin::phillips_hue;
use crate::plugin::system_event;

pub mod config;
mod hid_table;
pub mod plugin;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
/// Type of a macro. Currently only Single is implemented. Others have been postponed for now.
///
/// ! **UNIMPLEMENTED** - Only the `Single` macro type is implemented for now. Feel free to contribute ideas.
pub enum MacroType {
    Single,
    // Single macro fire
    Toggle,
    // press to start, press to finish cycle and terminate
    OnHold, // while held Execute macro (repeats)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type")]
/// This enum is the registry for all actions that can be executed.
pub enum ActionEventType {
    KeyPressEventAction {
        data: key_press::KeyPress,
    },
    SystemEventAction {
        data: system_event::SystemAction,
    },
    //Paste, Run commandline program (terminal run? standard user?), audio, open file-manager, workspace switch left, right,
    //IDEA: System event - notification
    PhillipsHueEventAction {
        data: phillips_hue::PhillipsHueStatus,
    },
    //IDEA: Phillips hue notification
    OBSEventAction {},

    DiscordEventAction {},
    //IDEA: IKEADesk
    MouseEventAction {
        data: mouse::MouseAction,
    },
    MousePathEventAction {
        data: Vec<MousePathPoint>,
    },
    //IDEA: Sound effects? Soundboards?
    //IDEA: Sending a message through online webapi (twitch)
    DelayEventAction {
        data: delay::Delay,
        #[serde(default)]
        random_max: Option<u64>,
    },
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MousePathPoint {
    pub x: i32,
    pub y: i32,
    pub delta_ms: u64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type")]
/// This enum is the registry for all incoming actions that can be analyzed for macro execution.
///
/// ! **UNIMPLEMENTED** - Allow while other keys has not been implemented yet. This is WIP already.
pub enum TriggerEventType {
    KeyPressEvent {
        data: Vec<u32>,
        allow_while_other_keys: bool,
    },
    MouseEvent {
        data: mouse::MouseButton,
    },
    //IDEA: computer time (have timezone support?)
    //IDEA: computer temperature?
}

fn default_suppress_trigger_key() -> bool {
    true
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
/// This is a macro struct. Includes all information a macro needs to run.
pub struct Macro {
    pub name: String,
    pub icon: String,
    pub sequence: Vec<ActionEventType>,
    pub macro_type: MacroType,
    pub trigger: TriggerEventType,
    pub active: bool,
    /// Optional: Maximum number of loop iterations for Toggle macros (None = infinite)
    #[serde(default)]
    pub loop_count: Option<u32>,
    /// Delay in milliseconds before the sequence begins executing
    #[serde(default)]
    pub startup_delay: Option<u64>,
    /// Speed multiplier for all delays (2.0 = 2x faster, 0.5 = half speed)
    #[serde(default)]
    pub playback_speed: Option<f64>,
    /// HID key code that aborts macro execution mid-sequence
    #[serde(default)]
    pub abort_key: Option<u32>,
    /// Whether the trigger key event is consumed (prevented from reaching other apps)
    #[serde(default = "default_suppress_trigger_key")]
    pub suppress_trigger_key: bool,
    /// Fire the macro on key release instead of key press
    #[serde(default)]
    pub trigger_on_release: bool,
}

impl Macro {
    /// This function is used to execute a macro. It is called by the macro checker.
    /// It spawns async tasks to execute said events specifically.
    /// Make sure to expand this if you implement new action types.
    async fn execute(&self, send_channel: UnboundedSender<rdev::EventType>, cancel: Arc<AtomicBool>) -> Result<()> {
        let speed = self.playback_speed.unwrap_or(1.0).max(0.01);

        if let Some(startup_ms) = self.startup_delay {
            if startup_ms > 0 {
                tokio::time::sleep(time::Duration::from_millis(startup_ms)).await;
            }
        }

        for action in &self.sequence {
            if cancel.load(Ordering::Relaxed) {
                break;
            }
            match action {
                ActionEventType::KeyPressEventAction { data } => match data.keytype {
                    key_press::KeyType::Down => {
                        // One key press down
                        send_channel
                            .send(rdev::EventType::KeyPress(SCANCODE_TO_RDEV[&data.keypress]))?;
                    }
                    key_press::KeyType::Up => {
                        // One key lift up
                        send_channel.send(rdev::EventType::KeyRelease(
                            SCANCODE_TO_RDEV[&data.keypress],
                        ))?;
                    }
                    key_press::KeyType::DownUp => {
                        // Key press
                        send_channel
                            .send(rdev::EventType::KeyPress(SCANCODE_TO_RDEV[&data.keypress]))?;

                        // Wait the set delay by user (scaled by playback speed)
                        let scaled_duration = ((data.press_duration as f64) / speed) as u64;
                        tokio::time::sleep(time::Duration::from_millis(scaled_duration)).await;

                        // Lift the key
                        send_channel.send(rdev::EventType::KeyRelease(
                            SCANCODE_TO_RDEV[&data.keypress],
                        ))?;
                    }
                },
                ActionEventType::PhillipsHueEventAction { .. } => {}
                ActionEventType::OBSEventAction { .. } => {}
                ActionEventType::DiscordEventAction { .. } => {}
                ActionEventType::DelayEventAction { data, random_max } => {
                    let actual_delay = match random_max {
                        Some(max) if *max > *data => fastrand::u64(*data..=*max),
                        _ => *data,
                    };
                    let scaled_delay = ((actual_delay as f64) / speed) as u64;
                    tokio::time::sleep(time::Duration::from_millis(scaled_delay)).await;
                }

                ActionEventType::SystemEventAction { data } => {
                    let action_copy = data.clone();
                    let channel_copy = send_channel.clone();
                    task::spawn(async move { action_copy.execute(channel_copy).await });
                }
                ActionEventType::MouseEventAction { data } => {
                    match data {
                        mouse::MouseAction::Press { data: mouse::MousePressAction::DownUp { .. } } => {
                            let action_copy = data.clone();
                            let channel_copy = send_channel.clone();
                            task::spawn(async move { action_copy.execute(channel_copy).await });
                        }
                        _ => {
                            data.execute(send_channel.clone()).await.ok();
                        }
                    }
                }
                ActionEventType::MousePathEventAction { data } => {
                    // Before the first move, sleep proportionally to how far the cursor
                    // currently is from the path start so the next action (click or key)
                    // always fires after the cursor has settled at its destination.
                    if let Some(first) = data.first() {
                        #[cfg(target_os = "windows")]
                        {
                            use windows_sys::Win32::Foundation::POINT;
                            use windows_sys::Win32::UI::WindowsAndMessaging::GetCursorPos;
                            let mut pt = POINT { x: 0, y: 0 };
                            unsafe { GetCursorPos(&mut pt); }
                            let dx = (first.x - pt.x as i32) as f64;
                            let dy = (first.y - pt.y as i32) as f64;
                            let distance = (dx * dx + dy * dy).sqrt();
                            // ~0.05 ms per pixel, clamped 5–150 ms
                            let settle_ms = (distance * 0.05).clamp(5.0, 150.0) as u64;
                            tokio::time::sleep(time::Duration::from_millis(settle_ms)).await;
                        }
                    }
                    for point in data {
                        if cancel.load(Ordering::Relaxed) {
                            break;
                        }
                        let scaled_delta = ((point.delta_ms as f64) / speed) as u64;
                        tokio::time::sleep(time::Duration::from_millis(scaled_delta)).await;
                        send_channel.send(rdev::EventType::MouseMove {
                            x: point.x as f64,
                            y: point.y as f64,
                        })?;
                    }
                }
            }
        }
        Ok(())
    }
}

/// Collections are groups of macros.
type Collections = Vec<Collection>;

/// Hashmap to check the first trigger key of each macro.
type MacroTriggerLookup = HashMap<u32, Vec<Macro>>;

/// Tracks active toggle macros by their name (used as unique identifier)
type ActiveToggleMacros = Arc<Mutex<HashMap<String, tokio::task::JoinHandle<()>>>>;

/// Maps HID key codes to lists of cancel flags for running macros (used for abort key support)
type AbortRegistrations = Arc<std::sync::Mutex<HashMap<u32, Vec<Arc<AtomicBool>>>>>;

/// Event emitted to the frontend during sequence recording.
#[derive(Debug, Clone, serde::Serialize)]
#[serde(tag = "type")]
pub enum RecordedEvent {
    KeyPress { hid_code: u32, timestamp_ms: u64 },
    KeyRelease { hid_code: u32, timestamp_ms: u64 },
    ButtonPress { button_code: u32, timestamp_ms: u64 },
    ButtonRelease { button_code: u32, timestamp_ms: u64 },
    MouseMove { x: i32, y: i32, timestamp_ms: u64 },
}

/// State of the application in RAM (RWlock).
#[derive(Debug)]
pub struct MacroBackend {
    pub data: Arc<RwLock<MacroData>>,
    pub config: Arc<RwLock<ApplicationConfig>>,
    pub triggers: Arc<RwLock<MacroTriggerLookup>>,
    pub is_listening: Arc<AtomicBool>,
    pub active_toggles: ActiveToggleMacros,
    pub is_recording: Arc<AtomicBool>,
    pub app_handle: Arc<std::sync::Mutex<Option<tauri::AppHandle>>>,
    pub last_move_ms: Arc<AtomicU64>,
    pub abort_registrations: AbortRegistrations,
}

///MacroData is the main data structure that contains all macro data.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MacroData {
    pub data: Collections,
}

impl Default for MacroData {
    fn default() -> Self {
        MacroData {
            data: vec![Collection {
                name: "Collection 1".to_string(),
                icon: ":smile:".to_string(),
                macros: vec![],
                active: true,
                toggle_key: None,
            }],
        }
    }
}

impl MacroData {
    /// Extracts the first trigger data from the macros.
    pub fn extract_triggers(&self) -> Result<MacroTriggerLookup> {
        let mut output_hashmap = MacroTriggerLookup::new();

        for collections in &self.data {
            if collections.active {
                for macros in &collections.macros {
                    if macros.active {
                        match &macros.trigger {
                            TriggerEventType::KeyPressEvent { data, .. } => {
                                //TODO: optimize using references
                                match data.len() {
                                    0 => {
                                        bail!("a trigger key can't be zero, aborting trigger generation: {:#?}", data);
                                    }
                                    1 => {
                                        let first_data = match data.first() {
                                            Some(data) => *data,
                                            None => {
                                                return Err(Error::msg(
                                                    "Error getting first element in macro trigger",
                                                ));
                                            }
                                        };
                                        output_hashmap
                                            .entry(first_data)
                                            .or_default()
                                            .push(macros.clone())
                                    }
                                    _ => data[..data.len() - 1].iter().for_each(|x| {
                                        output_hashmap.entry(*x).or_default().push(macros.clone());
                                    }),
                                }
                            }
                            TriggerEventType::MouseEvent { data } => {
                                let data: u32 = data.into();

                                match output_hashmap.get_mut(&data) {
                                    Some(value) => value.push(macros.clone()),
                                    None => {
                                        output_hashmap.insert_nocheck(data, vec![macros.clone()])
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(output_hashmap)
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
/// Collection struct that defines what a group of macros looks like and what properties it carries
pub struct Collection {
    pub name: String,
    pub icon: String,
    pub macros: Vec<Macro>,
    pub active: bool,
    /// HID key code that toggles this collection on/off
    #[serde(default)]
    pub toggle_key: Option<u32>,
}

/// Executes a given macro (according to its type).
async fn execute_macro(
    macros: Macro,
    channel: UnboundedSender<rdev::EventType>,
    active_toggles: ActiveToggleMacros,
    abort_registrations: AbortRegistrations,
) {
    match macros.macro_type {
        MacroType::Single => {
            info!("\nEXECUTING A SINGLE MACRO: {:#?}", macros.name);

            let cancel = Arc::new(AtomicBool::new(false));

            // Register abort key if set
            if let Some(abort_hid) = macros.abort_key {
                if let Ok(mut regs) = abort_registrations.lock() {
                    regs.entry(abort_hid).or_default().push(cancel.clone());
                }
            }

            let abort_reg_clone = abort_registrations.clone();
            let cancel_clone = cancel.clone();

            task::spawn(async move {
                if let Err(error) = macros.execute(channel, cancel_clone.clone()).await {
                    error!("error executing macro: {}", error);
                }
                // Deregister abort key
                if let Some(abort_hid) = macros.abort_key {
                    if let Ok(mut regs) = abort_reg_clone.lock() {
                        if let Some(vec) = regs.get_mut(&abort_hid) {
                            let ptr = Arc::as_ptr(&cancel_clone) as usize;
                            vec.retain(|f| Arc::as_ptr(f) as usize != ptr);
                            if vec.is_empty() {
                                regs.remove(&abort_hid);
                            }
                        }
                    }
                }
            });
        }
        MacroType::Toggle => {
            info!("\nTOGGLING MACRO: {:#?}", macros.name);

            let macro_name = macros.name.clone();
            let mut active_toggles_lock = active_toggles.lock().await;

            // Check if this toggle macro is already running
            if let Some(handle) = active_toggles_lock.remove(&macro_name) {
                // Stop the running macro
                info!("Stopping toggle macro: {}", macro_name);
                handle.abort();
            } else {
                // Start the toggle macro
                info!("Starting toggle macro: {}", macro_name);
                let loop_count = macros.loop_count;
                let cancel = Arc::new(AtomicBool::new(false));

                if let Some(abort_hid) = macros.abort_key {
                    if let Ok(mut regs) = abort_registrations.lock() {
                        regs.entry(abort_hid).or_default().push(cancel.clone());
                    }
                }

                let handle = task::spawn(async move {
                    let mut iteration = 0u32;
                    loop {
                        if cancel.load(Ordering::Relaxed) {
                            break;
                        }
                        // Check if we've reached the loop limit
                        if let Some(max_loops) = loop_count {
                            if iteration >= max_loops {
                                info!("Toggle macro {} reached loop limit of {}", macros.name, max_loops);
                                break;
                            }
                        }

                        if let Err(error) = macros.execute(channel.clone(), cancel.clone()).await {
                            error!("error executing toggle macro: {}", error);
                            break;
                        }

                        iteration += 1;

                        // Small delay between iterations to prevent overwhelming the system
                        tokio::time::sleep(time::Duration::from_millis(10)).await;
                    }
                    info!("Toggle macro {} stopped after {} iterations", macros.name, iteration);
                });

                active_toggles_lock.insert(macro_name, handle);
            }
        }
        MacroType::OnHold => {
            info!("\nONHOLD MACRO: {:#?}", macros.name);

            // Key used to track this OnHold macro instance
            let trigger_hid = match &macros.trigger {
                TriggerEventType::KeyPressEvent { data, .. } => data.first().copied().unwrap_or(0),
                TriggerEventType::MouseEvent { data } => {
                    let code: u32 = data.into();
                    code
                }
            };
            let hold_key = format!("onhold_{}", trigger_hid);

            let mut active_toggles_lock = active_toggles.lock().await;

            // Don't start a second instance if already running
            if active_toggles_lock.contains_key(&hold_key) {
                return;
            }

            let cancel = Arc::new(AtomicBool::new(false));

            if let Some(abort_hid) = macros.abort_key {
                if let Ok(mut regs) = abort_registrations.lock() {
                    regs.entry(abort_hid).or_default().push(cancel.clone());
                }
            }

            let handle = task::spawn(async move {
                loop {
                    if cancel.load(Ordering::Relaxed) {
                        break;
                    }
                    if let Err(error) = macros.execute(channel.clone(), cancel.clone()).await {
                        error!("error executing onhold macro: {}", error);
                        break;
                    }
                    // Small gap between repetitions
                    tokio::time::sleep(time::Duration::from_millis(10)).await;
                }
                info!("OnHold macro stopped");
            });

            active_toggles_lock.insert(hold_key, handle);
        }
    }
}

/// Receives and executes a macro based on the trigger event.
/// Puts a mandatory 0-20 ms delay between each macro execution (depending on the platform).
fn keypress_executor_sender(mut rchan_execute: UnboundedReceiver<rdev::EventType>) {
    loop {
        let received_event = match &rchan_execute.blocking_recv() {
            Some(event) => *event,
            None => {
                error!("Failed to receive an event!");
                continue;
            }
        };
        plugin::util::direct_send_event(&received_event)
            .unwrap_or_else(|err| error!("Error directly sending an event to keyboard: {}", err));

        //Every OS requires a delay so the OS can catch up.
        thread::sleep(time::Duration::from_millis(delay::STANDARD_KEYPRESS_DELAY));
    }
}

/// A more efficient way using hashtable to check whether the trigger keys match the macro.
///
/// `pressed_events` - the keys pressed in HID format (use the conversion HID hashtable to get the number).
///
/// `trigger_overview` - Macros that need to be checked. Should be picked by matching the hashtable of triggers, and those should be checked here.
///
/// `channel_sender` - a copy of the channel sender to use later when executing various macros.
fn check_macro_execution_efficiently(
    pressed_events: Vec<u32>,
    trigger_overview: Vec<Macro>,
    channel_sender: UnboundedSender<rdev::EventType>,
    active_toggles: ActiveToggleMacros,
    abort_registrations: AbortRegistrations,
    is_release: bool,
) -> bool {
    trace!("Got data: {:?}", trigger_overview);
    trace!("Got keys: {:?}", pressed_events);

    let mut should_suppress = false;
    for macros in &trigger_overview {
        if macros.trigger_on_release != is_release {
            continue;
        }
        match &macros.trigger {
            TriggerEventType::KeyPressEvent { data, .. } => {
                match data.len() {
                    1 => {
                        if pressed_events == *data {
                            debug!("MATCHED MACRO singlekey: {:#?}", pressed_events);

                            let channel_clone_execute = channel_sender.clone();
                            let macro_clone_execute = macros.clone();
                            let active_toggles_clone = active_toggles.clone();
                            let abort_regs_clone = abort_registrations.clone();

                            task::spawn(async move {
                                execute_macro(macro_clone_execute, channel_clone_execute, active_toggles_clone, abort_regs_clone).await;
                            });
                            if macros.suppress_trigger_key {
                                should_suppress = true;
                            }
                        }
                    }
                    2..=4 => {
                        // This check makes sure the modifier keys (up to 3 keys in each trigger) can be of any order, and ensures the last key must match to the proper one.
                        if data[..(data.len() - 1)]
                            .iter()
                            .all(|x| pressed_events[..(pressed_events.len() - 1)].contains(x))
                            && pressed_events[pressed_events.len() - 1] == data[data.len() - 1]
                        {
                            debug!("MATCHED MACRO multikey: {:#?}", pressed_events);

                            let channel_clone_execute = channel_sender.clone();
                            let macro_clone_execute = macros.clone();
                            let active_toggles_clone = active_toggles.clone();
                            let abort_regs_clone = abort_registrations.clone();

                            // This releases any trigger keys that have been held to make macros more reliable when used with modifier hotkeys.
                            plugin::util::lift_keys(data, &channel_clone_execute)
                                .unwrap_or_else(|err| error!("Error lifting keys: {}", err));

                            task::spawn(async move {
                                execute_macro(macro_clone_execute, channel_clone_execute, active_toggles_clone, abort_regs_clone).await;
                            });
                            if macros.suppress_trigger_key {
                                should_suppress = true;
                            }
                        }
                    }
                    _ => (),
                }
            }
            TriggerEventType::MouseEvent { data } => {
                let event_to_check: Vec<u32> = vec![data.into()];

                trace!(
                    "CheckMacroExec: Converted mouse buttons to vec<u32>\n {:#?}",
                    event_to_check
                );

                if event_to_check == pressed_events {
                    let channel_clone = channel_sender.clone();
                    let macro_clone = macros.clone();
                    let active_toggles_clone = active_toggles.clone();
                    let abort_regs_clone = abort_registrations.clone();

                    task::spawn(async move {
                        execute_macro(macro_clone, channel_clone, active_toggles_clone, abort_regs_clone).await;
                    });
                    if macros.suppress_trigger_key {
                        should_suppress = true;
                    }
                }
            }
        }
    }

    should_suppress
}

#[derive(Debug, Clone, Default)]
struct KeysPressed(Arc<RwLock<Vec<rdev::Key>>>);

impl MacroBackend {
    /// Creates the data directory if not present in %appdata% (only in release build).
    pub fn generate_directories() -> Result<()> {
        #[cfg(not(debug_assertions))]
        {
            let conf_dir: Result<PathBuf> = match dirs::config_dir() {
                Some(config_path) => Ok(config_path),
                None => Err(anyhow::Error::msg(
                    "Cannot find config directory, cannot proceed.",
                )),
            };

            let conf_dir = conf_dir?.join(CONFIG_DIR);

            std::fs::create_dir_all(conf_dir.as_path())?;
        }
        Ok(())
    }

    /// Stores the app handle so the recording hotkey can emit events to the frontend.
    pub fn set_app_handle(&self, handle: tauri::AppHandle) {
        if let Ok(mut guard) = self.app_handle.lock() {
            *guard = Some(handle);
        }
    }

    /// Sets whether the backend should process keys that it listens to. Disabling disables the processing logic, but the app still grabs the keys.
    pub fn set_is_listening(&self, is_listening: bool) {
        self.is_listening.store(is_listening, Ordering::Relaxed);
    }

    /// Starts global sequence recording mode. Keyboard/mouse events are emitted to the frontend.
    pub fn start_recording(&self) {
        self.last_move_ms.store(0, Ordering::Relaxed);
        self.is_recording.store(true, Ordering::Relaxed);
        self.set_is_listening(false);
    }

    /// Stops global sequence recording mode and re-enables macro execution.
    pub fn stop_recording(&self) {
        self.is_recording.store(false, Ordering::Relaxed);
        self.set_is_listening(true);
    }
    /// Sets the macros from the frontend to the files. This function is here to completely split the frontend off.
    pub async fn set_macros(&self, macros: MacroData) -> Result<()> {
        macros.write_to_file()?;
        *self.triggers.write().await = macros.extract_triggers()?;
        *self.data.write().await = macros;
        Ok(())
    }

    /// Sets the config from the frontend to the files. This function is here to completely split the frontend off.
    pub async fn set_config(&self, config: ApplicationConfig) -> Result<()> {
        config.write_to_file()?;
        *self.config.write().await = config;
        Ok(())
    }

    /// Initializes the entire backend and gets the whole grabbing system running.
    pub async fn init(&self) -> Result<()> {
        //? : io-uring async read files and write files
        //TODO: implement drop when the application ends to clean up the downed keys

        //==================================================

        let inner_triggers = self.triggers.clone();
        let inner_is_listening = self.is_listening.clone();
        let inner_active_toggles = self.active_toggles.clone();
        let inner_is_recording = self.is_recording.clone();
        let inner_app_handle = self.app_handle.clone();
        let inner_last_move_ms = self.last_move_ms.clone();
        let inner_config = self.config.clone();
        let inner_abort_registrations = self.abort_registrations.clone();
        let inner_data = self.data.clone();

        // Spawn the channels
        let (schan_execute, rchan_execute) = tokio::sync::mpsc::unbounded_channel();

        // Create the executor
        thread::spawn(move || {
            keypress_executor_sender(rchan_execute);
        });

        let _grabber = task::spawn_blocking(move || {
            let keys_pressed: KeysPressed = KeysPressed::default();

            rdev::grab(move |event: rdev::Event| {
                // Check recording hotkey (works regardless of listening/recording state)
                if let rdev::EventType::KeyPress(key) = event.event_type {
                    let hid = SCANCODE_TO_HID.get(&key).copied().unwrap_or(0);
                    let recording_hotkey = inner_config.blocking_read().recording_hotkey;
                    if let Some(hotkey) = recording_hotkey {
                        if hid == hotkey {
                            let is_rec = inner_is_recording.load(Ordering::Relaxed);
                            let new_state = !is_rec;
                            if new_state {
                                inner_last_move_ms.store(0, Ordering::Relaxed);
                                inner_is_recording.store(true, Ordering::Relaxed);
                                inner_is_listening.store(false, Ordering::Relaxed);
                            } else {
                                inner_is_recording.store(false, Ordering::Relaxed);
                                inner_is_listening.store(true, Ordering::Relaxed);
                            }
                            if let Ok(guard) = inner_app_handle.lock() {
                                if let Some(handle) = guard.as_ref() {
                                    handle.emit_all("recording_state", new_state).ok();
                                }
                            }
                            return None;
                        }
                    }
                }

                // Recording mode: emit events to frontend and pass through
                if inner_is_recording.load(Ordering::Relaxed) {
                    let timestamp_ms = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_millis() as u64;

                    let maybe_event: Option<RecordedEvent> = match &event.event_type {
                        rdev::EventType::KeyPress(key) => {
                            SCANCODE_TO_HID.get(key).map(|&hid| RecordedEvent::KeyPress { hid_code: hid, timestamp_ms })
                        }
                        rdev::EventType::KeyRelease(key) => {
                            SCANCODE_TO_HID.get(key).map(|&hid| RecordedEvent::KeyRelease { hid_code: hid, timestamp_ms })
                        }
                        rdev::EventType::ButtonPress(button) => {
                            let code = BUTTON_TO_HID.get(button).copied().unwrap_or(0x101);
                            Some(RecordedEvent::ButtonPress { button_code: code, timestamp_ms })
                        }
                        rdev::EventType::ButtonRelease(button) => {
                            let code = BUTTON_TO_HID.get(button).copied().unwrap_or(0x101);
                            Some(RecordedEvent::ButtonRelease { button_code: code, timestamp_ms })
                        }
                        rdev::EventType::MouseMove { x, y } => {
                            if inner_config.blocking_read().record_mouse_movement {
                                let last = inner_last_move_ms.load(Ordering::Relaxed);
                                if timestamp_ms.saturating_sub(last) >= 8 {
                                    inner_last_move_ms.store(timestamp_ms, Ordering::Relaxed);
                                    Some(RecordedEvent::MouseMove { x: *x as i32, y: *y as i32, timestamp_ms })
                                } else { None }
                            } else { None }
                        }
                        _ => None,
                    };

                    if let Some(rec_event) = maybe_event {
                        if let Ok(guard) = inner_app_handle.lock() {
                            if let Some(handle) = guard.as_ref() {
                                handle.emit_all("recording_event", rec_event).ok();
                            }
                        }
                    }

                    return Some(event); // always pass through during recording
                }

                if inner_is_listening.load(Ordering::Relaxed) {
                    match event.event_type {
                        rdev::EventType::KeyPress(key) => {
                            debug!("Key Pressed RAW: {:?}", key);
                            let key_to_push = key;

                            let pressed_keys_copy_converted: Vec<u32> = {
                                let mut keys_pressed = keys_pressed.0.blocking_write();

                                keys_pressed.push(key_to_push);

                                *keys_pressed = keys_pressed.clone().into_iter().unique().collect();

                                keys_pressed
                                    .iter()
                                    .map(|x| *SCANCODE_TO_HID.get(x).unwrap_or(&0))
                                    .collect()
                            };

                            debug!(
                                "Pressed Keys CONVERTED TO HID:  {:?}",
                                pressed_keys_copy_converted
                            );
                            debug!(
                                "Pressed Keys CONVERTED TO RDEV: {:?}",
                                pressed_keys_copy_converted
                                    .par_iter()
                                    .map(|x| *SCANCODE_TO_RDEV
                                        .get(x)
                                        .unwrap_or(&rdev::Key::Unknown(0)))
                                    .collect::<Vec<rdev::Key>>()
                            );

                            let first_key: u32 = pressed_keys_copy_converted
                                .first()
                                .copied()
                                .unwrap_or_default();

                            // Check if this key is an abort key for any running macro
                            if let Ok(regs) = inner_abort_registrations.lock() {
                                if let Some(cancel_flags) = regs.get(&first_key) {
                                    for flag in cancel_flags {
                                        flag.store(true, Ordering::Relaxed);
                                    }
                                }
                            }

                            // Check collection toggle keys
                            let toggle_idx = {
                                let data_guard = inner_data.blocking_read();
                                data_guard.data.iter().position(|col| col.toggle_key == Some(first_key))
                            };
                            if let Some(idx) = toggle_idx {
                                if let Ok(app_guard) = inner_app_handle.lock() {
                                    if let Some(handle) = app_guard.as_ref() {
                                        handle.emit_all("collection_toggled", idx).ok();
                                    }
                                }
                                return None;
                            }

                            let trigger_list = inner_triggers.blocking_read().clone();

                            let check_these_macros = trigger_list
                                .get(&first_key)
                                .cloned()
                                .unwrap_or_default()
                                .to_vec();

                            // Suppress key press for trigger_on_release macros so
                            // the default key action doesn't fire before the release.
                            let has_release_trigger = check_these_macros
                                .iter()
                                .any(|m| m.trigger_on_release);

                            let should_grab = {
                                if !check_these_macros.is_empty() {
                                    let channel_copy_send = schan_execute.clone();
                                    let active_toggles_copy = inner_active_toggles.clone();
                                    let abort_regs_copy = inner_abort_registrations.clone();
                                    check_macro_execution_efficiently(
                                        pressed_keys_copy_converted,
                                        check_these_macros,
                                        channel_copy_send,
                                        active_toggles_copy,
                                        abort_regs_copy,
                                        false,
                                    )
                                } else {
                                    false
                                }
                            };

                            if should_grab || has_release_trigger {
                                None
                            } else {
                                Some(event)
                            }
                        }

                        rdev::EventType::KeyRelease(key) => {
                            keys_pressed.0.blocking_write().retain(|x| *x != key);

                            // Stop any OnHold macro triggered by this key
                            let hid = SCANCODE_TO_HID.get(&key).copied().unwrap_or(0);
                            let hold_key = format!("onhold_{}", hid);
                            {
                                let mut toggles = inner_active_toggles.blocking_lock();
                                if let Some(handle) = toggles.remove(&hold_key) {
                                    handle.abort();
                                }
                            }

                            // Check trigger_on_release macros
                            let trigger_list = inner_triggers.blocking_read().clone();
                            let release_macros = trigger_list.get(&hid).cloned().unwrap_or_default();
                            if !release_macros.is_empty() {
                                check_macro_execution_efficiently(
                                    vec![hid],
                                    release_macros,
                                    schan_execute.clone(),
                                    inner_active_toggles.clone(),
                                    inner_abort_registrations.clone(),
                                    true,
                                );
                            }

                            debug!("Key state: {:?}", keys_pressed.0.blocking_read());

                            Some(event)
                        }

                        rdev::EventType::ButtonPress(button) => {
                            debug!("Button pressed: {:?}", button);

                            let converted_button_to_u32: u32 =
                                BUTTON_TO_HID.get(&button).unwrap_or(&0x101).to_owned();

                            let trigger_list = inner_triggers.blocking_read().clone();

                            let check_these_macros =
                                match trigger_list.get(&converted_button_to_u32) {
                                    None => {
                                        vec![]
                                    }
                                    Some(data_found) => data_found.to_vec(),
                                };

                            let channel_clone = schan_execute.clone();
                            let active_toggles_copy = inner_active_toggles.clone();
                            let abort_regs_copy = inner_abort_registrations.clone();

                            let should_grab = check_macro_execution_efficiently(
                                vec![converted_button_to_u32],
                                check_these_macros,
                                channel_clone,
                                active_toggles_copy,
                                abort_regs_copy,
                                false,
                            );

                            // Left mouse button never gets consumed to allow users to control their PC.
                            match (should_grab, button) {
                                (true, rdev::Button::Left) => Some(event),
                                (true, _) => None,
                                (false, _) => Some(event),
                            }
                        }
                        rdev::EventType::ButtonRelease(button) => {
                            debug!("Button released: {:?}", button);

                            Some(event)
                        }
                        rdev::EventType::MouseMove { .. } => Some(event),
                        rdev::EventType::Wheel { .. } => Some(event),
                    }
                } else {
                    Some(event)
                }
            })
        });
        Err(anyhow::Error::msg("Error in grabbing thread!"))
    }
}

impl Default for MacroBackend {
    /// Generates a new state.
    fn default() -> Self {
        let macro_data =
            MacroData::read_data().unwrap_or_else(|err| panic!("Cannot get macro data! {}", err));

        let triggers = macro_data
            .extract_triggers()
            .expect("error extracting triggers");
        MacroBackend {
            data: Arc::new(RwLock::from(macro_data)),
            config: Arc::new(RwLock::from(
                ApplicationConfig::read_data().expect("error reading config"),
            )),
            triggers: Arc::new(RwLock::from(triggers)),
            is_listening: Arc::new(AtomicBool::new(true)),
            active_toggles: Arc::new(Mutex::new(HashMap::new())),
            is_recording: Arc::new(AtomicBool::new(false)),
            app_handle: Arc::new(std::sync::Mutex::new(None)),
            last_move_ms: Arc::new(AtomicU64::new(0)),
            abort_registrations: Arc::new(std::sync::Mutex::new(HashMap::new())),
        }
    }
}
