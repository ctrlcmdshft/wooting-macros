import {
  Heading,
  ListItem,
  Text,
  UnorderedList,
  useColorModeValue,
  VStack
} from '@chakra-ui/react'

export default function PatchNotesPanel() {
  const whatsNewTextColour = useColorModeValue('green.600', 'green.300')
  const textColour = useColorModeValue('primary-light.900', 'primary-dark.100')
  const highlightedTextColour = useColorModeValue(
    'primary-accent.800',
    'primary-accent.300'
  )
  return (
    <VStack w="full" spacing={4}>
      <Text w="full" fontWeight="bold" fontSize="sm">
        March 2026, v. 1.1.1-beta
      </Text>
      <VStack w="full">
        <Heading w="full" size="lg" textColor={whatsNewTextColour}>
          What's New
        </Heading>
        <UnorderedList
          w="full"
          px="8"
          spacing={2}
          textColor={textColour}
          fontWeight="semibold"
        >
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Toggle macro looping.&nbsp;
            </Text>
            Toggle macros can now loop — set a fixed loop count or run
            infinitely until triggered again to stop.
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Copy macro to collection.&nbsp;
            </Text>
            Right-click any macro card to copy it to another collection.
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Clipboard restore.&nbsp;
            </Text>
            Paste User Defined String now restores your original clipboard
            content after pasting.
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Bug fixes.&nbsp;
            </Text>
            Fixed auto-add delay recording, random collection icons, context
            menu z-index, and various form loading bugs.
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              SmartScreen warning.&nbsp;
            </Text>
            This build is unsigned. Windows may show a SmartScreen warning on
            first launch — click "More info" then "Run anyway" to proceed.
          </ListItem>
        </UnorderedList>
      </VStack>
      <Text w="full" fontWeight="bold" fontSize="sm">
        December 21st, 2023, v. 1.1
      </Text>
      <VStack w="full">
        <Heading w="full" size="lg" textColor={whatsNewTextColour}>
          What's New
        </Heading>
        <UnorderedList
          w="full"
          px="8"
          spacing={2}
          textColor={textColour}
          fontWeight="semibold"
        >
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              New UI.&nbsp;
            </Text>
            New, smoother UI with animations and nicer colors.
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Macro search.&nbsp;
            </Text>
            You can now search your macros from the main window across all
            collections.
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Security updates and bugfixes.&nbsp;
            </Text>
            We updated the dependencies so Wootomation stays secure. You can now
            also use any layout for a trigger key.
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Gaming.&nbsp;
            </Text>
            Macros now work in games! However, we don't support nor endorse
            their use in multiplayer games, using them in such context is at
            your own risk!
          </ListItem>
          <ListItem>
            <Text
              as="span"
              fontFamily="Montserrat"
              textColor={highlightedTextColour}
            >
              Keycombos.&nbsp;
            </Text>
            Key combos should now work properly, so you can now do the
            CTRL+SHIFT+KEY combos you always wanted.
          </ListItem>
        </UnorderedList>
      </VStack>
    </VStack>
  )
}
