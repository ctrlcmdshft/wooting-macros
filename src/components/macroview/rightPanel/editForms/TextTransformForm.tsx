import {
  Button,
  Divider,
  Flex,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  VStack
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useMacroContext } from '../../../../contexts/macroContext'
import { SystemEventAction } from '../../../../types'
import { BoxText } from '../EditArea'

interface Props {
  selectedElementId: number
  selectedElement: SystemEventAction
}

type Variant = 'uppercase' | 'lowercase' | 'titlecase' | 'repeat'

const options: { value: Variant; label: string }[] = [
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'titlecase', label: 'Title Case' },
  { value: 'repeat', label: 'Repeat' }
]

export default function TextTransformForm({ selectedElementId, selectedElement }: Props) {
  const [variant, setVariant] = useState<Variant>('uppercase')
  const [count, setCount] = useState(2)
  const { updateElement } = useMacroContext()

  useEffect(() => {
    if (selectedElement.data.type !== 'Clipboard') return
    const action = selectedElement.data.action
    if (action.type !== 'TextTransform') return
    setVariant(action.variant as Variant)
    setCount(action.count ?? 2)
  }, [selectedElement])

  const save = useCallback(
    (v: Variant, c: number) => {
      updateElement(
        {
          ...selectedElement,
          data: {
            type: 'Clipboard',
            action: { type: 'TextTransform', variant: v, ...(v === 'repeat' ? { count: c } : {}) }
          }
        },
        selectedElementId
      )
    },
    [selectedElement, selectedElementId, updateElement]
  )

  const onVariantChange = useCallback(
    (v: Variant) => {
      setVariant(v)
      save(v, count)
    },
    [count, save]
  )

  const onCountChange = useCallback(
    (_str: string, val: number) => {
      const next = isNaN(val) || val < 2 ? 2 : val
      setCount(next)
      save(variant, next)
    },
    [variant, save]
  )

  return (
    <>
      <HStack justifyContent="center" p={1}>
        <BoxText>Text Transform</BoxText>
      </HStack>
      <Divider />
      <VStack align="start" w="full" spacing={3}>
        <Text fontSize={['xs', 'sm', 'md']} fontWeight="semibold">Transform</Text>
        <Flex w="full" gap={2} wrap="wrap">
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant="brandTertiary"
              size="sm"
              isActive={variant === opt.value}
              onClick={() => onVariantChange(opt.value)}
              flex="1"
            >
              {opt.label}
            </Button>
          ))}
        </Flex>
        {variant === 'repeat' && (
          <>
            <Text fontSize={['xs', 'sm', 'md']} fontWeight="semibold">Times</Text>
            <NumberInput w="100px" min={2} max={100} value={count} onChange={onCountChange}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </>
        )}
      </VStack>
    </>
  )
}
