import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Switch,
  Text,
  useColorModeValue,
  useToast,
  VStack
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useMacroContext } from '../../../../contexts/macroContext'
import { DelayEventAction } from '../../../../types'
import { DefaultDelayDelay } from '../../../../constants'
import { ResetDefaultIcon } from '../../../icons'
import { useSettingsContext } from '../../../../contexts/settingsContext'
import { BoxText } from '../EditArea'

interface Props {
  selectedElementId: number
  selectedElement: DelayEventAction
}

export default function DelayForm({
  selectedElementId,
  selectedElement
}: Props) {
  const config = useSettingsContext()
  const [delayDuration, setDelayDuration] = useState(
    config.config.DefaultDelayValue
  )
  const [isRandom, setIsRandom] = useState(false)
  const [randomMax, setRandomMax] = useState(config.config.DefaultDelayValue)
  const { updateElement } = useMacroContext()
  const bg = useColorModeValue('primary-light.50', 'primary-dark.700')
  const kebabColour = useColorModeValue('primary-light.500', 'primary-dark.500')
  const toast = useToast()

  useEffect(() => {
    if (
      selectedElement === undefined ||
      selectedElement.type !== 'DelayEventAction'
    )
      return

    setDelayDuration(selectedElement.data)
    if (selectedElement.random_max !== undefined) {
      setIsRandom(true)
      setRandomMax(selectedElement.random_max)
    } else {
      setIsRandom(false)
      setRandomMax(selectedElement.data)
    }
  }, [selectedElement])

  const onDelayDurationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDelayDuration(Number(event.target.value))
    },
    [setDelayDuration]
  )

  const onRandomMaxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRandomMax(Number(event.target.value))
    },
    [setRandomMax]
  )

  const onInputBlur = useCallback(() => {
    let duration = delayDuration

    if (delayDuration < 1) {
      toast({
        title: 'Minimum duration applied',
        description: 'Applied minimum duration of 1ms',
        status: 'info',
        duration: 4000,
        isClosable: true
      })
      duration = 1
    } else if (Number.isNaN(duration)) {
      return
    }

    let max = randomMax
    if (isRandom && randomMax <= duration) {
      max = duration + 1
      setRandomMax(max)
    }

    const temp: DelayEventAction = {
      ...selectedElement,
      data: duration,
      random_max: isRandom ? max : undefined
    }
    updateElement(temp, selectedElementId)
  }, [
    delayDuration,
    isRandom,
    randomMax,
    selectedElement,
    selectedElementId,
    toast,
    updateElement
  ])

  const onRandomMaxBlur = useCallback(() => {
    if (Number.isNaN(randomMax)) return

    let max = randomMax
    if (max <= delayDuration) {
      max = delayDuration + 1
      setRandomMax(max)
      toast({
        title: 'Max adjusted',
        description: 'Max must be greater than min',
        status: 'info',
        duration: 3000,
        isClosable: true
      })
    }

    const temp: DelayEventAction = {
      ...selectedElement,
      data: delayDuration,
      random_max: max
    }
    updateElement(temp, selectedElementId)
  }, [
    randomMax,
    delayDuration,
    selectedElement,
    selectedElementId,
    toast,
    updateElement
  ])

  const onRandomToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked
      setIsRandom(checked)
      const newMax = checked ? Math.max(randomMax, delayDuration + 1) : undefined
      if (checked) setRandomMax(newMax!)
      const temp: DelayEventAction = {
        ...selectedElement,
        data: delayDuration,
        random_max: newMax
      }
      updateElement(temp, selectedElementId)
    },
    [
      delayDuration,
      randomMax,
      selectedElement,
      selectedElementId,
      updateElement
    ]
  )

  const onResetClick = useCallback(() => {
    toast({
      title: 'Default duration applied',
      description: `Applied default duration of ${config.config.DefaultDelayValue}ms`,
      status: 'info',
      duration: 4000,
      isClosable: true
    })
    setDelayDuration(config.config.DefaultDelayValue)
    setIsRandom(false)
    const temp: DelayEventAction = {
      ...selectedElement,
      data: config.config.DefaultDelayValue,
      random_max: undefined
    }
    updateElement(temp, selectedElementId)
  }, [
    toast,
    config.config.DefaultDelayValue,
    selectedElement,
    updateElement,
    selectedElementId
  ])

  return (
    <>
      <HStack justifyContent="center" p={1}>
        <BoxText>Delay</BoxText>
      </HStack>
      <Divider />
      <Grid templateRows="20px 1fr" gap="2" w="full">
        <GridItem w="full" h="8px" alignItems="center" justifyContent="center">
          <Text fontSize={['xs', 'sm', 'md']}>
            {isRandom ? 'Min (ms)' : 'Duration (ms)'}
          </Text>
        </GridItem>
        <VStack w="full">
          <Input
            type="number"
            placeholder={String(DefaultDelayDelay)}
            variant="brandAccent"
            value={delayDuration}
            onChange={onDelayDurationChange}
            onBlur={onInputBlur}
            isInvalid={Number.isNaN(delayDuration)}
          />
          {isRandom && (
            <>
              <Text fontSize={['xs', 'sm', 'md']} alignSelf="flex-start">
                Max (ms)
              </Text>
              <Input
                type="number"
                variant="brandAccent"
                value={randomMax}
                onChange={onRandomMaxChange}
                onBlur={onRandomMaxBlur}
                isInvalid={Number.isNaN(randomMax) || randomMax <= delayDuration}
              />
            </>
          )}
          <FormControl display="flex" alignItems="center" pt={1}>
            <FormLabel mb="0" fontSize={['xs', 'sm', 'md']}>
              Random range
            </FormLabel>
            <Switch
              isChecked={isRandom}
              onChange={onRandomToggle}
              colorScheme="yellow"
            />
          </FormControl>
          <Button
            variant="brandTertiary"
            leftIcon={<ResetDefaultIcon />}
            w="full"
            value=""
            m={1}
            size={['sm', 'md']}
            onClick={onResetClick}
          >
            <Text fontSize={['sm', 'md']}>Reset to Default</Text>
          </Button>
        </VStack>
      </Grid>
    </>
  )
}
