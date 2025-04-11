'use client';

import { useEffect } from 'react';
import { Board } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

const BoardLoader = ({ boardData }: { boardData: Board }) => {
  useEffect(() => {
    if (boardData) {
      projectsStore.setActiveBoard(boardData);
    }
  }, [boardData]);

  return null;
};

export default BoardLoader;
