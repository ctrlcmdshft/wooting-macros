use crate::hid_table::RDEV_MODIFIER_KEYS;
use anyhow::Result;
use log::*;
use rdev;
use tokio::sync::mpsc::UnboundedSender;

/// Sends an event to the library to Execute on an OS level. This makes it easier to implement keypresses in custom code.
pub fn direct_send_event(event_type: &rdev::EventType) -> Result<()> {
    trace!("Sending event: {:?}", event_type);

    #[cfg(target_os = "windows")]
    if let rdev::EventType::MouseMove { x, y } = event_type {
        use std::mem;
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_0, INPUT_MOUSE, MOUSEINPUT,
        };
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            GetSystemMetrics, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN,
            SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN,
        };
        const MOUSEEVENTF_MOVE: u32 = 0x0001;
        const MOUSEEVENTF_ABSOLUTE: u32 = 0x8000;
        const MOUSEEVENTF_VIRTUALDESK: u32 = 0x4000;
        let (vx, vy, vw, vh) = unsafe {(
            GetSystemMetrics(SM_XVIRTUALSCREEN),
            GetSystemMetrics(SM_YVIRTUALSCREEN),
            GetSystemMetrics(SM_CXVIRTUALSCREEN),
            GetSystemMetrics(SM_CYVIRTUALSCREEN),
        )};
        let norm_x = ((*x as i32 - vx) as f64 * 65535.0 / (vw - 1).max(1) as f64) as i32;
        let norm_y = ((*y as i32 - vy) as f64 * 65535.0 / (vh - 1).max(1) as f64) as i32;
        let input = INPUT {
            r#type: INPUT_MOUSE,
            Anonymous: INPUT_0 {
                mi: MOUSEINPUT {
                    dx: norm_x,
                    dy: norm_y,
                    mouseData: 0,
                    dwFlags: MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        };
        unsafe { SendInput(1, &input, mem::size_of::<INPUT>() as i32); }
        return Ok(());
    }

    rdev::simulate(event_type)?;
    Ok(())
}
/// Sends a vector of keys to get processed
pub async fn direct_send_key(
    send_channel: &UnboundedSender<rdev::EventType>,
    key: Vec<rdev::Key>,
) -> Result<()> {
    for press in key.iter() {
        send_channel.send(rdev::EventType::KeyPress(*press))?;

        send_channel.send(rdev::EventType::KeyRelease(*press))?;
    }
    Ok(())
}

/// Sends a vector of hotkeys to get processed
pub async fn direct_send_hotkey(
    send_channel: &UnboundedSender<rdev::EventType>,
    key: Vec<rdev::Key>,
) -> Result<()> {
    for press in key.iter() {
        send_channel.send(rdev::EventType::KeyPress(*press))?;
    }

    for press in key.iter().rev() {
        send_channel.send(rdev::EventType::KeyRelease(*press))?;
    }

    Ok(())
}

// Disabled until a better fix is done
// /// Lifts the keys pressed
pub fn lift_keys(
    pressed_events: &[u32],
    channel_sender: &UnboundedSender<rdev::EventType>,
) -> Result<()> {
    let mut pressed_events_local = pressed_events.to_owned();

    pressed_events_local.retain(|id_key| {
        RDEV_MODIFIER_KEYS
            .iter()
            .any(|rdev_key| super::super::SCANCODE_TO_RDEV[id_key] == *rdev_key)
    });

    for key in pressed_events_local.iter() {
        channel_sender.send(rdev::EventType::KeyRelease(
            super::super::SCANCODE_TO_RDEV[key],
        ))?;
    }

    Ok(())
}
