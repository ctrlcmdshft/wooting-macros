import { HIDCategory } from './enums'

export interface HidInfo {
  HIDcode: number
  category: HIDCategory
  displayString: string
  webKeyId: string
  whichID: number
  locationID?: number
  colSpan?: number
  allowAtStartOfTrigger?: boolean
}

export class Hid {
  static get A(): HidInfo {
    return {
      HIDcode: 4,
      category: HIDCategory.Alphanumeric,
      displayString: 'A',
      webKeyId: 'KeyA',
      whichID: 65
    }
  }

  static get B(): HidInfo {
    return {
      HIDcode: 5,
      category: HIDCategory.Alphanumeric,
      displayString: 'B',
      webKeyId: 'KeyB',
      whichID: 66
    }
  }

  static get C(): HidInfo {
    return {
      HIDcode: 6,
      category: HIDCategory.Alphanumeric,
      displayString: 'C',
      webKeyId: 'KeyC',
      whichID: 67
    }
  }

  static get D(): HidInfo {
    return {
      HIDcode: 7,
      category: HIDCategory.Alphanumeric,
      displayString: 'D',
      webKeyId: 'KeyD',
      whichID: 68
    }
  }

  static get E(): HidInfo {
    return {
      HIDcode: 8,
      category: HIDCategory.Alphanumeric,
      displayString: 'E',
      webKeyId: 'KeyE',
      whichID: 69
    }
  }

  static get F(): HidInfo {
    return {
      HIDcode: 9,
      category: HIDCategory.Alphanumeric,
      displayString: 'F',
      webKeyId: 'KeyF',
      whichID: 70
    }
  }

  static get G(): HidInfo {
    return {
      HIDcode: 10,
      category: HIDCategory.Alphanumeric,
      displayString: 'G',
      webKeyId: 'KeyG',
      whichID: 71
    }
  }

  static get H(): HidInfo {
    return {
      HIDcode: 11,
      category: HIDCategory.Alphanumeric,
      displayString: 'H',
      webKeyId: 'KeyH',
      whichID: 72
    }
  }

  static get I(): HidInfo {
    return {
      HIDcode: 12,
      category: HIDCategory.Alphanumeric,
      displayString: 'I',
      webKeyId: 'KeyI',
      whichID: 73
    }
  }

  static get J(): HidInfo {
    return {
      HIDcode: 13,
      category: HIDCategory.Alphanumeric,
      displayString: 'J',
      webKeyId: 'KeyJ',
      whichID: 74
    }
  }

  static get K(): HidInfo {
    return {
      HIDcode: 14,
      category: HIDCategory.Alphanumeric,
      displayString: 'K',
      webKeyId: 'KeyK',
      whichID: 75
    }
  }

  static get L(): HidInfo {
    return {
      HIDcode: 15,
      category: HIDCategory.Alphanumeric,
      displayString: 'L',
      webKeyId: 'KeyL',
      whichID: 76
    }
  }

  static get M(): HidInfo {
    return {
      HIDcode: 16,
      category: HIDCategory.Alphanumeric,
      displayString: 'M',
      webKeyId: 'KeyM',
      whichID: 77
    }
  }

  static get N(): HidInfo {
    return {
      HIDcode: 17,
      category: HIDCategory.Alphanumeric,
      displayString: 'N',
      webKeyId: 'KeyN',
      whichID: 78
    }
  }

  static get O(): HidInfo {
    return {
      HIDcode: 18,
      category: HIDCategory.Alphanumeric,
      displayString: 'O',
      webKeyId: 'KeyO',
      whichID: 79
    }
  }

  static get P(): HidInfo {
    return {
      HIDcode: 19,
      category: HIDCategory.Alphanumeric,
      displayString: 'P',
      webKeyId: 'KeyP',
      whichID: 80
    }
  }

  static get Q(): HidInfo {
    return {
      HIDcode: 20,
      category: HIDCategory.Alphanumeric,
      displayString: 'Q',
      webKeyId: 'KeyQ',
      whichID: 81
    }
  }

  static get R(): HidInfo {
    return {
      HIDcode: 21,
      category: HIDCategory.Alphanumeric,
      displayString: 'R',
      webKeyId: 'KeyR',
      whichID: 82
    }
  }

