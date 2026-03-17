import {
  Button,
  Divider,
  HStack,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import NumberInputSetting from './NumberInputSetting'
import ToggleSetting from './ToggleSetting'
import { useSettingsContext } from '../../contexts/settingsContext'
import { HIDLookup, webCodeLocationHidEncode, webCodeLocationHIDLookup } from '../../constants/HIDmap'

export default function ApplicationSettingsPanel() {
  const {
    config,
    updateLaunchOnStartup,
    updateMinimizeOnStartup,
    updateMinimizeOnClose,
    updateAutoAddDelay,
    updateDefaultDelayVal,
    updateAutoSelectElement,
    updateRecordingHotkey,
    updateAlwaysOnTop,
  } = useSettingsContext()

  const [listeningForHotkey, setListeningForHotkey] = useState(false)
  const labelColour = useColorModeValue('primary-light.900', 'primary-dark.100')

  const hotkeyName = config.RecordingHotkey
    ? HIDLookup.get(config.RecordingHotkey)?.displayString ?? `HID ${config.RecordingHotkey}`
    : 'Not set'

  const onCaptureHotkey = useCallback((e: KeyboardEvent) => {
    e.preventDefault()
    const hidIdentifier = webCodeLocationHidEncode(e.which, e.location)
    const hidInfo = webCodeLocationHIDLookup.get(hidIdentifier)
    if (hidInfo) {
      updateRecordingHotkey(hidInfo.HIDcode)
    }
    setListeningForHotkey(false)
  }, [updateRecordingHotkey])

  useEffect(() => {
    if (!listeningForHotkey) return
    window.addEventListener('keydown', onCaptureHotkey, true)
    return () => window.removeEventListener('keydown', onCaptureHotkey, true)
  }, [listeningForHotkey, onCaptureHotkey])

  return (
    <VStack w="full" spacing="4">
      <VStack w="full">
        <Text w="full" textStyle="miniHeader">
          Window Settings
        </Text>
      </VStack>
      <VStack w="full" spacing={[4]}>
        <ToggleSetting
          title="Launch on startup"
          description="The app will open during your computer's startup phase."
          value={config.AutoStart}
          onChange={updateLaunchOnStartup}
        />
        <Divider />
        <ToggleSetting
          title="Minimize on startup"
          description="The app will open quietly in the background on startup. Requires 'Launch on Startup' to be enabled."
          value={config.MinimizeAtLaunch}
          onChange={updateMinimizeOnStartup}
          didDependencyCheckFail={!config.AutoStart}
        />
        <Divider />
        <ToggleSetting
          title="Minimize on close"
          description="Pressing X will minimize the app instead of closing it."
          value={config.MinimizeToTray}
          onChange={updateMinimizeOnClose}
        />
        <Divider />
        <ToggleSetting
          title="Always on top"
          description="Keep the app window above all other windows."
          value={config.AlwaysOnTop}
          onChange={updateAlwaysOnTop}
        />
        <Divider />
      </VStack>
      <VStack w="full">
        <Text w="full" textStyle="miniHeader">
          Delay Settings
        </Text>
      </VStack>
      <VStack w="full" spacing={[4]}>
        <ToggleSetting
          title="Auto-add Delay"
          description="When enabled, timing delays are automatically inserted between keypresses when recording a sequence."
          value={config.AutoAddDelay}
          onChange={updateAutoAddDelay}
        />
        <Divider />
        <NumberInputSetting
          title="Default Delay Value"
          description="The value (in ms) that all Delay elements will default to when added to the sequence."
          defaultValue={config.DefaultDelayValue}
          onChange={updateDefaultDelayVal}
          minimum={1}
          maximum={20000}
        />
        <Divider />
      </VStack>
      <VStack w="full">
        <Text w="full" textStyle="miniHeader">
          Macro Creation Settings
        </Text>
      </VStack>
      <VStack w="full" spacing={[4]}>
        <ToggleSetting
          title="Auto-select Element on Add"
          description="When enabled, adding a new element automatically selects it for Editing (if applicable), rendering related options in the Edit Panel."
          value={config.AutoSelectElement}
          onChange={updateAutoSelectElement}
        />
        <Divider />
      </VStack>
      <VStack w="full">
        <Text w="full" textStyle="miniHeader">
          Recording Settings
        </Text>
      </VStack>
      <VStack w="full" spacing={[4]}>
        <HStack w="full" justifyContent="space-between" spacing={8}>
          <VStack spacing={0} textAlign="left" flex={1}>
            <Text w="full" fontSize="md" fontWeight="semibold">
              Recording Hotkey
            </Text>
            <Text w="full" fontSize="sm">
              A global key that toggles sequence recording on/off from any window.
            </Text>
            <Text w="full" fontSize="sm" fontWeight="semibold" color={labelColour} pt={1}>
              Current: {hotkeyName}
            </Text>
          </VStack>
          <VStack spacing={2}>
            <Button
              variant="brandRecord"
              size="sm"
              isActive={listeningForHotkey}
              onClick={() => setListeningForHotkey(true)}
              minW="80px"
            >
              {listeningForHotkey ? 'Press key...' : 'Set key'}
            </Button>
            {config.RecordingHotkey !== undefined && (
              <Button
                variant="brandWarning"
                size="sm"
                onClick={() => updateRecordingHotkey(undefined)}
                minW="80px"
              >
                Clear
              </Button>
            )}
          </VStack>
        </HStack>
        <Divider />
      </VStack>
    </VStack>
  )
}
