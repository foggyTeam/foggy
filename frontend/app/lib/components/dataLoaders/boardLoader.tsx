'use client';

import { useEffect } from 'react';
import { BoardType } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

const BoardLoader = ({ boardData }: { boardData: BoardType }) => {
  useEffect(() => {
    if (boardData) {
      projectsStore.setActiveBoard(boardData);
    }
  }, [boardData]);

  return null;
};

export default BoardLoader;