  static get S(): HidInfo {
    return {
      HIDcode: 22,
      category: HIDCategory.Alphanumeric,
      displayString: 'S',
      webKeyId: 'KeyS',
      whichID: 83
    }
  }

  static get T(): HidInfo {
    return {
      HIDcode: 23,
      category: HIDCategory.Alphanumeric,
      displayString: 'T',
      webKeyId: 'KeyT',
      whichID: 84
    }
  }

  static get U(): HidInfo {
    return {
      HIDcode: 24,
      category: HIDCategory.Alphanumeric,
      displayString: 'U',
      webKeyId: 'KeyU',
      whichID: 85
    }
  }

  static get V(): HidInfo {
    return {
      HIDcode: 25,
      category: HIDCategory.Alphanumeric,
      displayString: 'V',
      webKeyId: 'KeyV',
      whichID: 86
    }
  }

  static get W(): HidInfo {
    return {
      HIDcode: 26,
      category: HIDCategory.Alphanumeric,
      displayString: 'W',
      webKeyId: 'KeyW',
      whichID: 87
    }
  }

  static get X(): HidInfo {
    return {
      HIDcode: 27,
      category: HIDCategory.Alphanumeric,
      displayString: 'X',
      webKeyId: 'KeyX',
      whichID: 88
    }
  }

  static get Y(): HidInfo {
    return {
      HIDcode: 28,
      category: HIDCategory.Alphanumeric,
      displayString: 'Y',
      webKeyId: 'KeyY',
      whichID: 89
    }
  }

  static get Z(): HidInfo {
    return {
      HIDcode: 29,
      category: HIDCategory.Alphanumeric,
      displayString: 'Z',
      webKeyId: 'KeyZ',
      whichID: 90
    }
  }

  static get N1(): HidInfo {
    return {
      HIDcode: 30,
      category: HIDCategory.Alphanumeric,
      displayString: '1',
      webKeyId: 'Digit1',
      whichID: 49
    }
  }

  static get N2(): HidInfo {
    return {
      HIDcode: 31,
      category: HIDCategory.Alphanumeric,
      displayString: '2',
      webKeyId: 'Digit2',
      whichID: 50
    }
  }

  static get N3(): HidInfo {
    return {
      HIDcode: 32,
      category: HIDCategory.Alphanumeric,
      displayString: '3',
      webKeyId: 'Digit3',
      whichID: 51
    }
  }

  static get N4(): HidInfo {
    return {
      HIDcode: 33,
      category: HIDCategory.Alphanumeric,
      displayString: '4',
      webKeyId: 'Digit4',
      whichID: 52
    }
  }

  static get N5(): HidInfo {
    return {
      HIDcode: 34,
      category: HIDCategory.Alphanumeric,
      displayString: '5',
      webKeyId: 'Digit5',
      whichID: 53
    }
  }

  static get N6(): HidInfo {
    return {
      HIDcode: 35,
      category: HIDCategory.Alphanumeric,
      displayString: '6',
      webKeyId: 'Digit6',
      whichID: 54
    }
  }

  static get N7(): HidInfo {
    return {
      HIDcode: 36,
      category: HIDCategory.Alphanumeric,
      displayString: '7',
      webKeyId: 'Digit7',
      whichID: 55
    }
  }

  static get N8(): HidInfo {
    return {
      HIDcode: 37,
      category: HIDCategory.Alphanumeric,
      displayString: '8',
      webKeyId: 'Digit8',
      whichID: 56
    }
  }

  static get N9(): HidInfo {
    return {
      HIDcode: 38,
      category: HIDCategory.Alphanumeric,
      displayString: '9',
      webKeyId: 'Digit9',
      whichID: 57
    }
  }

  static get N0(): HidInfo {
    return {
      HIDcode: 39,
      category: HIDCategory.Alphanumeric,
      displayString: '0',
      webKeyId: 'Digit0',
      whichID: 48
    }
  }

  static get ENTER(): HidInfo {
    return {
      HIDcode: 40,
      category: HIDCategory.Alphanumeric,
      displayString: 'Enter',
      webKeyId: 'Enter',
      colSpan: 2,
      whichID: 13
    }
  }

