import { useCallback, useEffect, useRef, useState } from 'react'
import { KeyType, MouseButton } from '../constants/enums'
import { webCodeLocationHidEncode, webCodeLocationHIDLookup } from '../constants/HIDmap'
import { webButtonLookup } from '../constants/MouseMap'
import { Keypress, MousePressAction } from '../types'
import { error } from 'tauri-plugin-log'
import { useToast } from '@chakra-ui/react'
import { invoke } from '@tauri-apps/api'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

type RecordedEvent =
  | { type: 'KeyPress'; hid_code: number; timestamp_ms: number }
  | { type: 'KeyRelease'; hid_code: number; timestamp_ms: number }
  | { type: 'ButtonPress'; button_code: number; timestamp_ms: number }
  | { type: 'ButtonRelease'; button_code: number; timestamp_ms: number }
  | { type: 'MouseMove'; x: number; y: number; timestamp_ms: number }

export default function useRecordingSequence(
  onItemChanged: (
    item: Keypress | MousePressAction | undefined,
    prevItem: Keypress | MousePressAction | undefined,
    timeDiff: number,
    isUpEvent: boolean
  ) => void,
  onMouseMove?: (x: number, y: number, timestamp: number) => void,
  recordingHotkeyHid?: number
) {
  const [recording, setRecording] = useState(false)
  const [item, setItem] = useState<Keypress | MousePressAction | undefined>(undefined)
  const [prevItem, setPrevItem] = useState<Keypress | MousePressAction | undefined>(undefined)
  const [eventType, setEventType] = useState<'Down' | 'Up'>('Down')
  const [prevEventType, setPrevEventType] = useState<'Down' | 'Up'>('Down')
  const [prevTimestamp, setPrevTimestamp] = useState(0)

  const toast = useToast()

  // Refs to hold latest values inside Tauri event callbacks
  const itemRef = useRef(item)
  const prevItemRef = useRef(prevItem)
  const eventTypeRef = useRef(eventType)
  const prevTimestampRef = useRef(prevTimestamp)

  useEffect(() => { itemRef.current = item }, [item])
  useEffect(() => { prevItemRef.current = prevItem }, [prevItem])
  useEffect(() => { eventTypeRef.current = eventType }, [eventType])
  useEffect(() => { prevTimestampRef.current = prevTimestamp }, [prevTimestamp])

  const startRecording = useCallback(async () => {
    setItem(undefined)
    setPrevItem(undefined)
    setRecording(true)
    await invoke<void>('start_recording').catch((e: string) => error(e))
  }, [])

  const stopRecording = useCallback(async () => {
    setRecording(false)
    await invoke<void>('stop_recording').catch((e: string) => error(e))
  }, [])

  // Handle a recorded key/button event (same pairing logic as DOM-based version)
  const handleKeypress = useCallback(
    (hidCode: number, timestamp: number, isUp: boolean) => {
      const timeDiff = Math.round(timestamp - prevTimestampRef.current)
      setPrevTimestamp(timestamp)
      setPrevEventType(eventTypeRef.current)
      setPrevItem(itemRef.current)

      if (isUp) {
        setEventType('Up')
        const keyup: Keypress = { keypress: hidCode, press_duration: 0, keytype: KeyType[KeyType.Up] }
        setItem(keyup)
        onItemChanged(keyup, itemRef.current, timeDiff, true)
      } else {
        setEventType('Down')
        const keydown: Keypress = { keypress: hidCode, press_duration: 0, keytype: KeyType[KeyType.Down] }
        setItem(keydown)
        onItemChanged(keydown, itemRef.current, timeDiff, false)
      }
    },
    [onItemChanged]
  )

  const handleMouseButton = useCallback(
    (buttonCode: number, timestamp: number, isUp: boolean) => {
      const button = buttonCode as MouseButton
      const timeDiff = Math.round(timestamp - prevTimestampRef.current)
      setPrevTimestamp(timestamp)
      setPrevEventType(eventTypeRef.current)
      setPrevItem(itemRef.current)

      if (isUp) {
        setEventType('Up')
        const mouseup: MousePressAction = { type: 'Up', button }
        setItem(mouseup)
        onItemChanged(mouseup, itemRef.current, timeDiff, true)
      } else {
        setEventType('Down')
        const mousedown: MousePressAction = { type: 'Down', button }
        setItem(mousedown)
        onItemChanged(mousedown, itemRef.current, timeDiff, false)
      }
    },
    [onItemChanged, stopRecording, toast]
  )

  // Stable refs for use inside always-on callbacks
  const recordingRef = useRef(recording)
  const handleKeypressRef = useRef(handleKeypress)
  const handleMouseButtonRef = useRef(handleMouseButton)
  const onMouseMoveRef = useRef(onMouseMove)
  const recordingHotkeyHidRef = useRef(recordingHotkeyHid)
  useEffect(() => { recordingRef.current = recording }, [recording])
  useEffect(() => { handleKeypressRef.current = handleKeypress }, [handleKeypress])
  useEffect(() => { handleMouseButtonRef.current = handleMouseButton }, [handleMouseButton])
  useEffect(() => { onMouseMoveRef.current = onMouseMove }, [onMouseMove])
  useEffect(() => { recordingHotkeyHidRef.current = recordingHotkeyHid }, [recordingHotkeyHid])

  // DOM listeners: hotkey toggle (always) + key capture when recording & app focused.
  // This handles both cases when the Tauri event bridge is unreliable with app focused.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const hidIdentifier = webCodeLocationHidEncode(e.which, e.location)
      const hidInfo = webCodeLocationHIDLookup.get(hidIdentifier)
      if (!hidInfo) return

      // Hotkey: toggle recording regardless of recording state
      if (recordingHotkeyHid !== undefined && hidInfo.HIDcode === recordingHotkeyHid) {
        e.preventDefault()
        if (recordingRef.current) {
          stopRecording()
        } else {
          startRecording()
        }
        return
      }

      // Capture keypress when recording
      if (recordingRef.current) {
        e.preventDefault()
        handleKeypressRef.current(hidInfo.HIDcode, Date.now(), false)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (!recordingRef.current) return
      const hidIdentifier = webCodeLocationHidEncode(e.which, e.location)
      const hidInfo = webCodeLocationHIDLookup.get(hidIdentifier)
      if (!hidInfo) return
      if (recordingHotkeyHid !== undefined && hidInfo.HIDcode === recordingHotkeyHid) return
      handleKeypressRef.current(hidInfo.HIDcode, Date.now(), true)
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('keyup', onKeyUp, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('keyup', onKeyUp, true)
    }
  }, [recordingHotkeyHid, startRecording, stopRecording])

  // rdev events: used when app is NOT focused (background recording).
  // Skip when focused to avoid double-processing with the DOM listeners above.
  useEffect(() => {
    let unlisten: UnlistenFn | null = null

    listen<RecordedEvent>('recording_event', (event) => {
      if (!recordingRef.current) return
      if (document.hasFocus()) return
      const data = event.payload
      switch (data.type) {
        case 'KeyPress':
          if (recordingHotkeyHidRef.current !== undefined && data.hid_code === recordingHotkeyHidRef.current) break
          handleKeypressRef.current(data.hid_code, data.timestamp_ms, false)
          break
        case 'KeyRelease':
          if (recordingHotkeyHidRef.current !== undefined && data.hid_code === recordingHotkeyHidRef.current) break
          handleKeypressRef.current(data.hid_code, data.timestamp_ms, true)
          break
        case 'ButtonPress':
          handleMouseButtonRef.current(data.button_code, data.timestamp_ms, false)
          break
        case 'ButtonRelease':
          handleMouseButtonRef.current(data.button_code, data.timestamp_ms, true)
          break
        case 'MouseMove':
          onMouseMoveRef.current?.(data.x, data.y, data.timestamp_ms)
          break
      }
    }).then((u) => { unlisten = u })

    return () => { unlisten?.() }
  }, [])

  // Hotkey from backend when app is NOT focused
  useEffect(() => {
    let unlisten: UnlistenFn | null = null

    listen<boolean>('recording_state', (event) => {
      if (event.payload) {
        startRecording()
      } else {
        stopRecording()
      }
    }).then((u) => { unlisten = u })

    return () => { unlisten?.() }
  }, [startRecording, stopRecording])

  return {
    recording,
    startRecording,
    stopRecording,
    item,
    eventType,
    prevEventType,
    prevItem
  }
}
