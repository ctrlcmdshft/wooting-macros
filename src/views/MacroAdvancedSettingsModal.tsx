import {
  Button,
  Divider,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Switch,
  Text,
  Tooltip,
  VStack,
  useColorModeValue
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useMacroContext } from '../contexts/macroContext'
import { HIDLookup, webCodeLocationHidEncode, webCodeLocationHIDLookup } from '../constants/HIDmap'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function MacroAdvancedSettingsModal({ isOpen, onClose }: Props) {
  const {
    macro,
    updateStartupDelay,
    updatePlaybackSpeed,
    updateAbortKey,
    updateSuppressTriggerKey,
    updateTriggerOnRelease
  } = useMacroContext()

  const [listeningForAbortKey, setListeningForAbortKey] = useState(false)
  const labelColour = useColorModeValue('primary-light.900', 'primary-dark.100')

  const abortKeyName = macro.abort_key
    ? HIDLookup.get(macro.abort_key)?.displayString ?? `HID ${macro.abort_key}`
    : 'Not set'

  const onCaptureAbortKey = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      const hidIdentifier = webCodeLocationHidEncode(e.which, e.location)
      const hidInfo = webCodeLocationHIDLookup.get(hidIdentifier)
      if (hidInfo) {
        updateAbortKey(hidInfo.HIDcode)
      }
      setListeningForAbortKey(false)
    },
    [updateAbortKey]
  )

  useEffect(() => {
    if (!listeningForAbortKey) return
    window.addEventListener('keydown', onCaptureAbortKey, true)
    return () => window.removeEventListener('keydown', onCaptureAbortKey, true)
  }, [listeningForAbortKey, onCaptureAbortKey])

  useEffect(() => {
    if (!isOpen) {
      setListeningForAbortKey(false)
    }
  }, [isOpen])

  const speedOptions = [
    { label: '0.25x (very slow)', value: 0.25 },
    { label: '0.5x (slow)', value: 0.5 },
    { label: '1x (normal)', value: 1 },
    { label: '2x (fast)', value: 2 },
    { label: '4x (very fast)', value: 4 }
  ]

  const currentSpeedValue = macro.playback_speed ?? 1
  const currentStartupDelay = macro.startup_delay ?? 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      variant="brand"
      returnFocusOnClose={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="lg" fontWeight="bold">
          Advanced Macro Settings
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={5} align="stretch">

            {/** Trigger on Release */}
            <HStack justifyContent="space-between">
              <VStack spacing={0} align="start" flex={1}>
                <FormLabel mb={0} fontWeight="semibold">
                  Trigger on Key Release
                </FormLabel>
                <Text fontSize="sm" color="gray.500">
                  Fire the macro when the trigger key is released instead of pressed.
                </Text>
              </VStack>
              <Switch
                isChecked={macro.trigger_on_release ?? false}
                onChange={(e) => updateTriggerOnRelease(e.target.checked)}
                colorScheme="primary-accent"
              />
            </HStack>

            <Divider />

            {/** Suppress Trigger Key */}
            <HStack justifyContent="space-between">
              <VStack spacing={0} align="start" flex={1}>
                <FormLabel mb={0} fontWeight="semibold">
                  Suppress Trigger Key
                </FormLabel>
                <Text fontSize="sm" color="gray.500">
                  Prevent the trigger key from reaching other apps when the macro fires.
                </Text>
              </VStack>
              <Switch
                isChecked={macro.suppress_trigger_key ?? true}
                onChange={(e) => updateSuppressTriggerKey(e.target.checked)}
                colorScheme="primary-accent"
              />
            </HStack>

            <Divider />

            {/** Startup Delay */}
            <VStack spacing={1} align="start">
              <FormLabel mb={0} fontWeight="semibold">
                Startup Delay (ms)
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                Wait this long before the sequence starts executing.
              </Text>
              <NumberInput
                min={0}
                max={60000}
                value={currentStartupDelay}
                onChange={(_str, num) => {
                  if (!isNaN(num)) updateStartupDelay(num === 0 ? null : num)
                }}
                w="150px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </VStack>

            <Divider />

            {/** Playback Speed */}
            <VStack spacing={1} align="start">
              <FormLabel mb={0} fontWeight="semibold">
                Playback Speed
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                Scales all delays in the sequence. 2x = half the delay time.
              </Text>
              <Select
                w="200px"
                value={currentSpeedValue}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  updatePlaybackSpeed(val === 1 ? null : val)
                }}
              >
                {speedOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </VStack>

            <Divider />

            {/** Abort Key */}
            <VStack spacing={1} align="start">
              <FormLabel mb={0} fontWeight="semibold">
                Abort Key
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                Press this key to stop the macro mid-execution.
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color={labelColour}>
                Current: {abortKeyName}
              </Text>
              <HStack>
                <Button
                  variant="brandRecord"
                  size="sm"
                  isActive={listeningForAbortKey}
                  onClick={() => setListeningForAbortKey(true)}
                  minW="80px"
                >
                  {listeningForAbortKey ? 'Press key...' : 'Set key'}
                </Button>
                {macro.abort_key != null && (
                  <Button
                    variant="brandWarning"
                    size="sm"
                    onClick={() => updateAbortKey(null)}
                    minW="80px"
                  >
                    Clear
                  </Button>
                )}
              </HStack>
            </VStack>

          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
