import { Ellipse, Image, Layer, Line, Rect } from 'react-konva';
import { BoardElement, TextElement } from '@/app/lib/types/definitions';
import { HtmlToSvg } from '@/app/lib/utils/htmlToSvg';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

const MIN_WIDTH = 4;
const MIN_HEIGHT = 4;

export default function BoardLayer({
  layer,
  fitCoordinates,
}: {
  layer: BoardElement[];
  fitCoordinates: (
    pos: { x: number; y: number },
    element: any,
  ) => { x: number; y: number };
}) {
  const { updateElement, handleSelect, handleTextEdit, transformAvailable } =
    useBoardContext();
  const holdTextTransform = (e: any, element: TextElement) => {
    const node = e.target;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const width = Math.max(MIN_WIDTH, node.width() * scaleX);
    const height = Math.max(MIN_HEIGHT, node.height() * scaleY);

    const newSvg = HtmlToSvg(element.content, width, height);
    const newImage = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image',
    ) as SVGImageElement;
    newImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', newSvg);
    newImage.setAttribute('width', width.toString());
    newImage.setAttribute('height', height.toString());

    node.setAttr('attrs', {
      ...node.attrs,
      image: newImage,
    });
  };

  const holdTransformEnd = (e: any, element: BoardElement) => {
    const node = e.target;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(MIN_WIDTH, node.width() * scaleX),
      height: Math.max(MIN_HEIGHT, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  return (
    <Layer>
      {layer.map((element) => {
        switch (element.type) {
          case 'rect':
            return (
              <Rect
                key={element.id}
                {...element}
                onClick={handleSelect}
                dragBoundFunc={(pos) => fitCoordinates(pos, element)}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                draggable={transformAvailable}
              />
            );
          case 'ellipse':
            return (
              <Ellipse
                key={element.id}
                {...element}
                onClick={handleSelect}
                dragBoundFunc={(pos) => fitCoordinates(pos, element)}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                radiusX={element.width / 2}
                radiusY={element.height / 2}
                draggable={transformAvailable}
              />
            );
          case 'line':
            return (
              <Line
                key={element.id}
                {...element}
                onClick={handleSelect}
                dragBoundFunc={(pos) => fitCoordinates(pos, element)}
                onDragEnd={(e: any) =>
                  updateElement(element.id, { points: e.target.points() })
                }
                draggable={transformAvailable}
              />
            );
          case 'text':
            const imageElement = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'image',
            ) as SVGImageElement;
            imageElement.setAttributeNS(
              'http://www.w3.org/1999/xlink',
              'href',
              element.svg,
            );

            imageElement.setAttribute('width', element.width.toString());
            imageElement.setAttribute('height', element.height.toString());

            return (
              <Image
                key={element.id}
                image={imageElement}
                {...element}
                onClick={handleSelect}
                onDblClick={handleTextEdit}
                dragBoundFunc={(pos) => fitCoordinates(pos, element)}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTransform={(e) =>
                  holdTextTransform(e, element as TextElement)
                }
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                alt={element.content}
                draggable={transformAvailable}
              />
            );
          case 'marker':
            return (
              <Line
                key={element.id}
                {...element}
                onClick={handleSelect}
                dragBoundFunc={(pos) => fitCoordinates(pos, element)}
                onDragEnd={(e: any) =>
                  updateElement(element.id, { points: e.target.points() })
                }
                draggable={transformAvailable}
              />
            );
          default:
            return null;
        }
      })}
    </Layer>
  );
}
