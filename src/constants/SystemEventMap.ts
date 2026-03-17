import { SystemAction } from '../types'

export interface SystemEventInfo {
  type: string
  subtype: string
  displayString: string
  defaultData: SystemAction
  description: string
}

export class SystemEvent {
  static get OpenFile(): SystemEventInfo {
    return {
      type: 'Open',
      subtype: 'File',
      displayString: 'Open File',
      defaultData: { type: 'Open', action: { type: 'File', data: '' } },
      description: "Opens any file on your computer."
    }
  }
  static get OpenFolder(): SystemEventInfo {
    return {
      type: 'Open',
      subtype: 'Directory',
      displayString: 'Open Folder',
      defaultData: { type: 'Open', action: { type: 'Directory', data: '' } },
      description: "Opens up a file explorer window to the specified folder."
    }
  }
  static get OpenWebsite(): SystemEventInfo {
    return {
      type: 'Open',
      subtype: 'Website',
      displayString: 'Open Website',
      defaultData: { type: 'Open', action: { type: 'Website', data: '' } },
      description: "Opens up a website in your default browser."
    }
  }

  static get Clipboard(): SystemEventInfo {
    return {
      type: 'Clipboard',
      subtype: 'PasteUserDefinedString',
      displayString: 'Paste Text',
      defaultData: {
        type: 'Clipboard',
        action: { type: 'PasteUserDefinedString', data: '' }
      },
      description: "Pastes the specified text into a currently selected text input area."
    }
  }
  static get TextTransform(): SystemEventInfo {
    return {
      type: 'Clipboard',
      subtype: 'TextTransform',
      displayString: 'Text Transform',
      defaultData: { type: 'Clipboard', action: { type: 'TextTransform', variant: 'uppercase' } },
      description: 'Transforms the selected text — uppercase, lowercase, title case, or repeat.'
    }
  }
  static get TextEffect(): SystemEventInfo {
    return {
      type: 'Clipboard',
      subtype: 'TextEffect',
      displayString: 'Text Effect',
      defaultData: { type: 'Clipboard', action: { type: 'TextEffect', variant: 'sarcasm' } },
      description: 'Applies a fun effect to the selected text — sarcasm, reverse, or leetspeak.'
    }
  }
  static get TypeText(): SystemEventInfo {
    return {
      type: 'Clipboard',
      subtype: 'TypeText',
      displayString: 'Type Text',
      defaultData: { type: 'Clipboard', action: { type: 'TypeText', data: '', delay_ms: 30 } },
      description: "Types text character by character — works where paste is blocked (games, login screens, etc.)."
    }
  }
  static get Copy(): SystemEventInfo {
    return {
      type: 'Clipboard',
      subtype: 'Copy',
      displayString: 'Copy',
      defaultData: { type: 'Clipboard', action: { type: 'Copy' } },
      description: "Copies the currently selected text (Ctrl+C)."
    }
  }
  static get Paste(): SystemEventInfo {
    return {
      type: 'Clipboard',
      subtype: 'Paste',
      displayString: 'Paste',
      defaultData: { type: 'Clipboard', action: { type: 'Paste' } },
      description: "Pastes the current clipboard content (Ctrl+V)."
    }
  }

  static readonly all: SystemEventInfo[] = [
    SystemEvent.OpenFile,
    SystemEvent.OpenFolder,
    SystemEvent.OpenWebsite,
    SystemEvent.Copy,
    SystemEvent.Paste,
    SystemEvent.Clipboard,
    SystemEvent.TypeText,
    SystemEvent.TextTransform,
    SystemEvent.TextEffect,
  ]
}

export const sysEventLookup = new Map<string, SystemEventInfo>(
  SystemEvent.all
    .filter((event) => event.subtype !== undefined)
    .map((event) => [event.subtype!, event])
)