  static get ESCAPE(): HidInfo {
    return {
      HIDcode: 41,
      category: HIDCategory.Alphanumeric,
      displayString: 'Escape',
      webKeyId: 'Escape',
      colSpan: 2,
      whichID: 27
    }
  }

  static get BACKSPACE(): HidInfo {
    return {
      HIDcode: 42,
      category: HIDCategory.Alphanumeric,
      displayString: 'Backspace',
      webKeyId: 'Backspace',
      colSpan: 2,
      whichID: 8
    }
  }

  static get TAB(): HidInfo {
    return {
      HIDcode: 43,
      category: HIDCategory.Alphanumeric,
      displayString: 'Tab',
      webKeyId: 'Tab',
      whichID: 9
    }
  }

  static get SPACE(): HidInfo {
    return {
      HIDcode: 44,
      category: HIDCategory.Alphanumeric,
      displayString: 'Space',
      webKeyId: 'Space',
      colSpan: 2,
      whichID: 32
    }
  }

  static get MINUS(): HidInfo {
    return {
      HIDcode: 45,
      category: HIDCategory.Alphanumeric,
      displayString: '-',
      webKeyId: 'Minus',
      whichID: 189
    }
  }

  static get EQUAL(): HidInfo {
    return {
      HIDcode: 46,
      category: HIDCategory.Alphanumeric,
      displayString: '=',
      webKeyId: 'Equal',
      whichID: 187
    }
  }

  static get BRACKETL(): HidInfo {
    return {
      HIDcode: 47,
      category: HIDCategory.Alphanumeric,
      displayString: '[',
      webKeyId: 'BracketLeft',
      whichID: 219
    }
  }

  static get BRACKETR(): HidInfo {
    return {
      HIDcode: 48,
      category: HIDCategory.Alphanumeric,
      displayString: ']',
      webKeyId: 'BracketRight',
      whichID: 221
    }
  }

  static get BACKSLASH(): HidInfo {
    return {
      HIDcode: 49,
      category: HIDCategory.Alphanumeric,
      displayString: '\\',
      webKeyId: 'Backslash',
      whichID: 220
    }
  }

  static get SEMICOLON(): HidInfo {
    return {
      HIDcode: 51,
      category: HIDCategory.Alphanumeric,
      displayString: ';',
      webKeyId: 'Semicolon',
      whichID: 186
    }
  }

  static get QUOTE(): HidInfo {
    return {
      HIDcode: 52,
      category: HIDCategory.Alphanumeric,
      displayString: '"',
      webKeyId: 'Quote',
      whichID: 222
    }
  }

  static get BACKQUOTE(): HidInfo {
    return {
      HIDcode: 53,
      category: HIDCategory.Alphanumeric,
      displayString: '`',
      webKeyId: 'Backquote',
      whichID: 192
    }
  }

  static get COMMA(): HidInfo {
    return {
      HIDcode: 54,
      category: HIDCategory.Alphanumeric,
      displayString: ',',
      webKeyId: 'Comma',
      whichID: 77
    }
  }

  static get PERIOD(): HidInfo {
    return {
      HIDcode: 55,
      category: HIDCategory.Alphanumeric,
      displayString: '.',
      webKeyId: 'Period',
      whichID: 188
    }
  }

  static get SLASH(): HidInfo {
    return {
      HIDcode: 56,
      category: HIDCategory.Alphanumeric,
      displayString: '/',
      webKeyId: 'Slash',
      whichID: 191
    }
  }

  static get CAPSLOCK(): HidInfo {
    return {
      HIDcode: 57,
      category: HIDCategory.Alphanumeric,
      displayString: 'Caps Lock',
      webKeyId: 'CapsLock',
      colSpan: 2,
      allowAtStartOfTrigger: true,
      whichID: 20
    }
  }

  static get F1(): HidInfo {
    return {
      HIDcode: 58,
      category: HIDCategory.Function,
      displayString: 'F1',
      webKeyId: 'F1',
      whichID: 112
    }
  }

  static get F2(): HidInfo {
    return {
      HIDcode: 59,
      category: HIDCategory.Function,
      displayString: 'F2',
      webKeyId: 'F2',
      whichID: 113
    }
  }

  static get F3(): HidInfo {
    return {
      HIDcode: 60,
      category: HIDCategory.Function,
      displayString: 'F3',
      webKeyId: 'F3',
      whichID: 114
    }
  }

