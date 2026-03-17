use std::path::PathBuf;
use std::{time, vec};

use anyhow::Result;
use copypasta::{ClipboardContext, ClipboardProvider};
use log::warn;
use fastrand;
use rdev;
use tokio::sync::mpsc::UnboundedSender;
use url::Url;

use super::util;

#[cfg(target_os = "windows")]
async fn type_text_unicode(text: &str, delay_ms: u32) -> Result<()> {
    use std::mem;
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::*;

    for c in text.chars() {
        let mut buf = [0u16; 2];
        let len = c.encode_utf16(&mut buf).len();

        let mut inputs = Vec::new();
        for &scan in &buf[..len] {
            inputs.push(INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: 0,
                        wScan: scan,
                        dwFlags: KEYEVENTF_UNICODE,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            });
            inputs.push(INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: 0,
                        wScan: scan,
                        dwFlags: KEYEVENTF_UNICODE | KEYEVENTF_KEYUP,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            });
        }
        unsafe {
            SendInput(inputs.len() as u32, inputs.as_ptr(), mem::size_of::<INPUT>() as i32);
        }
        tokio::time::sleep(std::time::Duration::from_millis(delay_ms as u64)).await;
    }
    Ok(())
}

// Frequently used keys within the code.
const COPY_HOTKEY: [rdev::Key; 2] = [rdev::Key::ControlLeft, rdev::Key::KeyC];
const PASTE_HOTKEY: [rdev::Key; 2] = [rdev::Key::ControlLeft, rdev::Key::KeyV];

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Hash, Eq)]
#[serde(tag = "type")]
pub enum DirectoryAction {
    File { data: PathBuf },
    Directory { data: PathBuf },
    Website { data: Url },
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Hash, Eq)]
#[serde(tag = "type")]
/// Types of actions related to the OS to perform.
pub enum SystemAction {
    Open { action: DirectoryAction },
    Volume { action: VolumeAction },
    Clipboard { action: ClipboardAction },
}

