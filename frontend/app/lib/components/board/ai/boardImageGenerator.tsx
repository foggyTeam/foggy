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
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { uploadPrivateImage } from '@/app/lib/server/actions/handleImage';
import { CopyToClipboard } from '@/app/lib/utils/copyToClipboard';

export default function BoardImageGenerator() {
  const { resolvedTheme } = useTheme();
  const { commonSize } = useAdaptiveParams();
  const { stageRef } = useBoardContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!boardStore.activeBoard) return;

    setIsLoading(true);
    let blob = null;
    try {
      blob = await GetBoardImage(
        stageRef,
        boardStore.activeBoard.layers,
        resolvedTheme === 'light' ? '#e4e4e7' : '#27272a',
      );
      if (!blob) throw new Error();
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.board.generateBoardImageError,
        description: e.message || '',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await uploadPrivateImage(
        boardStore.activeBoard.id,
        'board_images',
        blob,
      );
      if ('error' in result) throw new Error(result.error);

      addToast({
        color: 'success',
        severity: 'success',
        title: settingsStore.t.toasts.board.uploadBoardImageSuccess,
      });
      await CopyToClipboard(result.url);
    } catch (e: any) {
      addToast({
        color: 'danger',
        severity: 'danger',
        title: settingsStore.t.toasts.board.uploadBoardImageError,
        description: e.message || '',
      });
    }
    setIsLoading(false);
  };

  return (
    <Button
      data-testid="save-board-image-btn"
      onPress={handleUpload}
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