  static get F4(): HidInfo {
    return {
      HIDcode: 61,
      category: HIDCategory.Function,
      displayString: 'F4',
      webKeyId: 'F4',
      whichID: 115
    }
  }

  static get F5(): HidInfo {
    return {
      HIDcode: 62,
      category: HIDCategory.Function,
      displayString: 'F5',
      webKeyId: 'F5',
      whichID: 116
    }
  }

  static get F6(): HidInfo {
    return {
      HIDcode: 63,
      category: HIDCategory.Function,
      displayString: 'F6',
      webKeyId: 'F6',
      whichID: 117
    }
  }

  static get F7(): HidInfo {
    return {
      HIDcode: 64,
      category: HIDCategory.Function,
      displayString: 'F7',
      webKeyId: 'F7',
      whichID: 118
    }
  }

  static get F8(): HidInfo {
    return {
      HIDcode: 65,
      category: HIDCategory.Function,
      displayString: 'F8',
      webKeyId: 'F8',
      whichID: 119
    }
  }

  static get F9(): HidInfo {
    return {
      HIDcode: 66,
      category: HIDCategory.Function,
      displayString: 'F9',
      webKeyId: 'F9',
      whichID: 120
    }
  }

  static get F10(): HidInfo {
    return {
      HIDcode: 67,
      category: HIDCategory.Function,
      displayString: 'F10',
      webKeyId: 'F10',
      whichID: 121
    }
  }

  static get F11(): HidInfo {
    return {
      HIDcode: 68,
      category: HIDCategory.Function,
      displayString: 'F11',
      webKeyId: 'F11',
      whichID: 122
    }
  }

  static get F12(): HidInfo {
    return {
      HIDcode: 69,
      category: HIDCategory.Function,
      displayString: 'F12',
      webKeyId: 'F12',
      whichID: 123
    }
  }

  static get F13(): HidInfo {
    return {
      HIDcode: 104,
      category: HIDCategory.Function,
      displayString: 'F13',
      webKeyId: 'F13',
      whichID: 124
    }
  }

  static get F14(): HidInfo {
    return {
      HIDcode: 105,
      category: HIDCategory.Function,
      displayString: 'F14',
      webKeyId: 'F14',
      whichID: 125
    }
  }

  static get F15(): HidInfo {
    return {
      HIDcode: 106,
      category: HIDCategory.Function,
      displayString: 'F15',
      webKeyId: 'F15',
      whichID: 126
    }
  }

  static get F16(): HidInfo {
    return {
      HIDcode: 107,
      category: HIDCategory.Function,
      displayString: 'F16',
      webKeyId: 'F16',
      whichID: 127
    }
  }

  static get F17(): HidInfo {
    return {
      HIDcode: 108,
      category: HIDCategory.Function,
      displayString: 'F17',
      webKeyId: 'F17',
      whichID: 128
    }
  }

  static get F18(): HidInfo {
    return {
      HIDcode: 109,
      category: HIDCategory.Function,
      displayString: 'F18',
      webKeyId: 'F18',
      whichID: 129
    }
  }

  static get F19(): HidInfo {
    return {
      HIDcode: 110,
      category: HIDCategory.Function,
      displayString: 'F19',
      webKeyId: 'F19',
      whichID: 130
    }
  }

  static get F20(): HidInfo {
    return {
      HIDcode: 111,
      category: HIDCategory.Function,
      displayString: 'F20',
      webKeyId: 'F20',
      whichID: 131
    }
  }

  static get F21(): HidInfo {
    return {
      HIDcode: 112,
      category: HIDCategory.Function,
      displayString: 'F21',
      webKeyId: 'F21',
      whichID: 132
    }
  }

  static get F22(): HidInfo {
    return {
      HIDcode: 113,
      category: HIDCategory.Function,
      displayString: 'F22',
      webKeyId: 'F22',
      whichID: 133
    }
  }

  static get F23(): HidInfo {
    return {
      HIDcode: 114,
      category: HIDCategory.Function,
      displayString: 'F23',
      webKeyId: 'F23',
      whichID: 134
    }
  }