impl SystemAction {
    /// Execute the keys themselves.
    pub async fn execute(&self, send_channel: UnboundedSender<rdev::EventType>) -> Result<()> {
        match &self {
            SystemAction::Open { action } => match action {
                DirectoryAction::Directory { data } | DirectoryAction::File { data } => {
                    opener::open(data)?;
                }
                DirectoryAction::Website { data } => {
                    // The open_browser explicitly opens the path in a browser window.
                    opener::open_browser(data.as_str())?;
                }
            },
            SystemAction::Volume { action } => match action {
                VolumeAction::ToggleMute => {
                    util::direct_send_key(&send_channel, vec![rdev::Key::VolumeMute]).await?;
                }
                VolumeAction::LowerVolume => {
                    util::direct_send_key(&send_channel, vec![rdev::Key::VolumeDown]).await?;
                }
                VolumeAction::IncreaseVolume => {
                    util::direct_send_key(&send_channel, vec![rdev::Key::VolumeUp]).await?;
                }
            },
            SystemAction::Clipboard { action } => match action {
                ClipboardAction::SetClipboard { data } => {
                    ClipboardContext::new()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?
                        .set_contents(data.to_owned())
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;
                }
                ClipboardAction::Copy => {
                    util::direct_send_hotkey(&send_channel, COPY_HOTKEY.to_vec()).await?;
                }
                ClipboardAction::GetClipboard => {
                    ClipboardContext::new()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?
                        .get_contents()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;
                }
                ClipboardAction::Paste => {
                    util::direct_send_hotkey(&send_channel, PASTE_HOTKEY.to_vec()).await?;
                }

                ClipboardAction::PasteUserDefinedString { data } => {
                    if data.is_empty() {
                        return Ok(());
                    }
                    let mut ctx = ClipboardContext::new()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    // Save the current clipboard content so we can restore it after pasting.
                    let previous_content = ctx.get_contents().ok();

                    ctx.set_contents(data.to_owned())
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    util::direct_send_hotkey(&send_channel, PASTE_HOTKEY.to_vec()).await?;

                    // Give the OS a moment to complete the paste before restoring.
                    tokio::time::sleep(time::Duration::from_millis(50)).await;

                    if let Some(prev) = previous_content {
                        ctx.set_contents(prev)
                            .unwrap_or_else(|err| warn!("Failed to restore clipboard: {}", err));
                    }
                }

                ClipboardAction::TypeText { data, delay_ms } => {
                    if data.is_empty() {
                        return Ok(());
                    }
                    #[cfg(target_os = "windows")]
                    type_text_unicode(data, *delay_ms).await?;
                    #[cfg(not(target_os = "windows"))]
                    {
                        // Fallback on non-Windows: use clipboard paste
                        let mut ctx = ClipboardContext::new()
                            .map_err(|err| anyhow::Error::msg(err.to_string()))?;
                        let previous_content = ctx.get_contents().ok();
                        ctx.set_contents(data.to_owned())
                            .map_err(|err| anyhow::Error::msg(err.to_string()))?;
                        util::direct_send_hotkey(&send_channel, PASTE_HOTKEY.to_vec()).await?;
                        tokio::time::sleep(time::Duration::from_millis(50)).await;
                        if let Some(prev) = previous_content {
                            ctx.set_contents(prev).unwrap_or(());
                        }
                    }
                }

                ClipboardAction::Sarcasm => {
                    let mut ctx = ClipboardContext::new()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    // Copy the text
                    util::direct_send_hotkey(&send_channel, COPY_HOTKEY.to_vec()).await?;

                    // Delay is required to make Discord, and some other apps cooperate properly.
                    tokio::time::sleep(time::Duration::from_millis(10)).await;

                    // Transform the text
                    let content = transform_text(
                        ctx.get_contents()
                            .map_err(|err| anyhow::Error::msg(err.to_string()))?,
                    );

                    ctx.set_contents(content)
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    // Paste the text again
                    util::direct_send_hotkey(&send_channel, PASTE_HOTKEY.to_vec()).await?;
                }

                ClipboardAction::TextTransform { variant, count } => {
                    let mut ctx = ClipboardContext::new()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    util::direct_send_hotkey(&send_channel, COPY_HOTKEY.to_vec()).await?;
                    tokio::time::sleep(time::Duration::from_millis(10)).await;

                    let content = ctx.get_contents()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    let transformed = match variant.as_str() {
                        "uppercase" => content.to_uppercase(),
                        "lowercase" => content.to_lowercase(),
                        "titlecase" => content.split_whitespace()
                            .map(|word| {
                                let mut chars = word.chars();
                                match chars.next() {
                                    None => String::new(),
                                    Some(first) => {
                                        let upper: String = first.to_uppercase().collect();
                                        upper + chars.as_str()
                                    }
                                }
                            })
                            .collect::<Vec<_>>()
                            .join(" "),
                        "repeat" => content.repeat(count.unwrap_or(2) as usize),
                        _ => content,
                    };

                    ctx.set_contents(transformed)
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;
                    util::direct_send_hotkey(&send_channel, PASTE_HOTKEY.to_vec()).await?;
                }

                ClipboardAction::TextEffect { variant } => {
                    let mut ctx = ClipboardContext::new()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    util::direct_send_hotkey(&send_channel, COPY_HOTKEY.to_vec()).await?;
                    tokio::time::sleep(time::Duration::from_millis(10)).await;

                    let content = ctx.get_contents()
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;

                    let transformed = match variant.as_str() {
                        "sarcasm" => transform_text(content),
                        "reverse" => content.chars().rev().collect(),
                        "leetspeak" => content.chars().map(|c| match c {
                            'e' | 'E' => '3',
                            'a' | 'A' => '4',
                            'i' | 'I' => '1',
                            'o' | 'O' => '0',
                            't' | 'T' => '7',
                            _ => c,
                        }).collect(),
                        _ => content,
                    };

                    ctx.set_contents(transformed)
                        .map_err(|err| anyhow::Error::msg(err.to_string()))?;
                    util::direct_send_hotkey(&send_channel, PASTE_HOTKEY.to_vec()).await?;
                }
            },
        }
        Ok(())
    }
}

/// Transforms the text into a sarcastic version.
fn transform_text(text: String) -> String {
    text.chars()
        .map(|c| {
            if c.is_ascii_alphabetic() && fastrand::bool() {
                if c.is_ascii_lowercase() {
                    c.to_ascii_uppercase()
                } else {
                    c.to_ascii_lowercase()
                }
            } else {
                c
            }
        })
        .collect()
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Hash, Eq)]
#[serde(tag = "type")]
/// The type of action to perform. This is used to determine which action to perform.
pub enum ClipboardAction {
    SetClipboard { data: String },
    Copy,
    GetClipboard,
    Paste,
    PasteUserDefinedString { data: String },
    TypeText { data: String, delay_ms: u32 },
    Sarcasm,
    TextTransform { variant: String, #[serde(default)] count: Option<u32> },
    TextEffect { variant: String },
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Hash, Eq)]
#[serde(tag = "type")]
/// Key shortcut alias to mute/increase/decrease volume.
pub enum VolumeAction {
    LowerVolume,
    IncreaseVolume,
    ToggleMute,
}
