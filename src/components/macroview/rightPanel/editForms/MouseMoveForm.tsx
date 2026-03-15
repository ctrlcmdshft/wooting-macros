import {
  Divider,
  Grid,
  GridItem,
  HStack,
  Input,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useMacroContext } from '../../../../contexts/macroContext'
import { MouseEventAction } from '../../../../types'
import { BoxText } from '../EditArea'

interface Props {
  selectedElementId: number
  selectedElement: MouseEventAction
}

export default function MouseMoveForm({
  selectedElementId,
  selectedElement
}: Props) {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const { updateElement } = useMacroContext()
  const toast = useToast()

  useEffect(() => {
    if (selectedElement.data.type !== 'Move') return
    setX(selectedElement.data.x)
    setY(selectedElement.data.y)
  }, [selectedElement])

  const onBlur = useCallback(() => {
    if (Number.isNaN(x) || Number.isNaN(y)) return

    const temp: MouseEventAction = {
      ...selectedElement,
      data: { type: 'Move', x, y }
    }
    updateElement(temp, selectedElementId)
  }, [x, y, selectedElement, selectedElementId, updateElement])

  return (
    <>
      <HStack justifyContent="center" p={1}>
        <BoxText>Mouse Move</BoxText>
      </HStack>
      <Divider />
      <Text fontSize={['xs', 'sm']} color="gray.500" pt={1}>
        Moves the cursor to an absolute screen position.
      </Text>
      <Grid templateRows="20px 1fr" gap="2" w="full" mt={2}>
        <GridItem w="full" h="8px" alignItems="center" justifyContent="center">
          <Text fontSize={['xs', 'sm', 'md']}>X position (pixels)</Text>
        </GridItem>
        <VStack w="full">
          <Input
            type="number"
            variant="brandAccent"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            onBlur={onBlur}
            isInvalid={Number.isNaN(x)}
          />
        </VStack>
      </Grid>
      <Grid templateRows="20px 1fr" gap="2" w="full" mt={2}>
        <GridItem w="full" h="8px" alignItems="center" justifyContent="center">
          <Text fontSize={['xs', 'sm', 'md']}>Y position (pixels)</Text>
        </GridItem>
        <VStack w="full">
          <Input
            type="number"
            variant="brandAccent"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            onBlur={onBlur}
            isInvalid={Number.isNaN(y)}
          />
        </VStack>
      </Grid>
    </>
  )
}
