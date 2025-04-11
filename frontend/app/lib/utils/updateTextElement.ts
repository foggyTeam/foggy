import { TextElement } from '@/app/lib/types/definitions';
import { HtmlToSvg } from '@/app/lib/utils/htmlToSvg';

export default function UpdateTextElement(
  element: TextElement,
  newAttrs: Partial<TextElement>,
): TextElement {
  if (
    element.content !== newAttrs.content ||
    element.width !== newAttrs.width ||
    element.height !== newAttrs.height
  ) {
    const newElement = { ...element, ...newAttrs } as TextElement;
    const svg = HtmlToSvg(
      newElement.content,
      newElement.width,
      newElement.height,
    );
    return { ...newElement, svg: svg } as TextElement;
  }
  return { ...element, ...newAttrs } as TextElement;
}
