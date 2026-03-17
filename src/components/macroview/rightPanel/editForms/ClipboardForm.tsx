import {
  Box,
  Divider,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Textarea,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useMacroContext } from '../../../../contexts/macroContext'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { SystemEventAction } from '../../../../types'
import { BoxText } from '../EditArea'

interface Props {
  selectedElementId: number
  selectedElement: SystemEventAction
}

export default function ClipboardForm({
  selectedElementId,
  selectedElement
}: Props) {
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const [text, setText] = useState('')
  const [delayMs, setDelayMs] = useState(30)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { updateElement } = useMacroContext()
  const { colorMode } = useColorMode()
  const bg = useColorModeValue('primary-light.50', 'primary-dark.700')
  const kebabColour = useColorModeValue('primary-light.500', 'primary-dark.500')

  useEffect(() => {
    if (selectedElement.data.type !== 'Clipboard') return
    const action = selectedElement.data.action
    if (action.type !== 'PasteUserDefinedString' && action.type !== 'TypeText') return
    setText(action.data)
    if (action.type === 'TypeText') {
      setDelayMs(action.delay_ms)
    }
  }, [selectedElement])

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (pickerRef === undefined) {
        return
      }
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        if (
          (event.target as HTMLElement).id === 'emoji-button' ||
          (event.target as HTMLElement).localName === 'span'
        ) {
          return
        }
        setShowEmojiPicker(!showEmojiPicker)
      }
    },
    [showEmojiPicker]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside, pickerRef])

  const onTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value)
    },
    [setText]
  )

  const actionType = selectedElement.data.type === 'Clipboard' &&
    (selectedElement.data.action.type === 'TypeText' ? 'TypeText' : 'PasteUserDefinedString')

  const onInputBlur = useCallback(() => {
    const action =
      actionType === 'TypeText'
        ? { type: 'TypeText' as const, data: text, delay_ms: delayMs }
        : { type: 'PasteUserDefinedString' as const, data: text }
    const temp: SystemEventAction = {
      ...selectedElement,
      data: { type: 'Clipboard', action }
    }
    updateElement(temp, selectedElementId)
  }, [actionType, delayMs, selectedElement, selectedElementId, text, updateElement])

  const onEmojiSelect = useCallback(
    (emoji: { native: string }) => {
      const newString = text + emoji.native
      setText(newString)
      const action =
        actionType === 'TypeText'
          ? { type: 'TypeText' as const, data: newString, delay_ms: delayMs }
          : { type: 'PasteUserDefinedString' as const, data: newString }
      const temp: SystemEventAction = {
        ...selectedElement,
        data: { type: 'Clipboard', action }
      }
      updateElement(temp, selectedElementId)
    },
    [actionType, delayMs, selectedElement, selectedElementId, text, updateElement]
  )

  return (
    <>
      <HStack justifyContent="center" p={1}>
        <BoxText>{actionType === 'TypeText' ? 'Type Text' : 'Clipboard'}</BoxText>
      </HStack>
      <Divider />
      <HStack w="full" justifyContent="space-between">
        <Text fontSize={['xs', 'sm', 'md']} fontWeight="semibold">
          {actionType === 'TypeText' ? 'Text to type' : 'Text to paste'}
        </Text>
        <Box
          filter={showEmojiPicker ? 'grayscale(0%)' : 'grayscale(100%)'}
          _hover={{ filter: 'grayscale(0%)', transform: 'scale(110%)' }}
          transition="ease-out 150ms"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          id="emoji-button"
        >
          <em-emoji id="smile" size="32px" />
        </Box>
      </HStack>
      <Textarea
        variant="brandAccent"
        value={text}
        onChange={onTextChange}
        onBlur={onInputBlur}
        placeholder="e.g. glhf <3"
      />
      {actionType === 'TypeText' && (
        <HStack w="full" justifyContent="space-between">
          <Text fontSize={['xs', 'sm', 'md']} fontWeight="semibold">
            Delay per character (ms)
          </Text>
          <NumberInput
            size="sm"
            w="80px"
            min={0}
            max={1000}
            value={delayMs}
            onChange={(_, val) => {
              const next = isNaN(val) ? 0 : val
              setDelayMs(next)
              const action = { type: 'TypeText' as const, data: text, delay_ms: next }
              const temp: SystemEventAction = {
                ...selectedElement,
                data: { type: 'Clipboard', action }
              }
              updateElement(temp, selectedElementId)
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      )}
      {showEmojiPicker && (
        <Box ref={pickerRef} w="full">
          <Picker
            data={data}
            theme={colorMode}
            onEmojiSelect={onEmojiSelect}
            navPosition="bottom"
            previewPosition="none"
            dynamicWidth={true}
            maxFrequentRows={1}
          />
        </Box>
        // TODO: need to figure out how to adjust height of picker, as it doesn't allow for customizing style. Maybe it will be updated one day or we find a different emoji picker
      )}
    </>
  )
}
