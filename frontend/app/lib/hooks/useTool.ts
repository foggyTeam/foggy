import { useEffect } from 'react';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

interface ToolEffectParams {
  toolName: string;
  isTextEditing?: boolean;
  handlers: {
    mouseDownHandler?: (params: any) => void;
    mouseMoveHandler?: (params: any) => void;
    mouseUpHandler?: (params: any) => void;
  };
}

export default function useTool({
  toolName,
  handlers,
  isTextEditing,
}: ToolEffectParams) {
  const { stageRef, activeTool } = useBoardContext();

  useEffect(() => {
    if ((activeTool === toolName || isTextEditing) && stageRef.current) {
      const stage = stageRef.current?.getStage();

      if (handlers.mouseDownHandler) {
        stage.on('mousedown', handlers.mouseDownHandler);
        stage.on('touchstart', handlers.mouseDownHandler);
      }
      if (handlers.mouseMoveHandler) {
        stage.on('mousemove', handlers.mouseMoveHandler);
        stage.on('touchmove', handlers.mouseMoveHandler);
      }
      if (handlers.mouseUpHandler) {
        stage.on('mouseup', handlers.mouseUpHandler);
        stage.on('touchend', handlers.mouseUpHandler);
      }
    }

    return () => {
      if (stageRef.current) {
        const stage = stageRef.current.getStage();

        if (handlers.mouseDownHandler) {
          stage.off('mousedown', handlers.mouseDownHandler);
          stage.off('touchstart', handlers.mouseDownHandler);
        }
        if (handlers.mouseMoveHandler) {
          stage.off('mousemove', handlers.mouseMoveHandler);
          stage.off('touchmove', handlers.mouseMoveHandler);
        }
        if (handlers.mouseUpHandler) {
          stage.off('mouseup', handlers.mouseUpHandler);
          stage.off('touchend', handlers.mouseUpHandler);
        }
      }
    };
  }, [activeTool, stageRef, toolName, handlers, isTextEditing]);
}
