use anyhow::Result;
use log::*;
use serde_repr;
use tokio::sync::mpsc::UnboundedSender;

pub use rdev;

use std::time;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Hash, Eq)]
#[serde(tag = "type")]
/// Mouse action: Press presses a defined button. Move moves to absolute coordinates X and Y.
///
/// ! **UNIMPLEMENTED** - Moving a mouse is only implemented on the backend and no frontend implementation exists yet. Feel free to contribute.
pub enum MouseAction {
    Press { data: MousePressAction },
    Move { x: i32, y: i32 },
    Scroll { delta_x: i32, delta_y: i32 },
}

#[derive(
    Debug, Clone, serde_repr::Serialize_repr, serde_repr::Deserialize_repr, PartialEq, Hash, Eq,
)]
#[serde(tag = "type")]
#[repr(u16)]
/// Mouse buttons have a specified non-collisional number with the HID codes internally used within the library.
pub enum MouseButton {
    Left = 0x101,
    Right = 0x102,
    Middle = 0x103,
    Mouse4 = 0x104,
    Mouse5 = 0x105,
    Mouse6 = 0x106,
    Mouse7 = 0x107,
    Mouse8 = 0x108,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Hash, Eq)]
#[serde(tag = "type")]
/// Mouse press action: Press presses a defined button. Release releases a defined button.
/// DownUp presses and releases a defined button.
pub enum MousePressAction {
    Down { button: MouseButton },
    Up { button: MouseButton },
    DownUp { button: MouseButton, duration: u32 },
}

impl MouseAction {
    /// Creates a new MouseAction from a rdev event and sends it to the channel for async execution.
    pub async fn execute(&self, send_channel: UnboundedSender<rdev::EventType>) -> Result<()> {
        match &self {
            MouseAction::Press { data } => match data {
                MousePressAction::Down { button } => {
                    send_channel.send(rdev::EventType::ButtonPress(button.into()))?;
                }
                MousePressAction::Up { button } => {
                    send_channel.send(rdev::EventType::ButtonRelease(button.into()))?;
                }
                MousePressAction::DownUp { button, duration } => {
                    send_channel.send(rdev::EventType::ButtonPress(button.into()))?;

                    tokio::time::sleep(time::Duration::from_millis(*duration as u64)).await;

                    send_channel.send(rdev::EventType::ButtonRelease(button.into()))?;
                }
            },

            MouseAction::Move { x, y } => {
                let display_size = rdev::display_size().map_err(|err| {
                    anyhow::Error::msg(format!("Error getting displays: {:?}", err))
                })?;
                info!("Display size: {:?}", display_size);

                send_channel.send(rdev::EventType::MouseMove {
                    x: *x as f64,
                    y: *y as f64,
                })?;
            }

            MouseAction::Scroll { delta_x, delta_y } => {
                #[cfg(target_os = "windows")]
                {
                    use std::mem;
                    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
                        SendInput, INPUT, INPUT_0, INPUT_MOUSE, MOUSEINPUT,
                    };
                    const MOUSEEVENTF_WHEEL: u32 = 0x0800;
                    const MOUSEEVENTF_HWHEEL: u32 = 0x1000;
                    // Windows WHEEL: positive mouseData = scroll up.
                    // Our delta_y: negative = scroll up → negate.
                    if *delta_y != 0 {
                        let wheel_data = (-(*delta_y)) * 120;
                        let input = INPUT {
                            r#type: INPUT_MOUSE,
                            Anonymous: INPUT_0 {
                                mi: MOUSEINPUT {
                                    dx: 0,
                                    dy: 0,
                                    mouseData: wheel_data,
                                    dwFlags: MOUSEEVENTF_WHEEL,
                                    time: 0,
                                    dwExtraInfo: 0,
                                },
                            },
                        };
                        unsafe { SendInput(1, &input, mem::size_of::<INPUT>() as i32); }
                    }
                    // Windows HWHEEL: positive mouseData = scroll right.
                    // Our delta_x: positive = scroll right → same sign.
                    if *delta_x != 0 {
                        let wheel_data = *delta_x * 120;
                        let input = INPUT {
                            r#type: INPUT_MOUSE,
                            Anonymous: INPUT_0 {
                                mi: MOUSEINPUT {
                                    dx: 0,
                                    dy: 0,
                                    mouseData: wheel_data,
                                    dwFlags: MOUSEEVENTF_HWHEEL,
                                    time: 0,
                                    dwExtraInfo: 0,
                                },
                            },
                        };
                        unsafe { SendInput(1, &input, mem::size_of::<INPUT>() as i32); }
                    }
                }
                #[cfg(not(target_os = "windows"))]
                {
                    send_channel.send(rdev::EventType::Wheel {
                        delta_x: *delta_x as i64,
                        delta_y: *delta_y as i64,
                    })?;
                }
            }
        }
        Ok(())
    }
}
