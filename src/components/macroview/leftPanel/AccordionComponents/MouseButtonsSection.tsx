import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AspectRatio,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react'
import { MouseInputInfo } from '../../../../constants/MouseMap'
import { MouseIcon } from '../../../icons'
import SelectElementButton from '../SelectElementButton'
import { DefaultMouseDelay } from '../../../../constants'

interface Props {
  elementsToRender: MouseInputInfo[]
}

export default function MouseButtonsSection({ elementsToRender }: Props) {
  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Flex
            flex="1"
            textAlign="left"
            fontWeight="semibold"
            alignItems="center"
            gap={2}
          >
            <MouseIcon />
            Mouse Buttons
          </Flex>
          <AccordionIcon boxSize={6} />
        </AccordionButton>
      </h2>
      <AccordionPanel>
        <SimpleGrid
          h="fit"
          columns={{
            base: 2,
            md: 3,
            xl: 4
          }}
          px={4}
          spacing={2}
        >
          {elementsToRender.map((info: MouseInputInfo) => (
            <AspectRatio ratio={2 / 0.75} key={info.webButtonVal}>
              <SelectElementButton
                nameText={info.displayString}
                properties={{
                  type: 'MouseEventAction',
                  data: {
                    type: 'Press',
                    data: {
                      type: 'DownUp',
                      button: info.enumVal,
                      duration: DefaultMouseDelay
                    }
                  }
                }}
              />
            </AspectRatio>
          ))}
          <AspectRatio ratio={2 / 0.75}>
            <SelectElementButton
              nameText="Scroll"
              descText="Scroll the mouse wheel (configure direction and amount in the edit panel)"
              properties={{ type: 'MouseEventAction', data: { type: 'Scroll', delta_x: 0, delta_y: -3 } }}
            />
          </AspectRatio>
        </SimpleGrid>
      </AccordionPanel>
    </AccordionItem>
  )
}
