import { SystemEventAction } from '../../../../types'
import ClipboardForm from './ClipboardForm'
import EmptyForm from './EmptyForm'
import OpenEventForm from './OpenEventForm'
import TextEffectForm from './TextEffectForm'
import TextTransformForm from './TextTransformForm'

interface Props {
  selectedElement: SystemEventAction
  selectedElementId: number
}

export default function SystemEventActionForm({
  selectedElement,
  selectedElementId
}: Props) {
  switch (selectedElement.data.type) {
    case 'Open':
      return (
        <OpenEventForm
          selectedElementId={selectedElementId}
          selectedElement={selectedElement}
        />
      )
    case 'Volume':
      return <EmptyForm />
    case 'Clipboard':
      if (
        selectedElement.data.action.type === 'PasteUserDefinedString' ||
        selectedElement.data.action.type === 'TypeText'
      ) {
        return (
          <ClipboardForm
            selectedElementId={selectedElementId}
            selectedElement={selectedElement}
          />
        )
      } else if (selectedElement.data.action.type === 'TextTransform') {
        return (
          <TextTransformForm
            selectedElementId={selectedElementId}
            selectedElement={selectedElement}
          />
        )
      } else if (selectedElement.data.action.type === 'TextEffect') {
        return (
          <TextEffectForm
            selectedElementId={selectedElementId}
            selectedElement={selectedElement}
          />
        )
      } else {
        return <EmptyForm />
      }
    default:
      return <EmptyForm />
  }
}
