'use client';

import { useEffect } from 'react';
import {
  Board,
  BoardTypes,
  GraphBoard,
  SimpleBoard,
} from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import boardStore from '@/app/stores/board/boardStore';
import simpleBoardStore from '@/app/stores/board/simpleBoardStore';
import graphBoardStore from '@/app/stores/board/graphBoardStore';

type Normalized<T extends Board> = Omit<T, 'type'> & {
  type: Lowercase<T['type']>;
  sectionIds: string[];
};
type BoardData = Normalized<SimpleBoard> | Normalized<GraphBoard>;

const BoardLoader = ({
  boardData,
  sectionData,
}: {
  boardData: BoardData | undefined;
  sectionData: any | undefined;
}) => {
  useEffect(() => {
    if (sectionData && boardData) {
      const sectionIds = [...boardData.sectionIds];
      const sectionId = sectionIds.pop() as string;
      projectsStore.insertProjectChild(sectionIds, sectionData, true);
      boardStore.setActiveBoard({ ...boardData, sectionId });
      projectsStore.addRecentBoard(
        projectsStore.activeProject?.id || '',
        sectionId,
        boardData.id,
        boardData.name,
        boardData.type.toUpperCase() as BoardTypes,
      );

      if (boardData.type === 'simple') {
        simpleBoardStore.setBoardLayers(boardData.layers);
      }

      if (boardData.type === 'graph') {
        graphBoardStore.setGraphData({
          nodes: boardData.graphNodes,
          edges: boardData.graphEdges,
        });
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
