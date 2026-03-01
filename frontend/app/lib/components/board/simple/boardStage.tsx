'use client';

import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva';
import { Button } from '@heroui/button';
import { MaximizeIcon } from 'lucide-react';
import BoardLayer from '@/app/lib/components/board/simple/boardLayer';
import ToolBar from '@/app/lib/components/board/simple/menu/toolBar';
import { observer } from 'mobx-react-lite';
import { primary } from '@/tailwind.config';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { createPortal } from 'react-dom';
import TextEditor from '@/app/lib/components/board/simple/tools/textEditor/textEditor';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import { useTheme } from 'next-themes';
import GridBackground from '@/app/lib/components/board/simple/backgroundGrid';
import useStageContainerSize from '@/app/lib/hooks/simpleBoard/useStageSize';
import UseMouseEvent from '@/app/lib/hooks/simpleBoard/useMouseEvent';
import UseWheelEvent from '@/app/lib/hooks/simpleBoard/useWheelEvent';
import UseTouchEvent from '@/app/lib/hooks/simpleBoard/useTouchEvent';
import UseRAFNavigation from '@/app/lib/hooks/simpleBoard/useRAFNavigation';
import simpleBoardStore from '@/app/stores/board/simpleBoardStore';

const GRID_SIZE = 24;

const BoardStage = observer(() => {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme as 'light' | 'dark') ?? 'light';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { width: viewportWidth, height: viewportHeight } =
    useStageContainerSize(containerRef);
  const isStageValid = viewportWidth > 0 && viewportHeight > 0;

  const {
    stageRef,
    setScale,
    selectedElements,
    activeTool,
    isEditingText,
    setIsEditingText,
    textContent,
    setTextContent,
    handleSelect,
    resetStage,
    updateGridRef,
    updateCursorsRef,
  } = useBoardContext();
  const selectionRef: any = useRef(null);

  const { dragBy, zoomTo } = UseRAFNavigation(stageRef, setScale, () => {
    updateGridRef.current?.();
    updateCursorsRef.current?.();
  });

  UseTouchEvent(stageRef, isStageValid, dragBy, zoomTo);
  UseMouseEvent(stageRef, isStageValid, dragBy);
  UseWheelEvent(stageRef, isStageValid, dragBy, zoomTo);

  const stageSize = useMemo(
    () => ({
      width: viewportWidth,
      height: viewportHeight,
    }),
    [viewportWidth, viewportHeight],
  );

  useEffect(() => {
    if (!isStageValid) return;
    requestAnimationFrame(() => updateGridRef.current?.());
  }, [isStageValid, viewportWidth, viewportHeight]);

  return (
    <div
      ref={containerRef}
      data-testid="simple-board-stage"
      className="relative h-full w-full overflow-hidden"
    >
      <GridBackground gridSize={GRID_SIZE} />
      {isStageValid && (
        <Stage
          style={{ touchAction: 'none' }}
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          onClick={handleSelect}
        >
          {simpleBoardStore.boardLayers?.map((layer, index) => (
            <BoardLayer key={index} layer={layer} />
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
                  borderStroke={primary[theme]['400']}
                  anchorStroke={primary[theme]['400']}
                  anchorCornerRadius={16}
                  rotateAnchorCursor="grab"
                />
              </Group>
            </Layer>
          )}
        </Stage>
      )}

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
              setHeight={(newHeight: number) => {
                if (isEditingText)
                  setIsEditingText({
                    ...isEditingText,
                    textHeight: newHeight,
                  });
              }}
              width={isEditingText.textWidth}
            />
          ) as ReactNode,
          document.body,
        )}

      <FTooltip content={settingsStore.t.toolTips.resetStage}>
        <Button
          data-testid="reset-stage-btn"
          onPress={resetStage}
          isIconOnly
          color="secondary"
          variant="light"
          size="md"
          className="invisible absolute right-24 bottom-4 z-50 font-semibold sm:visible"
        >
          <MaximizeIcon />
        </Button>
      </FTooltip>
    </div>
  );
});

export default BoardStage;