  static get F24(): HidInfo {
    return {
      HIDcode: 115,
      category: HIDCategory.Function,
      displayString: 'F24',
      webKeyId: 'F24',
      whichID: 135
    }
  }

  static get PRINTSCREEN(): HidInfo {
    return {
      HIDcode: 70,
      category: HIDCategory.Modifier,
      displayString: 'Print Screen',
      webKeyId: 'PrintScreen',
      colSpan: 2,
      whichID: 44
    }
  }

  static get SCROLLLOCK(): HidInfo {
    return {
      HIDcode: 71,
      category: HIDCategory.Modifier,
      displayString: 'Scroll Lock',
      webKeyId: 'ScrollLock',
      colSpan: 2,
      whichID: 145
    }
  }

  static get PAUSE(): HidInfo {
    return {
      HIDcode: 72,
      category: HIDCategory.Modifier,
      displayString: 'Pause',
      webKeyId: 'Pause',
      colSpan: 2,
      whichID: 19
    }
  }

  static get INSERT(): HidInfo {
    return {
      HIDcode: 73,
      category: HIDCategory.Navigation,
      displayString: 'Insert',
      webKeyId: 'Insert',
      colSpan: 2,
      whichID: 45
    }
  }

  static get HOME(): HidInfo {
    return {
      HIDcode: 74,
      category: HIDCategory.Navigation,
      displayString: 'Home',
      webKeyId: 'Home',
      colSpan: 2,
      whichID: 36
    }
  }

  static get PAGEUP(): HidInfo {
    return {
      HIDcode: 75,
      category: HIDCategory.Navigation,
      displayString: 'Page Up',
      webKeyId: 'PageUp',
      colSpan: 2,
      whichID: 33
    }
  }

  static get DELETE(): HidInfo {
    return {
      HIDcode: 76,
      category: HIDCategory.Navigation,
      displayString: 'Delete',
      webKeyId: 'Delete',
      colSpan: 2,
      whichID: 46
    }
  }

  static get END(): HidInfo {
    return {
      HIDcode: 77,
      category: HIDCategory.Navigation,
      displayString: 'End',
      webKeyId: 'End',
      colSpan: 2,
      whichID: 35
    }
  }

  static get PAGEDOWN(): HidInfo {
    return {
      HIDcode: 78,
      category: HIDCategory.Navigation,
      displayString: 'Page Down',
      webKeyId: 'PageDown',
      colSpan: 2,
      whichID: 34
    }
  }

  static get ARROWR(): HidInfo {
    return {
      HIDcode: 79,
      category: HIDCategory.Navigation,
      displayString: 'Right Arrow',
      webKeyId: 'ArrowRight',
      colSpan: 2,
      whichID: 39
    }
  }

  static get ARROWL(): HidInfo {
    return {
      HIDcode: 80,
      category: HIDCategory.Navigation,
      displayString: 'Left Arrow',
      webKeyId: 'ArrowLeft',
      colSpan: 2,
      whichID: 37
    }
  }

  static get ARROWD(): HidInfo {
    return {
      HIDcode: 81,
      category: HIDCategory.Navigation,
      displayString: 'Down Arrow',
      webKeyId: 'ArrowDown',
      colSpan: 2,
      whichID: 40
    }
  }

  static get ARROWU(): HidInfo {
    return {
      HIDcode: 82,
      category: HIDCategory.Navigation,
      displayString: 'Up Arrow',
      webKeyId: 'ArrowUp',
      colSpan: 2,
      whichID: 38
    }
  }

  static get NUMLOCK(): HidInfo {
    return {
      HIDcode: 83,
      category: HIDCategory.Numpad,
      displayString: 'Num Lock',
      webKeyId: 'NumLock',
      colSpan: 2,
      whichID: 144
    }
  }

  static get NUMDIVIDE(): HidInfo {
    return {
      HIDcode: 84,
      category: HIDCategory.Numpad,
      displayString: 'Numpad Divide',
      webKeyId: 'NumpadDivide',
      colSpan: 2,
      whichID: 111,
      locationID: 3
    }
  }

  static get NUMMULTIPLY(): HidInfo {
    return {
      HIDcode: 85,
      category: HIDCategory.Numpad,
      displayString: 'Numpad Multiply',
      webKeyId: 'NumpadMultiply',
      colSpan: 2,
      whichID: 106,
      locationID: 3
    }
  }

