import {
  Box,
  Button,
  Checkbox,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  StackDivider,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import { HiArrowPath, HiArrowRight, HiHandRaised } from 'react-icons/hi2'
import { useMacroContext } from '../../../contexts/macroContext'
import { MacroType } from '../../../constants/enums'
import { checkIfStringIsNonNumeric } from '../../../constants/utils'

const typeLabels = ['Single', 'Toggle', 'On Hold']
const typeIcons = [<HiArrowRight key="single" />, <HiArrowPath key="toggle" />, <HiHandRaised key="onhold" />]
const typeTooltips = [
  'Single: Play sequence once',
  'Toggle: Loop until triggered again',
  'On Hold: Loop while trigger key is held'
]

export default function MacroTypeArea() {
  const { macro, updateMacroType, updateLoopCount } = useMacroContext()
  const shadowColour = useColorModeValue('sm', 'white-sm')
  const segmentBg = useColorModeValue('primary-light.100', 'primary-dark.800')
  const inactiveHoverBg = useColorModeValue('primary-light.200', 'primary-dark.700')
  const mutedText = useColorModeValue('gray.500', 'gray.400')

  const isToggleMacro = macro.macro_type === 'Toggle'
  const isInfiniteLoop = macro.loop_count === null || macro.loop_count === undefined

  const handleInfiniteToggle = (checked: boolean) => {
    updateLoopCount(checked ? null : 10)
  }

  const handleLoopCountChange = (_valueAsString: string, valueAsNumber: number) => {
    if (!isNaN(valueAsNumber) && valueAsNumber > 0) {
      updateLoopCount(valueAsNumber)
    }
  }

  return (
    <Box shadow={shadowColour} rounded="md">
      <HStack py={2} px={3} spacing={4}>

        {/* Segmented control */}
        <HStack bg={segmentBg} rounded="lg" p="1" spacing="1">
          {(Object.keys(MacroType) as Array<keyof typeof MacroType>)
            .filter(checkIfStringIsNonNumeric)
            .map((value: string, index: number) => {
              const isActive = macro.macro_type === value
              return (
                <Tooltip label={typeTooltips[index]} key={value} variant="brand" hasArrow>
                  <Button
                    leftIcon={typeIcons[index]}
                    aria-label={typeLabels[index]}
                    size="sm"
                    rounded="md"
                    bg={isActive ? 'primary-accent.500' : 'transparent'}
                    color={isActive ? 'gray.800' : undefined}
                    _hover={{ bg: isActive ? 'primary-accent.400' : inactiveHoverBg }}
                    _active={{ bg: isActive ? 'primary-accent.400' : inactiveHoverBg }}
                    onClick={() => updateMacroType(index)}
                    fontSize="xs"
                    px={3}
                    transition="background 0.15s"
                  >
                    {typeLabels[index]}
                  </Button>
                </Tooltip>
              )
            })}
        </HStack>

        {/* Inline loop settings — only visible for Toggle */}
        {isToggleMacro && (
          <HStack spacing={3} divider={<StackDivider />}>
            <Text fontSize="xs" fontWeight="semibold" color={mutedText} whiteSpace="nowrap">
              Loop
            </Text>
            <HStack spacing={3}>
              <Checkbox
                isChecked={isInfiniteLoop}
                onChange={(e) => handleInfiniteToggle(e.target.checked)}
                colorScheme="primary-accent"
                size="sm"
              >
                <Text fontSize="xs">Infinite</Text>
              </Checkbox>
              <HStack spacing={2} visibility={isInfiniteLoop ? 'hidden' : 'visible'}>
                <Text fontSize="xs" color={mutedText} whiteSpace="nowrap">Count:</Text>
                <NumberInput
                  size="sm"
                  min={1}
                  max={10000}
                  value={macro.loop_count ?? 10}
                  onChange={handleLoopCountChange}
                  w="72px"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </HStack>
            </HStack>
          </HStack>
        )}

      </HStack>
    </Box>
  )
}
