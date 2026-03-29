'use client';
import projectsStore from '@/app/stores/projectsStore';
import { useMemo, useState } from 'react';
import cursorAdd from '@/app/lib/components/svg/cursorAdd';
import { GraphTool } from '@/app/lib/components/board/graph/graphBoardContext';

export default function useGraphTool() {
  const [isGraphLocked, lockGraph] = useState(false);
  const [activeTool, setActiveTool] = useState<GraphTool | undefined>();
  const allToolsDisabled = projectsStore.myRole === 'reader' || isGraphLocked;
  const toolCursor = useMemo(() => {
    switch (activeTool) {
      case undefined:
        return 'default';

      default:
        return `url(${cursorAdd}) 12 12, auto`;
    }
  }, [activeTool]);

  return {
    allToolsDisabled,
    activeTool,
    setActiveTool,
    isGraphLocked,
    lockGraph,
    toolCursor,
  };
}