  static get NUMSUBTRACT(): HidInfo {
    return {
      HIDcode: 86,
      category: HIDCategory.Numpad,
      displayString: 'Numpad Subtract',
      webKeyId: 'NumpadSubtract',
      colSpan: 2,
      whichID: 109,
      locationID: 3
    }
  }

  static get NUMADD(): HidInfo {
    return {
      HIDcode: 87,
      category: HIDCategory.Numpad,
      displayString: 'Numpad Add',
      webKeyId: 'NumpadAdd',
      colSpan: 2,
      whichID: 107,
      locationID: 3
    }
  }

  static get NUMENTER(): HidInfo {
    return {
      HIDcode: 88,
      category: HIDCategory.Numpad,
      displayString: 'Numpad Enter',
      webKeyId: 'NumpadEnter',
      colSpan: 2,
      whichID: 13,
      locationID: 3
    }
  }

  static get NP1(): HidInfo {
    return {
      HIDcode: 89,
      category: HIDCategory.Numpad,
      displayString: 'NP1',
      webKeyId: 'Numpad1',
      colSpan: 2,
      whichID: 97,
      locationID: 3
    }
  }

  static get NP2(): HidInfo {
    return {
      HIDcode: 90,
      category: HIDCategory.Numpad,
      displayString: 'NP2',
      webKeyId: 'Numpad2',
      colSpan: 2,
      whichID: 98,
      locationID: 3
    }
  }

  static get NP3(): HidInfo {
    return {
      HIDcode: 91,
      category: HIDCategory.Numpad,
      displayString: 'NP3',
      webKeyId: 'Numpad3',
      colSpan: 2,
      whichID: 99,
      locationID: 3
    }
  }

  static get NP4(): HidInfo {
    return {
      HIDcode: 92,
      category: HIDCategory.Numpad,
      displayString: 'NP4',
      webKeyId: 'Numpad4',
      colSpan: 2,
      whichID: 100,
      locationID: 3
    }
  }

  static get NP5(): HidInfo {
    return {
      HIDcode: 93,
      category: HIDCategory.Numpad,
      displayString: 'NP5',
      webKeyId: 'Numpad5',
      colSpan: 2,
      whichID: 101,
      locationID: 3
    }
  }

  static get NP6(): HidInfo {
    return {
      HIDcode: 94,
      category: HIDCategory.Numpad,
      displayString: 'NP6',
      webKeyId: 'Numpad6',
      colSpan: 2,
      whichID: 102,
      locationID: 3
    }
  }

  static get NP7(): HidInfo {
    return {
      HIDcode: 95,
      category: HIDCategory.Numpad,
      displayString: 'NP7',
      webKeyId: 'Numpad7',
      colSpan: 2,
      whichID: 103,
      locationID: 3
    }
  }

  static get NP8(): HidInfo {
    return {
      HIDcode: 96,
      category: HIDCategory.Numpad,
      displayString: 'NP8',
      webKeyId: 'Numpad8',
      colSpan: 2,
      whichID: 104,
      locationID: 3
    }
  }

  static get NP9(): HidInfo {
    return {
      HIDcode: 97,
      category: HIDCategory.Numpad,
      displayString: 'NP9',
      webKeyId: 'Numpad9',
      colSpan: 2,
      whichID: 105,
      locationID: 3
    }
  }

  static get NP0(): HidInfo {
    return {
      HIDcode: 98,
      category: HIDCategory.Numpad,
      displayString: 'NP0',
      webKeyId: 'Numpad0',
      colSpan: 2,
      whichID: 96,
      locationID: 3
    }
  }

  static get NUMDECIMAL(): HidInfo {
    return {
      HIDcode: 133,
      category: HIDCategory.Numpad,
      displayString: 'Numpad Decimal',
      webKeyId: 'NumpadDecimal',
      colSpan: 2,
      whichID: 110,
      locationID: 3
    }
  }

  static get CONTROLL(): HidInfo {
    return {
      HIDcode: 224,
      category: HIDCategory.Modifier,
      displayString: 'L-CTRL',
      webKeyId: 'ControlLeft',
      colSpan: 2,
      whichID: 17,
      locationID: 1
    }
  }

