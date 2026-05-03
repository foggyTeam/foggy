'use client';

import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { Button } from '@heroui/button';
import { foggy_accent } from '@/tailwind.config';
import { SparklesIcon } from 'lucide-react';
import React from 'react';
import { useDisclosure } from '@heroui/modal';
import AiAssistantModal from '@/app/lib/components/board/ai/aiAssistantModal';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { UploadBoardData } from '@/app/lib/utils/handleBoardImageUpload';

export default function AiAssistantButton({
  boardData,
}: {
  boardData: UploadBoardData;
}) {
  const { commonSize } = useAdaptiveParams();
  const { isOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <FTooltip placement="right" content={settingsStore.t.toolTips.aiButton}>
        <Button
          data-testid="ai-btn"
          onPress={onOpenChange}
          isIconOnly
          color={foggy_accent.light.DEFAULT as any}
          size={commonSize}
          className="accent-sh absolute bottom-3 left-6 z-50 font-semibold sm:bottom-6 sm:left-[68px]"
        >
          <SparklesIcon />
        </Button>
      </FTooltip>
      <AiAssistantModal
        boardData={boardData}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
