'use client';

import { CloudUploadIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import React, { useState } from 'react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { foggy_accent } from '@/tailwind.config';
import { useBoardContext } from '@/app/lib/components/board/boardContext';
import GetBoardImage from '@/app/lib/utils/getBoardImage';
import boardStore from '@/app/stores/boardStore';
import { useTheme } from 'next-themes';

export default function BoardImageGenerator() {
  const { resolvedTheme } = useTheme();
  const { commonSize } = useAdaptiveParams();
  const { stageRef } = useBoardContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!boardStore.activeBoard) return;

    setIsLoading(true);
    const blob = await GetBoardImage(
      stageRef,
      boardStore.activeBoard.layers,
      resolvedTheme === 'light' ? '#e4e4e7' : '#27272a',
    );
    setIsLoading(false);
  };

  return (
    <Button
      data-testid="save-board-image-btn"
      onPress={handleSave}
      isIconOnly
      isLoading={isLoading}
      color={foggy_accent.light.DEFAULT}
      size={commonSize}
      className="accent-sh absolute bottom-3 left-3 z-50 font-semibold sm:bottom-6 sm:left-6"
    >
      <CloudUploadIcon />
    </Button>
  );
}
