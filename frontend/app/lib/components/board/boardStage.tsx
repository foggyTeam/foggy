'use client';

import React, { useRef, useState } from 'react';
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva';
import GridLayer from '@/app/lib/components/board/gridLayer';
import { Button } from '@heroui/button';
import { BoxSelectIcon } from 'lucide-react';
import { BoardElement } from '@/app/lib/types/definitions';
import BoardLayer from '@/app/lib/components/board/boardLayer';
import UseBoardZoom from '@/app/lib/hooks/useBoardZoom';
import UseBoardNavigation from '@/app/lib/hooks/useBoardNavigation';
import ToolBar from '@/app/lib/components/board/menu/toolBar';
import { observer } from 'mobx-react-lite';
import projectsStore from '@/app/stores/projectsStore';
import { primary } from '@/tailwind.config';
import ElementToolBar from '@/app/lib/components/board/menu/elementToolBar';

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
  const stageRef: any = useRef(null);
  const [scale, setScale] = useState(1);

  UseBoardNavigation(stageRef, scale);
  UseBoardZoom(stageRef, scale, setScale);

  const resetStage = () => {
    const stage = stageRef.current;
    if (stage) {
      stage.position({ x: 0, y: 0 });
      setScale(1);
      stage.scale({ x: 1, y: 1 });
      stage.batchDraw();
    }
  };

  const [selectedElements, changeSelection] = useState([]);
  const selectionRef: any = useRef(null);

  const handleSelect = (e) => {
    const element: BoardElement = e.target;

    changeSelection((prevState) => {
      if (e.evt.ctrlKey || e.evt.metaKey || prevState.length === 0) {
        return prevState.findIndex((el) => el._id === e.target._id) === -1
          ? [...prevState, element]
          : prevState.filter((v) => v._id !== e.target._id);
      } else {
        return prevState.findIndex((el) => el._id === e.target._id) === -1
          ? [element]
          : [];
      }
    });
  };

  const handleDeselect = (e) => {
    if (e.target.parent == null) changeSelection([]);
  };

  const updateElement = (id: string, newAttrs: Partial<BoardElement>) => {
    projectsStore.updateElement(id, newAttrs);
  };

  const addElement = (newElement: BoardElement) => {
    projectsStore.addElement(newElement);
  };

  return (
    <>
      <Stage
        width={window?.innerWidth}
        height={window?.innerHeight}
        ref={stageRef}
        onClick={handleDeselect}
        onDragMove={null}
        onDragEnd={null}
      >
        <GridLayer stageRef={stageRef} scale={scale} gridSize={GRID_SIZE} />

        {projectsStore.activeBoard?.layers?.map((layer, index) => (
          <BoardLayer
            key={index}
            layer={layer}
            selectedElements={selectedElements}
            handleSelect={handleSelect}
            fitCoordinates={(pos, element) =>
              fitCoordinates(pos.x, pos.y, element.width, element.height, scale)
            }
            updateElement={updateElement}
          />
        ))}

        {selectedElements.length > 0 && (
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
        <ToolBar
          stageRef={stageRef}
          element={selectedElements.length === 1 && selectedElements[0]}
          addElement={addElement}
          updateElement={updateElement}
        />
      </div>
      <Button
        onPress={resetStage}
        isIconOnly
        color="secondary"
        variant="light"
        size="md"
        className="invisible absolute bottom-4 right-16 z-50 font-semibold sm:visible"
      >
        <BoxSelectIcon />
      </Button>
    </>
  );
});

export default BoardStage;
