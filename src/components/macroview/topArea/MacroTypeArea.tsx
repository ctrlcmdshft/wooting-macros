import {
  HStack,
  IconButton,
  StackDivider,
  Text,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  VStack,
  Tooltip
} from '@chakra-ui/react'
import { HiArrowDownTray, HiArrowPath, HiArrowRight } from 'react-icons/hi2'
import { useMacroContext } from '../../../contexts/macroContext'
import { MacroType } from '../../../constants/enums'
import { checkIfStringIsNonNumeric } from '../../../constants/utils'

export default function MacroTypeArea() {
  const { macro, updateMacroType, updateLoopCount } = useMacroContext()
  const borderColour = useColorModeValue('gray.400', 'gray.600')
  const typeIcons = [<HiArrowRight key="single" />, <HiArrowPath key="toggle" />, <HiArrowDownTray key="onhold" />]

  const isToggleMacro = macro.macro_type === 'Toggle'
  const isInfiniteLoop = macro.loop_count === null || macro.loop_count === undefined

  const handleInfiniteToggle = (checked: boolean) => {
    if (checked) {
      updateLoopCount(null)
    } else {
      updateLoopCount(10)
    }
  }

  const handleLoopCountChange = (_valueAsString: string, valueAsNumber: number) => {
    if (!isNaN(valueAsNumber) && valueAsNumber > 0) {
      updateLoopCount(valueAsNumber)
    }
  }

  return (
    <VStack align="stretch" spacing="2">
      <HStack
        w="fit"
        h="fit"
        p="2"
        border="1px"
        borderColor={borderColour}
        divider={<StackDivider />}
        rounded='md'
        spacing="16px"
      >
        <Text fontWeight="semibold" fontSize={['sm', 'md']}>
          Macro Type
        </Text>
        <HStack>
          {(Object.keys(MacroType) as Array<keyof typeof MacroType>)
            .filter(checkIfStringIsNonNumeric)
            .map((value: string, index: number) => (
              <Tooltip
                label={
                  index === 0 ? 'Single: Play once' :
                  index === 1 ? 'Toggle: Loop continuously until triggered again' :
                  'On Hold: Play while held (Not yet implemented)'
                }
                key={value}
              >
                <IconButton
                  icon={typeIcons[index]}
                  aria-label="macro type"
                  size="sm"
                  colorScheme={
                    macro.macro_type === value ? 'primary-accent' : 'gray'
                  }
                  onClick={() => updateMacroType(index)}
                  isDisabled={index === 2}
                ></IconButton>
              </Tooltip>
            ))}
        </HStack>
      </HStack>

      {isToggleMacro && (
        <HStack
          w="fit"
          h="fit"
          p="2"
          border="1px"
          borderColor={borderColour}
          rounded='md'
          spacing="16px"
        >
          <Text fontWeight="semibold" fontSize={['sm', 'md']}>
            Loop Settings
          </Text>
          <Checkbox
            isChecked={isInfiniteLoop}
            onChange={(e) => handleInfiniteToggle(e.target.checked)}
            size="sm"
          >
            <Text fontSize={['xs', 'sm']}>Infinite Loop</Text>
          </Checkbox>
          {!isInfiniteLoop && (
            <HStack spacing="2">
              <Text fontSize={['xs', 'sm']}>Count:</Text>
              <NumberInput
                size="sm"
                min={1}
                max={10000}
                value={macro.loop_count ?? 10}
                onChange={handleLoopCountChange}
                w="100px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
          )}
        </HStack>
      )}
    </VStack>
  )
}
