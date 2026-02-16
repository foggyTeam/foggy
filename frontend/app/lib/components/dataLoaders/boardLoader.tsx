'use client';

import { useEffect } from 'react';
import { Board } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import boardStore from '@/app/stores/boardStore';

const BoardLoader = ({
  boardData,
  sectionData,
}: {
  boardData: (Board & { sectionIds: string[] }) | undefined;
  sectionData: any | undefined;
}) => {
  useEffect(() => {
    if (sectionData && boardData) {
      const sectionId = boardData.sectionIds.pop();
      projectsStore.insertProjectChild(boardData.sectionIds, sectionData, true);
      boardStore.setActiveBoard({ ...boardData, sectionId });
    }
    return () => boardStore.setActiveBoard(undefined);
  }, [sectionData, boardData]);

  return null;
};

export default BoardLoader;
