'use client';

import { useEffect } from 'react';
import { Board } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

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
      projectsStore.setActiveBoard({ ...boardData, sectionId });
    }
    return () => projectsStore.setActiveBoard(undefined);
  }, [sectionData, boardData]);

  return null;
};

export default BoardLoader;
