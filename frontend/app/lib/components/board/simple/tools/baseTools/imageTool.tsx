import { ImageIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import React, { useCallback, useRef, useState } from 'react';
import {
  handleMouseDown,
  handleMouseMove,
  handlePlaceImageUpload,
} from '@/app/lib/components/board/simple/tools/drawingHandlers';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { useBoardContext } from '@/app/lib/components/board/simple/boardContext';
import useTool from '@/app/lib/hooks/simpleBoard/useTool';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function ImageTool() {
  const { commonSize } = useAdaptiveParams();
  const {
    stageRef,
    activeTool,
    setActiveTool,
    addElement,
    updateElement,
    toolsDisabled,
    allToolsDisabled,
  } = useBoardContext();

  const imageInputRef = useRef<any>(null);
  const aspectRatioRef = useRef<number | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newElement, setNewElement] = useState(null);
  const inputClickEventRef = useRef<any | null>(null);

  const inputClickAction = () => {
    imageInputRef.current?.click();
  };

  const mouseDownHandler = useCallback(
    handleMouseDown({
      stageRef,
      activeTool,
      addElement,
      setDrawing,
      setNewElement,
      aspectRatioRef,
    } as any),
    [activeTool],
  );
  const mouseMoveHandler = useCallback(
    handleMouseMove({
      stageRef,
      drawing,
      newElement,
      updateElement,
      aspectRatioRef,
    } as any),
    [drawing, newElement],
  );
  const mouseUpHandler = useCallback(
    handlePlaceImageUpload({
      newElement,
      drawing,
      inputClickEventRef,
      updateElement,
      setDrawing,
      setNewElement,
      setActiveTool,
      setIsLoading,
    } as any),
    [newElement, drawing],
  );

  function checkImageInput(e: any) {
    const image = e.target.files[0];
    if (!image) {
      setDrawing(false);
      setActiveTool('');
      aspectRatioRef.current = null;
    } else {
      inputClickEventRef.current = e;
      const url = URL.createObjectURL(image);
      const img = new Image();
      img.onload = () => {
        aspectRatioRef.current = img.width / img.height;
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }

  useTool({
    toolName: 'image',
    handlers: {
      mouseDownHandler,
      mouseMoveHandler,
      mouseUpHandler,
    },
  });

  return (
    <FTooltip content={settingsStore.t.toolTips.tools.imageTool}>
      <Button
        isLoading={isLoading}
        data-testid="image-tool-btn"
        isDisabled={toolsDisabled || allToolsDisabled}
        onPress={() => {
          if (activeTool === 'image') setActiveTool('');
          else {
            setActiveTool('image');
            inputClickAction();
          }
        }}
        variant={activeTool === 'image' ? 'flat' : 'light'}
        color={activeTool === 'image' ? 'primary' : 'default'}
        isIconOnly
        size={commonSize}
      >
        <ImageIcon
          className={
            activeTool === 'image' ? 'stroke-primary-500' : 'stroke-default-600'
          }
        />
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={checkImageInput}
          style={{ display: 'none' }}
        />
      </Button>
    </FTooltip>
  );
}
