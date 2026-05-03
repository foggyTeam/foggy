'use client';

import { CloudUploadIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import React, { useState } from 'react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { foggy_accent } from '@/tailwind.config';
import boardStore from '@/app/stores/board/boardStore';
import { useTheme } from 'next-themes';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { observer } from 'mobx-react-lite';
import {
  HandleBoardImageUpload,
  UploadBoardData,
} from '@/app/lib/utils/handleBoardImageUpload';

const BoardImageGenerator = observer(
  ({ boardData }: { boardData: UploadBoardData }) => {
    const { resolvedTheme } = useTheme();
    const { commonSize } = useAdaptiveParams();
    const [isLoading, setIsLoading] = useState(false);

    async function handleUpload() {
      if (!boardStore.activeBoard?.id) return;

      setIsLoading(true);
      await HandleBoardImageUpload(
        boardStore.activeBoard.id,
        boardData,
        resolvedTheme as 'light' | 'dark',
      );
      setIsLoading(false);
    }

    return (
      <FTooltip
        placement="right"
        content={settingsStore.t.toolTips.uploadButton}
      >
        <Button
          data-testid="save-board-image-btn"
          onPress={handleUpload}
          isIconOnly
          isLoading={isLoading}
          color={foggy_accent.light.DEFAULT as any}
          size={commonSize}
          className="accent-sh absolute bottom-3 left-3 z-50 font-semibold sm:bottom-6 sm:left-6"
        >
          <CloudUploadIcon />
        </Button>
      </FTooltip>
    );
  },
);

export default BoardImageGenerator;
