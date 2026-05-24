'use client';

import {
  Ellipse,
  Image,
  Layer,
  Line,
  Arrow,
  Rect,
  Star,
  Path,
} from 'react-konva';
import {
  ImageElement,
  SBoardElement,
  TextElement,
} from '@/app/lib/types/definitions';
import { HtmlToSvg } from '@/app/lib/utils/htmlToSvg';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';

const MIN_WIDTH = 4;
const MIN_HEIGHT = 4;
const IMAGE_PLACEHOLDER_URL = '/images/undraw_playful-cat_3ta5.png';

const HEART_SVG_PATTERN = `M 50 30
  C 50 20, 35 10, 20 20
  C 5 30, 5 50, 20 65
  L 50 95
  L 80 65
  C 95 50, 95 30, 80 20
  C 65 10, 50 20, 50 30 Z`;

function getPlaceholderImage() {
  const imageElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'image',
  ) as SVGImageElement;
  imageElement.setAttributeNS(
    'http://www.w3.org/1999/xlink',
    'href',
    IMAGE_PLACEHOLDER_URL,
  );
  return imageElement;
}

const BoardLayer = observer(({ layer }: { layer: SBoardElement[] }) => {
  const imagePlaceholderElement = useRef<SVGImageElement>(
    getPlaceholderImage(),
  );
  const imageElementsMapRef = useRef<Map<string, SVGImageElement>>(new Map());
  const [_, setRerenderTrigger] = useState(false);

  const {
    updateElement,
    handleSelect,
    handleTextEdit,
    transformAvailable,
    allToolsDisabled,
  } = useBoardContext();
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

  const holdTransformEnd = (e: any, element: SBoardElement) => {
    const node = e.target;

    if (element.type === 'line') {
      updateElement(element.id, {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
      });
      return;
    }
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

  function saveImageByUrl(element: ImageElement | TextElement) {
    switch (element.type) {
      case 'image': {
        if (!element.url) break;

        const imageElement = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'image',
        ) as SVGImageElement;
        imageElement.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'href',
          element.url,
        );
        imageElement.setAttribute('width', element.width.toString());
        imageElement.setAttribute('height', element.height.toString());

        imageElementsMapRef.current.set(element.id, imageElement);
        break;
      }
      case 'text': {
        const textImageElement = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'image',
        ) as SVGImageElement;
        textImageElement.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'href',
          element.svg,
        );

        textImageElement.setAttribute('width', element.width.toString());
        textImageElement.setAttribute('height', element.height.toString());

        imageElementsMapRef.current.set(element.id, textImageElement);
      }
    }
    setRerenderTrigger((v) => !v);
  }

  return (
    <Layer>
      {layer.map((element) => {
        switch (element.type) {
          case 'image': {
            if (!imagePlaceholderElement.current) return null;
            if (!imageElementsMapRef.current.has(element.id) && element.url)
              saveImageByUrl(element);
            return (
              <Image
                onTap={handleSelect}
                key={element.id}
                image={
                  imageElementsMapRef.current.get(element.id) ||
                  imagePlaceholderElement.current
                }
                {...element}
                onClick={handleSelect}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                alt={element.url}
                draggable={transformAvailable && !allToolsDisabled}
              />
            );
          }
          case 'rect':
            return (
              <Rect
                key={element.id}
                {...element}
                onClick={handleSelect}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTap={handleSelect}
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                draggable={transformAvailable && !allToolsDisabled}
              />
            );
          case 'ellipse':
            return (
              <Ellipse
                key={element.id}
                {...element}
                onTap={handleSelect}
                onClick={handleSelect}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                radiusX={element.width / 2}
                radiusY={element.height / 2}
                draggable={transformAvailable && !allToolsDisabled}
              />
            );
          case 'line':
            return (
              <Line
                key={element.id}
                {...element}
                onTap={handleSelect}
                onClick={handleSelect}
                onDragEnd={(e: any) => {
                  updateElement(element.id, {
                    x: e.target.attrs.x,
                    y: e.target.attrs.y,
                  });
                }}
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                draggable={transformAvailable && !allToolsDisabled}
              />
            );
          case 'text': {
            if (!imagePlaceholderElement.current) return null;
            if (!imageElementsMapRef.current.has(element.id) && element.svg)
              saveImageByUrl(element);
            return (
              <Image
                onTap={handleSelect}
                key={element.id}
                image={
                  imageElementsMapRef.current.get(element.id) ||
                  imagePlaceholderElement.current
                }
                {...element}
                onClick={handleSelect}
                onDblClick={handleTextEdit}
                onDblTap={handleTextEdit}
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
                draggable={transformAvailable && !allToolsDisabled}
              />
            );
          }
          case 'star':
            return (
              <Star
                key={element.id}
                {...element}
                onClick={handleSelect}
                onDragEnd={(e) =>
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
                onTap={handleSelect}
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                draggable={transformAvailable && !allToolsDisabled}
              />
            );
          case 'triangle':
            return (
              <Line
                key={element.id}
                {...element}
                onTap={handleSelect}
                onClick={handleSelect}
                onDragEnd={(e: any) => {
                  updateElement(element.id, {
                    x: e.target.attrs.x,
                    y: e.target.attrs.y,
                  });
                }}
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                draggable={transformAvailable && !allToolsDisabled}
                closed
              />
            );
          case 'heart':
            const { width, height, ...rest } = element;
            return (
              <Path
                key={element.id}
                {...rest}
                scaleX={width / 100}
                scaleY={height / 100}
                data={HEART_SVG_PATTERN}
                onTap={handleSelect}
                onClick={handleSelect}
                onDragEnd={(e: any) => {
                  updateElement(element.id, {
                    x: e.target.attrs.x,
                    y: e.target.attrs.y,
                  });
                }}
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                draggable={transformAvailable && !allToolsDisabled}
                closed
              />
            );
          case 'arrow':
            return (
              <Arrow
                key={element.id}
                {...element}
                fill={element.stroke}
                onTap={handleSelect}
                onClick={handleSelect}
                onDragEnd={(e: any) => {
                  updateElement(element.id, {
                    x: e.target.attrs.x,
                    y: e.target.attrs.y,
                  });
                }}
                onTransformEnd={(e) => holdTransformEnd(e, element)}
                draggable={transformAvailable && !allToolsDisabled}
              />
            );
          default:
            return null;
        }
      })}
    </Layer>
  );
});

export default BoardLayer;
