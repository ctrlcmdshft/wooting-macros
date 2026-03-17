import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Divider,
  HStack,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { DeleteIcon, SettingsIcon, TimeIcon } from '@chakra-ui/icons'
import { useCallback, useEffect, useRef } from 'react'
import { ActionEventType, Keypress, MousePathPoint, MousePressAction } from '../../../types'
import { useMacroContext } from '../../../contexts/macroContext'
import useRecordingSequence from '../../../hooks/useRecordingSequence'
import { useSettingsContext } from '../../../contexts/settingsContext'
import { KeyType } from '../../../constants/enums'
import { checkIfKeypress, checkIfMouseButton } from '../../../constants/utils'
import ClearSequenceModal from './ClearSequenceModal'
import { RecordIcon, StopIcon } from '../../icons'
import SortableList from './SortableList'
import useMainBgColour from '../../../hooks/useMainBgColour'

interface Props {
  onOpenMacroSettingsModal: () => void
}

export default function SequencingArea({ onOpenMacroSettingsModal }: Props) {
  const {
    sequence,
    willCauseTriggerLooping,
    onElementAdd,
    onElementsAdd,
    updateElement,
    overwriteSequence
  } = useMacroContext()
  const { config, updateAutoAddDelay, updateRecordMouseMovement } = useSettingsContext()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onItemChanged = useCallback(
    (
      item: Keypress | MousePressAction | undefined,
      prevItem: Keypress | MousePressAction | undefined,
      timeDiff: number,
      isUpEvent: boolean
    ) => {
      if (item === undefined) {
        return
      }

      // Merge Down+Up into a single DownUp element on the Up event
      if (isUpEvent && prevItem !== undefined) {
        if (checkIfKeypress(prevItem) && checkIfKeypress(item)) {
          if (prevItem.keypress === item.keypress) {
            updateElement(
              {
                type: 'KeyPressEventAction',
                data: { ...prevItem, keytype: KeyType[KeyType.DownUp], press_duration: timeDiff }
              },
              sequence.length - 1
            )
            return
          }
        } else if (checkIfMouseButton(prevItem) && checkIfMouseButton(item)) {
          if (prevItem.button === item.button && mousePathRef.current.length === 0) {
            updateElement(
              {
                type: 'MouseEventAction',
                data: { type: 'Press', data: { ...prevItem, type: 'DownUp', duration: timeDiff } }
              },
              sequence.length - 1
            )
            return
          }
        }
      }

      // Build the batch of elements to add in order:
      // 1. Flush any pending mouse path so movements appear before this click/key
      // 2. Optional delay
      // 3. The key/button event itself
      const toAdd: Parameters<typeof onElementsAdd>[0] = []

      const path = mousePathRef.current
      if (path.length > 0) {
        const pathData: MousePathPoint[] = path.map((p, i) => ({
          x: p.x,
          y: p.y,
          delta_ms: i === 0 ? 0 : Math.round(p.timestamp - path[i - 1].timestamp)
        }))
        mousePathRef.current = []

        // Mouse-up with a recorded path: insert a zero-delay move-to-start before the
        // mouse-down that was already appended, so playback positions the cursor first.
        if (isUpEvent && checkIfMouseButton(item) && sequence.length > 0) {
          const preMoveAction: ActionEventType = {
            type: 'MousePathEventAction',
            data: [{ x: pathData[0].x, y: pathData[0].y, delta_ms: 0 }]
          }
          const mouseUpAction: ActionEventType = {
            type: 'MouseEventAction',
            data: { type: 'Press', data: item }
          }
          overwriteSequence([
            ...sequence.slice(0, sequence.length - 1),
            preMoveAction,
            sequence[sequence.length - 1],
            { type: 'MousePathEventAction', data: pathData },
            mouseUpAction
          ])
          return
        }

        toAdd.push({ type: 'MousePathEventAction', data: pathData })
      }

      if (prevItem !== undefined && config.AutoAddDelay) {
        toAdd.push({ type: 'DelayEventAction', data: timeDiff })
      }

      if (checkIfKeypress(item)) {
        toAdd.push({ type: 'KeyPressEventAction', data: item })
      } else {
        toAdd.push({ type: 'MouseEventAction', data: { type: 'Press', data: item } })
      }

      if (toAdd.length === 1) {
        onElementAdd(toAdd[0])
      } else {
        onElementsAdd(toAdd)
      }
    },
    [config.AutoAddDelay, onElementAdd, onElementsAdd, overwriteSequence, sequence, updateElement]
  )

  const mousePathRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([])
  const wasRecordingRef = useRef(false)

  const onMouseMove = useCallback((x: number, y: number, timestamp: number) => {
    mousePathRef.current.push({ x, y, timestamp })
  }, [])

  const { recording, startRecording, stopRecording } =
    useRecordingSequence(onItemChanged, config.RecordMouseMovement ? onMouseMove : undefined, config.RecordingHotkey)

  useEffect(() => {
    if (!recording && wasRecordingRef.current) {
      updateRecordMouseMovement(false)
      const path = mousePathRef.current
      if (path.length > 0) {
        const pathData: MousePathPoint[] = path.map((p, i) => ({
          x: p.x,
          y: p.y,
          delta_ms: i === 0 ? 0 : Math.round(p.timestamp - path[i - 1].timestamp)
        }))
        onElementAdd({ type: 'MousePathEventAction', data: pathData })
      }
      mousePathRef.current = []
    }
    wasRecordingRef.current = recording
  }, [recording, onElementAdd])

  return (
    <VStack w="41%" h="full" bg={useMainBgColour()} justifyContent="top">
      {/** Header */}
      <VStack w="full" px={[2, 4, 6]} pt={[2, 4]}>
        <Stack
          direction={['column', 'row']}
          w="full"
          textAlign="left"
          justifyContent="space-between"
          alignItems={['start', 'center']}
        >
          {willCauseTriggerLooping && (
            <Alert
              status="error"
              w={['full', 'fit']}
              rounded="md"
              py="1"
              px={['2', '3']}
            >
              <AlertIcon boxSize={['16px', '20px']} />
              <AlertDescription fontSize={['xs', 'sm']} fontWeight="bold">
                1+ elements may trigger this macro again or another macro!
              </AlertDescription>
            </Alert>
          )}
        </Stack>
      </VStack>
      <HStack
        justifyContent="center"
        w="full"
        alignItems="center"
        px={[2, 4, 6]}
      >
        <Text fontWeight="semibold" fontSize={['sm', 'md']}>
          Sequence
        </Text>
        <Button
          variant="brandRecord"
          leftIcon={recording ? <StopIcon /> : <RecordIcon />}
          size={['xs', 'sm', 'md']}
          fontSize={['xs', 'xs', 'lg']}
          isActive={recording}
          onClick={() => recording ? stopRecording() : startRecording()}
        >
          {recording ? 'Stop' : 'Record'}
        </Button>
        <Tooltip
          label="Mouse path recording — coming soon"
          hasArrow
          variant="brand"
        >
          <Button
            size={['xs', 'sm', 'md']}
            fontSize={['xs', 'xs', 'lg']}
            variant="brandRecord"
            isDisabled
            opacity={0.4}
          >
            Mouse
          </Button>
        </Tooltip>
        <Tooltip
          label={`Auto-add delay while recording: ${config.AutoAddDelay ? 'On' : 'Off'}`}
          hasArrow
          variant="brand"
        >
          <Button
            leftIcon={<TimeIcon />}
            size={['xs', 'sm', 'md']}
            fontSize={['xs', 'xs', 'lg']}
            bg={config.AutoAddDelay ? 'yellow.300' : undefined}
            color={config.AutoAddDelay ? 'gray.800' : undefined}
            variant={config.AutoAddDelay ? undefined : 'brandRecord'}
            _hover={{ bg: config.AutoAddDelay ? 'yellow.400' : undefined }}
            onClick={() => updateAutoAddDelay(!config.AutoAddDelay)}
          >
            Delay
          </Button>
        </Tooltip>
        <Tooltip label="Add Delay" hasArrow variant="brand">
          <IconButton
            aria-label="Add Delay"
            variant="brandRecord"
            icon={<TimeIcon />}
            size={['xs', 'sm', 'md']}
            onClick={() => {
              onElementAdd({
                type: 'DelayEventAction',
                data: config.DefaultDelayValue
              })
            }}
          />
        </Tooltip>
        <Tooltip label="Clear All" hasArrow variant="brand">
          <IconButton
            aria-label="Clear All"
            variant="brandWarning"
            icon={<DeleteIcon />}
            size={['xs', 'sm', 'md']}
            onClick={onOpen}
            isDisabled={sequence.length === 0}
          />
        </Tooltip>

        <Tooltip
          label="Advanced Macro Settings"
          hasArrow
          variant="brand"
        >
          <IconButton
            variant="brand"
            aria-label="MacroSettings"
            icon={<SettingsIcon />}
            size={['xs', 'sm', 'md']}
            onClick={onOpenMacroSettingsModal}
          />
        </Tooltip>
      </HStack>
      {/** Header End */}
      <ClearSequenceModal
        isOpen={isOpen}
        onClose={onClose}
        stopRecording={stopRecording}
      />
      <Divider w="full" />
      <SortableList recording={recording} stopRecording={stopRecording} />
    </VStack>
  )
}
