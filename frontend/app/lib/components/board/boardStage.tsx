'use client';

import React, { ReactNode, useRef } from 'react';
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva';
import GridLayer from '@/app/lib/components/board/gridLayer';
import { Button } from '@heroui/button';
import { MaximizeIcon } from 'lucide-react';
import BoardLayer from '@/app/lib/components/board/boardLayer';
import UseBoardZoom from '@/app/lib/hooks/useBoardZoom';
import UseBoardNavigation from '@/app/lib/hooks/useBoardNavigation';
import ToolBar from '@/app/lib/components/board/menu/toolBar';
import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import { primary } from '@/tailwind.config';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { createPortal } from 'react-dom';
import TextEditor from '@/app/lib/components/board/tools/textEditor/textEditor';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

const GRID_SIZE = 24;
const MAX_X = 1000;
const MAX_Y = 1000;
const MIN_X = -2000;
const MIN_Y = -2000;

export const fitCoordinates = (
  x: number,
  y: number,
  elementWidth: number = 200,
  elementHeight: number = 200,
  scale: number,
) => {
  let newX = x;
  let newY = y;

  if (newX >= MAX_X * scale) {
    newX = MAX_X * scale - 1;
  } else if (newX - elementWidth <= MIN_X * scale) {
    newX = MIN_X * scale + elementWidth + 1;
  }

  if (newY >= MAX_Y * scale) {
    newY = MAX_Y * scale - 1;
  } else if (newY - elementHeight <= MIN_Y * scale) {
    newY = MIN_Y * scale + elementHeight + 1;
  }
  return { x: newX, y: newY };
};

const BoardStage = observer(() => {
  const {
    stageRef,
    scale,
    setScale,
    selectedElements,
    activeTool,
    isEditingText,
    setIsEditingText,
    textContent,
    setTextContent,
    handleSelect,
    resetStage,
  } = useBoardContext();
  const selectionRef: any = useRef(null);

  UseBoardNavigation(stageRef, scale);
  UseBoardZoom(stageRef, scale, setScale);

  return (
    <>
      <Stage
        width={window?.innerWidth}
        height={window?.innerHeight}
        ref={stageRef}
        onClick={handleSelect}
      >
        <GridLayer gridSize={GRID_SIZE} />

        {projectsStore.activeBoard?.layers?.map((layer, index) => (
          <BoardLayer
            key={index}
            layer={layer}
            fitCoordinates={(pos, element) =>
              fitCoordinates(pos.x, pos.y, element.width, element.height, scale)
            }
          />
        ))}

        {selectedElements.length > 0 && !activeTool && (
          <Layer>
            <Group draggable>
              {selectedElements.map((element, index) => (
                <Rect key={index} />
              ))}
              <Transformer
                ref={selectionRef}
                nodes={selectedElements}
                rotationSnapTolerance={16}
                boundBoxFunc={(oldBox, newBox) =>
                  Math.abs(newBox.width) < 4 || Math.abs(newBox.height) < 4
                    ? oldBox
                    : newBox
                }
                borderStroke={primary['400']}
                anchorStroke={primary['400']}
                anchorCornerRadius={16}
                rotateAnchorCursor="grab"
              />
            </Group>
          </Layer>
        )}
      </Stage>

      <div className="flex justify-center">
        <ToolBar />
      </div>

      {isEditingText &&
        createPortal(
          (
            <TextEditor
              top={isEditingText.y}
              left={isEditingText.x}
              content={textContent}
              setContent={setTextContent}
              height={isEditingText.textHeight}
              setHeight={(newHeight: number) =>
                setIsEditingText({ ...isEditingText, textHeight: newHeight })
              }
              width={isEditingText.textWidth}
            />
          ) as ReactNode,
          document.body,
        )}

      <FTooltip content={settingsStore.t.toolTips.resetStage}>
        <Button
          onPress={resetStage}
          isIconOnly
          color="secondary"
          variant="light"
          size="md"
          className="invisible absolute bottom-4 right-16 z-50 font-semibold sm:visible"
        >
          <MaximizeIcon />
        </Button>
      </FTooltip>
    </>
  );
});

export default BoardStage;
