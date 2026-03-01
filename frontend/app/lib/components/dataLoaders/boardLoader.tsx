'use client';

import { useEffect } from 'react';
import { Board, BoardTypes } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import boardStore from '@/app/stores/board/boardStore';
import simpleBoardStore from '@/app/stores/board/simpleBoardStore';

const BoardLoader = ({
  boardData,
  sectionData,
}: {
  boardData: (Board & { sectionIds: string[] }) | undefined;
  sectionData: any | undefined;
}) => {
  useEffect(() => {
    if (sectionData && boardData) {
      const sectionIds = [...boardData.sectionIds];
      const sectionId = sectionIds.pop();
      projectsStore.insertProjectChild(sectionIds, sectionData, true);
      boardStore.setActiveBoard({ ...boardData, sectionId });
      projectsStore.addRecentBoard(
        projectsStore.activeProject?.id || '',
        sectionId,
        boardData.id,
        boardData.name,
        boardData.type.toUpperCase() as BoardTypes,
      );
      switch (boardData.type.toUpperCase()) {
        case 'SIMPLE':
          simpleBoardStore.setBoardLayers(boardData.layers);
          break;
      }
    }
    return () => {
      boardStore.setActiveBoard(undefined);
      simpleBoardStore.setBoardLayers(undefined);
    };
  }, [sectionData, boardData]);

  return null;
};

export default BoardLoader;
