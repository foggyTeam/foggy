import { RefObject } from 'react';
import { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import { uploadImage } from '@/app/lib/server/actions/handleImage';
import boardStore from '@/app/stores/board/boardStore';
import { CopyToClipboard } from '@/app/lib/utils/copyToClipboard';
import simpleBoardStore from '@/app/stores/board/simpleBoardStore';
import GetBoardImage from '@/app/lib/utils/getBoardImage';
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

interface DocBoardData {
  type: 'DOC';
  data: any | null;
}

export type UploadBoardData = SimpleBoardData | GraphBoardData | DocBoardData;

const handleSimpleUpload = async (
  boardData: UploadBoardData,
  theme: 'dark' | 'light' = 'light',
): Promise<Blob | null> => {
  if (
    boardData.type !== 'SIMPLE' ||
    !boardStore.activeBoard ||
    !simpleBoardStore.boardLayers
  )
    return null;

  const blob = await GetBoardImage(
    boardData.data,
    simpleBoardStore.boardLayers,
    theme === 'light' ? '#e4e4e7' : '#27272a',
  );
  if (!blob) return null;

  return blob;
};
const handleGraphUpload = async (
  boardData: UploadBoardData,
  theme: 'dark' | 'light' = 'light',
): Promise<Blob | null> => {
  if (boardData.type !== 'GRAPH') return null;

  const blob = await GetGraphBoardImage(
    boardData.data.getNodes() as GNode[],
    boardData.data.getNodesBounds(boardData.data.getNodes()),
    theme === 'light' ? '#e4e4e7' : '#27272a',
  );
  if (!blob) return null;
  return blob;
};

export async function HandleBoardImageUpload(
  boardId: string,
  boardData: UploadBoardData,
  theme: 'dark' | 'light' = 'light',
  copyLink = true,
) {
  let blob: Blob | null = null;
  try {
    switch (boardData.type) {
      case 'SIMPLE':
        blob = await handleSimpleUpload(boardData, theme);
        break;
      case 'GRAPH':
        blob = await handleGraphUpload(boardData, theme);
        break;
      case 'DOC':
        return '';
    }
  } catch (e: any) {}

  if (!blob) {
    addToast({
      color: 'danger',
      severity: 'danger',
      title: settingsStore.t.toasts.board.generateBoardImageError,
    });
    return null;
  }

  try {
    const result = await uploadImage(
      'board_images',
      blob,
      'board_temp_image_',
      { type: 'hash', base: boardId },
    );

    if ('error' in result) throw new Error(result.error);

    addToast({
      color: 'success',
      severity: 'success',
      title: settingsStore.t.toasts.board.uploadBoardImageSuccess,
    });
    if (copyLink) await CopyToClipboard(result.url);
    return result.url;
  } catch (e: any) {
    addToast({
      color: 'danger',
      severity: 'danger',
      title: settingsStore.t.toasts.board.uploadBoardImageError,
      description: e.message || '',
    });
  }
  return null;
}