  static get SHIFTL(): HidInfo {
    return {
      HIDcode: 225,
      category: HIDCategory.Modifier,
      displayString: 'L-SHIFT',
      webKeyId: 'ShiftLeft',
      colSpan: 2,
      whichID: 16,
      locationID: 1
    }
  }

  static get ALTL(): HidInfo {
    return {
      HIDcode: 226,
      category: HIDCategory.Modifier,
      displayString: 'L-ALT',
      webKeyId: 'AltLeft',
      colSpan: 2,
      whichID: 18,
      locationID: 1
    }
  }

  static get METAL(): HidInfo {
    return {
      HIDcode: 227,
      category: HIDCategory.Modifier,
      displayString: 'L-Win/Super/Command',
      webKeyId: 'MetaLeft',
      colSpan: 4,
      whichID: 91,
      locationID: 1
    }
  }

  static get CONTROLR(): HidInfo {
    return {
      HIDcode: 228,
      category: HIDCategory.Modifier,
      displayString: 'R-CTRL',
      webKeyId: 'ControlRight',
      colSpan: 2,
      whichID: 17,
      locationID: 2
    }
  }

  static get SHIFTR(): HidInfo {
    return {
      HIDcode: 229,
      category: HIDCategory.Modifier,
      displayString: 'R-SHIFT',
      webKeyId: 'ShiftRight',
      colSpan: 2,
      whichID: 16,
      locationID: 2
    }
  }

  static get ALTR(): HidInfo {
    return {
      HIDcode: 230,
      category: HIDCategory.Modifier,
      displayString: 'R-ALT',
      webKeyId: 'AltRight',
      colSpan: 2,
      whichID: 18,
      locationID: 2
    }
  }

  static get METAR(): HidInfo {
    return {
      HIDcode: 231,
      category: HIDCategory.Modifier,
      displayString: 'R-Win/Super/Command',
      webKeyId: 'MetaRight',
      colSpan: 4,
      whichID: 92,
      locationID: 2
    }
  }

  static get CONTEXTMENU(): HidInfo {
    return {
      HIDcode: 101,
      category: HIDCategory.Modifier,
      displayString: 'Menu',
      webKeyId: 'ContextMenu',
      colSpan: 2,
      whichID: 93
    }
  }

  static get INTLBACKSLASH(): HidInfo {
    return {
      HIDcode: 100,
      category: HIDCategory.Alphanumeric,
      displayString: 'Intl \\',
      webKeyId: 'IntlBackslash',
      whichID: 226
    }
  }

  static get VOLUMEMUTE(): HidInfo {
    return {
      HIDcode: 127,
      category: HIDCategory.Media,
      displayString: 'Vol Mute',
      webKeyId: 'AudioVolumeMute',
      colSpan: 2,
      whichID: 173
    }
  }

  static get VOLUMEUP(): HidInfo {
    return {
      HIDcode: 128,
      category: HIDCategory.Media,
      displayString: 'Vol Up',
      webKeyId: 'AudioVolumeUp',
      colSpan: 2,
      whichID: 175
    }
  }

  static get VOLUMEDOWN(): HidInfo {
    return {
      HIDcode: 129,
      category: HIDCategory.Media,
      displayString: 'Vol Down',
      webKeyId: 'AudioVolumeDown',
      colSpan: 2,
      whichID: 174
    }
  }

  static get MEDIANEXT(): HidInfo {
    return {
      HIDcode: 130,
      category: HIDCategory.Media,
      displayString: 'Next Track',
      webKeyId: 'MediaTrackNext',
      colSpan: 2,
      whichID: 176
    }
  }

  static get MEDIAPREV(): HidInfo {
    return {
      HIDcode: 131,
      category: HIDCategory.Media,
      displayString: 'Prev Track',
      webKeyId: 'MediaTrackPrevious',
      colSpan: 2,
      whichID: 177
    }
  }

  static get MEDIASTOP(): HidInfo {
    return {
      HIDcode: 132,
      category: HIDCategory.Media,
      displayString: 'Media Stop',
      webKeyId: 'MediaStop',
      colSpan: 2,
      whichID: 178
    }
  }

