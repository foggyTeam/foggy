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

      if (handlers.mouseDownHandler)
        stage.on('mousedown', handlers.mouseDownHandler);
      if (handlers.mouseMoveHandler)
        stage.on('mousemove', handlers.mouseMoveHandler);
      if (handlers.mouseUpHandler) stage.on('mouseup', handlers.mouseUpHandler);
    }

    return () => {
      if (stageRef.current) {
        const stage = stageRef.current.getStage();

        if (handlers.mouseDownHandler)
          stage.off('mousedown', handlers.mouseDownHandler);
        if (handlers.mouseMoveHandler)
          stage.off('mousemove', handlers.mouseMoveHandler);
        if (handlers.mouseUpHandler)
          stage.off('mouseup', handlers.mouseUpHandler);
      }
    };
  }, [activeTool, stageRef, toolName, handlers, isTextEditing]);
}
