import { Button, Divider, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useMacroContext } from '../../../../contexts/macroContext'
import { SystemEventAction } from '../../../../types'
import { BoxText } from '../EditArea'

interface Props {
  selectedElementId: number
  selectedElement: SystemEventAction
}

type Variant = 'sarcasm' | 'reverse' | 'leetspeak'

const options: { value: Variant; label: string }[] = [
  { value: 'sarcasm', label: 'Sarcasm' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'leetspeak', label: 'Leetspeak' }
]

export default function TextEffectForm({ selectedElementId, selectedElement }: Props) {
  const [variant, setVariant] = useState<Variant>('sarcasm')
  const { updateElement } = useMacroContext()

  useEffect(() => {
    if (selectedElement.data.type !== 'Clipboard') return
    const action = selectedElement.data.action
    if (action.type !== 'TextEffect') return
    setVariant(action.variant as Variant)
  }, [selectedElement])

  const onVariantChange = useCallback(
    (v: Variant) => {
      setVariant(v)
      updateElement(
        {
          ...selectedElement,
          data: { type: 'Clipboard', action: { type: 'TextEffect', variant: v } }
        },
        selectedElementId
      )
    },
    [selectedElement, selectedElementId, updateElement]
  )

  return (
    <>
      <HStack justifyContent="center" p={1}>
        <BoxText>Text Effect</BoxText>
      </HStack>
      <Divider />
      <VStack align="start" w="full" spacing={3}>
        <Text fontSize={['xs', 'sm', 'md']} fontWeight="semibold">Effect</Text>
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
      </VStack>
    </>
  )
}
