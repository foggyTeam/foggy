import { Ellipse, Image, Layer, Line, Rect } from 'react-konva';
import { BoardElement } from '@/app/lib/types/definitions';

const MIN_WIDTH = 4;
const MIN_HEIGHT = 4;

export default function BoardLayer({
  layer,
  updateElement,
  fitCoordinates,
  handleSelect,
}: {
  layer: BoardElement[];
  updateElement: (id: string, newAttrs: Partial<any>) => void;
  handleSelect: (event) => void;
  fitCoordinates: (
    pos: { x: number; y: number },
    element: any,
  ) => { x: number; y: number };
}) {
  const holdTransformEnd = (e, element) => {
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
                dragBoundFunc={(pos) => fitCoordinates(pos, element)}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTransformEnd={(e) => holdTransformEnd(e, element)}
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
              />
            );
          default:
            return null;
        }
      })}
    </Layer>
  );
}
