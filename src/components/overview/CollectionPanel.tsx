import { CloseIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  Tooltip,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { useApplicationContext } from '../../contexts/applicationContext'
import { useSelectedCollection } from '../../contexts/selectors'
import DeleteCollectionModal from './DeleteCollectionModal'
import MacroList from './MacroList'
import { useCallback, useEffect, useMemo, useState } from 'react'
import EmojiPopover from '../EmojiPopover'
import useMainBgColour from '../../hooks/useMainBgColour'
import useBorderColour from '../../hooks/useBorderColour'
import { HIDLookup, webCodeLocationHidEncode, webCodeLocationHIDLookup } from '../../constants/HIDmap'

interface Props {
  searchValue: string
}

export default function CollectionPanel({ searchValue }: Props) {
  const {
    collections,
    selection,
    onCollectionUpdate,
    onSelectedCollectionDelete
  } = useApplicationContext()
  const currentCollection = useSelectedCollection()
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose
  } = useDisclosure()
  const {
    isOpen: isEmojiPopoverOpen,
    onOpen: onEmojiPopoverOpen,
    onClose: onEmojiPopoverClose
  } = useDisclosure()
  const [collectionName, setCollectionName] = useState('')
  const [listeningForToggleKey, setListeningForToggleKey] = useState(false)
  const borderColour = useBorderColour()

  const toggleKeyName = currentCollection.toggle_key
    ? HIDLookup.get(currentCollection.toggle_key)?.displayString ?? `HID ${currentCollection.toggle_key}`
    : 'Not set'

  const onCaptureToggleKey = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      const hidInfo = webCodeLocationHIDLookup.get(webCodeLocationHidEncode(e.which, e.location))
      if (hidInfo) {
        onCollectionUpdate({ ...currentCollection, toggle_key: hidInfo.HIDcode }, selection.collectionIndex)
      }
      setListeningForToggleKey(false)
    },
    [currentCollection, onCollectionUpdate, selection.collectionIndex]
  )

  useEffect(() => {
    if (!listeningForToggleKey) return
    window.addEventListener('keydown', onCaptureToggleKey, true)
    return () => window.removeEventListener('keydown', onCaptureToggleKey, true)
  }, [listeningForToggleKey, onCaptureToggleKey])
  const isCollectionUndeletable = collections.length <= 1
  const isSearching: boolean = useMemo((): boolean => {
    return searchValue.length !== 0
  }, [searchValue])

  useEffect(() => {
    setCollectionName(currentCollection.name)
  }, [currentCollection.name])

  const onEmojiSelect = useCallback(
    (emoji: { shortcodes: string }) => {
      if (emoji.shortcodes === currentCollection.icon) {
        return
      }
      onCollectionUpdate(
        { ...currentCollection, icon: emoji.shortcodes },
        selection.collectionIndex
      )
    },
    [currentCollection, onCollectionUpdate, selection.collectionIndex]
  )

  const onCollectionNameChange = useCallback(() => {
    if (collectionName === currentCollection.name) {
      return
    }

    if (collectionName === '') {
      onCollectionUpdate(
        {
          ...currentCollection,
          name: `Collection ${selection.collectionIndex + 1}`
        },
        selection.collectionIndex
      )
    } else {
      onCollectionUpdate(
        {
          ...currentCollection,
          name: collectionName
        },
        selection.collectionIndex
      )
    }
  }, [
    collectionName,
    currentCollection,
    onCollectionUpdate,
    selection.collectionIndex
  ])

  return (
    <VStack w="full" h="100vh" spacing="0">
      <Flex
        bg={useMainBgColour()}
        justifyContent="space-between"
        alignItems="center"
        py={2}
        px={4}
        w="full"
        h="90px"
        borderBottom="1px"
        borderColor={borderColour}
      >
        {!isSearching ? (
          <HStack w="full" justifyContent="space-between">
            <HStack w="full" spacing={4}>
              <EmojiPopover
                shortcodeToShow={currentCollection.icon}
                isEmojiPopoverOpen={isEmojiPopoverOpen}
                onEmojiPopoverClose={onEmojiPopoverClose}
                onEmojiPopoverOpen={onEmojiPopoverOpen}
                onEmojiSelect={onEmojiSelect}
              />
              <Input
                w="fit"
                variant="flushed"
                onChange={(event) => setCollectionName(event.target.value)}
                onBlur={onCollectionNameChange}
                value={collectionName}
                size="xl"
                fontSize="25px"
                textStyle="name"
                placeholder="Collection Name"
                _placeholder={{ opacity: 1, color: borderColour }}
                _focusVisible={{ borderColor: 'primary-accent.500' }}
              />
            </HStack>
            <HStack w="fit">
              <HStack spacing={1}>
                <Tooltip
                  variant="brand"
                  label={
                    listeningForToggleKey
                      ? 'Press any key to assign it as the toggle shortcut'
                      : currentCollection.toggle_key != null
                      ? `Toggle shortcut: ${toggleKeyName} — press to reassign. This key enables/disables the collection while the app runs.`
                      : 'Assign a key to toggle this collection on/off while the app is running'
                  }
                  hasArrow
                  placement="bottom"
                >
                  <Button
                    variant="brandRecord"
                    size="sm"
                    isActive={listeningForToggleKey}
                    onClick={() => setListeningForToggleKey(true)}
                    minW="90px"
                  >
                    {listeningForToggleKey
                      ? 'Press a key...'
                      : currentCollection.toggle_key != null
                      ? toggleKeyName
                      : 'Toggle key'}
                  </Button>
                </Tooltip>
                {currentCollection.toggle_key != null && (
                  <Tooltip variant="brand" label="Remove toggle shortcut" hasArrow placement="bottom">
                    <IconButton
                      aria-label="Remove toggle shortcut"
                      icon={<CloseIcon boxSize={2} />}
                      variant="brandWarning"
                      size="sm"
                      onClick={() => onCollectionUpdate({ ...currentCollection, toggle_key: null }, selection.collectionIndex)}
                    />
                  </Tooltip>
                )}
              </HStack>
              {/* <Button leftIcon={<AddIcon />} size={['xs', 'sm', 'md']} isDisabled>
              Export Collection
            </Button>
            <Button leftIcon={<AddIcon />} size={['xs', 'sm', 'md']} isDisabled>
              Import Macros
            </Button> */}
              <Tooltip
                variant="brand"
                label={
                  isCollectionUndeletable
                    ? "Can't delete your last collection!"
                    : ''
                }
                hasArrow
                placement="bottom-start"
              >
                <Box>
                  <Button
                    leftIcon={<DeleteIcon />}
                    variant="brandWarning"
                    size="md"
                    isDisabled={isCollectionUndeletable}
                    onClick={
                      currentCollection.macros.length !== 0
                        ? onDeleteModalOpen
                        : onSelectedCollectionDelete
                    }
                    aria-label="Delete Collection"
                  >
                    Delete Collection
                  </Button>
                </Box>
              </Tooltip>
            </HStack>
          </HStack>
        ) : (
          <HStack>
            <Text as="b" fontSize="3xl">
              Search
            </Text>
          </HStack>
        )}
      </Flex>
      <DeleteCollectionModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
      />
      <MacroList searchValue={searchValue} />
    </VStack>
  )
}
