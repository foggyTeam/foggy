'use client';

import { CloudUploadIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import React, { RefObject, useState } from 'react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { foggy_accent } from '@/tailwind.config';
import GetBoardImage from '@/app/lib/utils/getBoardImage';
import boardStore from '@/app/stores/board/boardStore';
import { useTheme } from 'next-themes';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { uploadImage } from '@/app/lib/server/actions/handleImage';
import { CopyToClipboard } from '@/app/lib/utils/copyToClipboard';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { observer } from 'mobx-react-lite';
import simpleBoardStore from '@/app/stores/board/simpleBoardStore';
import { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import GetGraphBoardImage from '@/app/lib/utils/getGraphBoardImage';
import { GNode } from '@/app/lib/types/definitions';

interface SimpleBoardData {
  type: 'SIMPLE';
  data: RefObject<any | null>;
}

interface GraphBoardData {
  type: 'GRAPH';
  data: Pick<ReactFlowInstance<Node, Edge>, 'getNodes' | 'getNodesBounds'>;
}

type BoardData = SimpleBoardData | GraphBoardData;

const BoardImageGenerator = observer(
  ({ boardData }: { boardData: BoardData }) => {
    const { resolvedTheme } = useTheme();
    const { commonSize } = useAdaptiveParams();
    const [isLoading, setIsLoading] = useState(false);

    const handleSimpleUpload = async (): Promise<Blob | null> => {
      if (
        boardData.type !== 'SIMPLE' ||
        !boardStore.activeBoard ||
        !simpleBoardStore.boardLayers
      )
        return null;

      const blob = await GetBoardImage(
        boardData.data,
        simpleBoardStore.boardLayers,
        resolvedTheme === 'light' ? '#e4e4e7' : '#27272a',
      );
      if (!blob) return null;

      return blob;
    };
    const handleGraphUpload = async (): Promise<Blob | null> => {
      if (boardData.type !== 'GRAPH') return null;

      const blob = await GetGraphBoardImage(
        boardData.data.getNodes() as GNode[],
        boardData.data.getNodesBounds(boardData.data.getNodes()),
        resolvedTheme === 'light' ? '#e4e4e7' : '#27272a',
      );
      if (!blob) return null;
      return blob;
    };

    async function handleUpload() {
      setIsLoading(true);

      let blob: Blob | null = null;
      try {
        switch (boardData.type) {
          case 'SIMPLE':
            blob = await handleSimpleUpload();
            break;
          case 'GRAPH':
            blob = await handleGraphUpload();
            break;
        }
      } catch (e: any) {}

      if (!blob) {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.board.generateBoardImageError,
        });
        setIsLoading(false);
        return;
      }

      try {
        const result = await uploadImage(
          'board_images',
          blob,
          'board_temp_image_',
          { type: 'hash', base: boardStore.activeBoard?.id },
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
