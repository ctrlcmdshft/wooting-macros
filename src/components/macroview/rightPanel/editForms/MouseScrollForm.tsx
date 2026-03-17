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
import { MouseEventAction } from '../../../../types'
import { BoxText } from '../EditArea'

interface Props {
  selectedElementId: number
  selectedElement: MouseEventAction
}

type ScrollDir = 'Up' | 'Down' | 'Left' | 'Right'

function getDir(delta_x: number, delta_y: number): ScrollDir {
  if (delta_y < 0) return 'Up'
  if (delta_y > 0) return 'Down'
  if (delta_x < 0) return 'Left'
  return 'Right'
}

function toDeltas(dir: ScrollDir, amount: number): { delta_x: number; delta_y: number } {
  switch (dir) {
    case 'Up':    return { delta_x: 0, delta_y: -amount }
    case 'Down':  return { delta_x: 0, delta_y: amount }
    case 'Left':  return { delta_x: -amount, delta_y: 0 }
    case 'Right': return { delta_x: amount, delta_y: 0 }
  }
}

export default function MouseScrollForm({ selectedElementId, selectedElement }: Props) {
  const [dir, setDir] = useState<ScrollDir>('Down')
  const [amount, setAmount] = useState(3)
  const { updateElement } = useMacroContext()

  useEffect(() => {
    if (selectedElement.data.type !== 'Scroll') return
    const { delta_x, delta_y } = selectedElement.data
    setDir(getDir(delta_x, delta_y))
    setAmount(Math.max(Math.abs(delta_x), Math.abs(delta_y)))
  }, [selectedElement])

  const save = useCallback(
    (nextDir: ScrollDir, nextAmount: number) => {
      const temp: MouseEventAction = {
        ...selectedElement,
        data: { type: 'Scroll', ...toDeltas(nextDir, nextAmount) }
      }
      updateElement(temp, selectedElementId)
    },
    [selectedElement, selectedElementId, updateElement]
  )

  const onDirChange = useCallback(
    (newDir: ScrollDir) => {
      setDir(newDir)
      save(newDir, amount)
    },
    [amount, save]
  )

  const onAmountChange = useCallback(
    (_str: string, val: number) => {
      const next = isNaN(val) || val < 1 ? 1 : val
      setAmount(next)
      save(dir, next)
    },
    [dir, save]
  )

  const dirs: ScrollDir[] = ['Up', 'Down', 'Left', 'Right']

  return (
    <>
      <HStack justifyContent="center" p={1}>
        <BoxText>Mouse Scroll</BoxText>
      </HStack>
      <Divider />
      <VStack align="start" w="full" spacing={3}>
        <Text fontSize={['xs', 'sm', 'md']} fontWeight="semibold">
          Direction
        </Text>
        <Flex w="full" gap={2} wrap="wrap">
          {dirs.map((d) => (
            <Button
              key={d}
              variant="brandTertiary"
              size="sm"
              isActive={dir === d}
              onClick={() => onDirChange(d)}
              flex="1"
            >
              {d}
            </Button>
          ))}
        </Flex>
        <Text fontSize={['xs', 'sm', 'md']} fontWeight="semibold">
          Amount
        </Text>
        <NumberInput
          w="100px"
          min={1}
          max={100}
          value={amount}
          onChange={onAmountChange}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </VStack>
    </>
  )
}