  static get MEDIAPLAYPAUSE(): HidInfo {
    return {
      HIDcode: 134,
      category: HIDCategory.Media,
      displayString: 'Play / Pause',
      webKeyId: 'MediaPlayPause',
      colSpan: 2,
      whichID: 179
    }
  }

  static readonly all: HidInfo[] = [
    // Alphanumeric — letters A–Z
    Hid.A, Hid.B, Hid.C, Hid.D, Hid.E, Hid.F, Hid.G, Hid.H, Hid.I,
    Hid.J, Hid.K, Hid.L, Hid.M, Hid.N, Hid.O, Hid.P, Hid.Q, Hid.R,
    Hid.S, Hid.T, Hid.U, Hid.V, Hid.W, Hid.X, Hid.Y, Hid.Z,
    // Alphanumeric — digit row (1–0)
    Hid.N1, Hid.N2, Hid.N3, Hid.N4, Hid.N5,
    Hid.N6, Hid.N7, Hid.N8, Hid.N9, Hid.N0,
    // Alphanumeric — symbols (keyboard layout order)
    Hid.MINUS, Hid.EQUAL,
    Hid.BRACKETL, Hid.BRACKETR, Hid.BACKSLASH,
    Hid.SEMICOLON, Hid.QUOTE, Hid.BACKQUOTE,
    Hid.COMMA, Hid.PERIOD, Hid.SLASH,
    // Alphanumeric — special keys
    Hid.ESCAPE, Hid.TAB, Hid.CAPSLOCK, Hid.SPACE,
    Hid.ENTER, Hid.BACKSPACE,
    // Alphanumeric — ISO only
    Hid.INTLBACKSLASH,

    // Function — F1–F24
    Hid.F1, Hid.F2, Hid.F3, Hid.F4, Hid.F5, Hid.F6,
    Hid.F7, Hid.F8, Hid.F9, Hid.F10, Hid.F11, Hid.F12,
    Hid.F13, Hid.F14, Hid.F15, Hid.F16, Hid.F17, Hid.F18,
    Hid.F19, Hid.F20, Hid.F21, Hid.F22, Hid.F23, Hid.F24,

    // Modifier — left side, right side, then lock/special
    Hid.SHIFTL, Hid.CONTROLL, Hid.ALTL, Hid.METAL,
    Hid.SHIFTR, Hid.CONTROLR, Hid.ALTR, Hid.METAR,
    Hid.PRINTSCREEN, Hid.SCROLLLOCK, Hid.PAUSE, Hid.CONTEXTMENU,

    // Navigation — cluster (Insert/Del/Home/End/PgUp/PgDn), then arrows
    Hid.INSERT, Hid.HOME, Hid.PAGEUP,
    Hid.DELETE, Hid.END, Hid.PAGEDOWN,
    Hid.ARROWU,
    Hid.ARROWL, Hid.ARROWD, Hid.ARROWR,

    // Numpad — sequential order
    Hid.NUMLOCK, Hid.NUMDIVIDE, Hid.NUMMULTIPLY, Hid.NUMSUBTRACT, Hid.NUMADD,
    Hid.NP0, Hid.NP1, Hid.NP2, Hid.NP3, Hid.NP4,
    Hid.NP5, Hid.NP6, Hid.NP7, Hid.NP8, Hid.NP9,
    Hid.NUMENTER, Hid.NUMDECIMAL,

    // Media — volume then transport controls
    Hid.VOLUMEDOWN, Hid.VOLUMEMUTE, Hid.VOLUMEUP,
    Hid.MEDIAPREV, Hid.MEDIAPLAYPAUSE, Hid.MEDIASTOP, Hid.MEDIANEXT,
  ]
}

export const webCodeLocationHIDLookup = new Map<string, HidInfo>(
  // This creates a unique ID: whichID, separated by an extra '1' digit, then locationID.
  Hid.all
    .filter((hid) => hid.whichID !== undefined)
    .map((hid) => [
      webCodeLocationHidEncode(hid.whichID, hid.locationID ?? 0),
      hid
    ])
)

export function webCodeLocationHidEncode(
  which: number,
  location: number
): string {
  return String(which) + '|' + location
}

export const HIDLookup = new Map<number, HidInfo>(
  Hid.all
    .filter((hid) => hid.HIDcode !== undefined)
    .map((hid) => [hid.HIDcode, hid])
)
