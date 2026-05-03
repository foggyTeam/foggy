'use client';

import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from '@heroui/drawer';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { FolderSyncIcon, LightbulbIcon, SparklesIcon } from 'lucide-react';
import clsx from 'clsx';
import { ai_sidebar_layout, bg_container } from '@/app/lib/types/styles';
import settingsStore from '@/app/stores/settingsStore';
import { Card, CardBody } from '@heroui/card';
import { AnimatePresence, motion } from 'framer-motion';
import GenerationSkeleton from '@/app/lib/components/skeletons/generationSkeleton';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import { Image } from '@heroui/image';
import NextImage from 'next/image';
import {
  HandleBoardImageUpload,
  UploadBoardData,
} from '@/app/lib/utils/handleBoardImageUpload';
import boardStore from '@/app/stores/board/boardStore';
import { useTheme } from 'next-themes';
import aiStore from '@/app/stores/board/aiStore';
import projectsStore from '@/app/stores/projectsStore';
import ProjectTreePreview from '@/app/lib/components/board/ai/projectTreePreview';

export interface AiSummaryTextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
}

export interface AiSummarizeResponse {
  requestId: string;
  userId: string;
  requestType: 'summarize';
  text: AiSummaryTextElement;
}

export interface AiFileNode {
  name: string;
  type: 'section' | 'simple' | 'graph' | 'doc';
  children?: AiFileNode[];
}

export interface AiStructurizeResponse {
  requestId: string;
  userId: string;
  requestType: 'structurize';
  aiTreeResponse: string;
  file: AiFileNode;
}

const AiAssistantModal = observer(
  ({
    boardData,
    isOpen,
    onOpenChange,
  }: {
    boardData: UploadBoardData;
    isOpen: boolean;
    onOpenChange: any;
  }) => {
    const { isMobile, commonSize } = useAdaptiveParams();
    const { resolvedTheme } = useTheme();

    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [generationType, setGenerationType] = useState<
      null | keyof typeof generationTypeMap
    >(null);
    const [generationResult, setGenerationResult] = useState<
      null | AiSummarizeResponse | AiStructurizeResponse
    >(null);

    const generationTypeMap = {
      structurize: {
        title: settingsStore.t.ai.structurize.buttonTitle,
        description: settingsStore.t.ai.structurize.description,
        CardIcon: <FolderSyncIcon className="stroke-secondary-300" />,
        cardStyle:
          'bg-secondary hover:bg-secondary-400 text-secondary-foreground',
      },
      summarize: {
        title: settingsStore.t.ai.summarize.buttonTitle,
        description: settingsStore.t.ai.summarize.description,
        CardIcon: <LightbulbIcon className="stroke-primary-300 rotate-12" />,
        cardStyle: 'bg-primary hover:bg-primary-400 text-primary-foreground',
      },
    };

    async function onStartGeneration(type: 'structurize' | 'summarize') {
      if (!boardStore.activeBoard?.id) return;

      setGenerationType(type);
      setStep(1);

      const url = await HandleBoardImageUpload(
        boardStore.activeBoard.id,
        boardData,
        resolvedTheme as 'light' | 'dark',
        false,
      );
      if (url === null) {
        onAbort(true);
        return;
      }

      switch (type) {
        case 'summarize':
          await aiStore.generateSummary(
            boardStore.activeBoard.id,
            url,
            onSummaryGenerated,
            onGenerationFail,
          );
          break;
        case 'structurize':
          if (!projectsStore.activeProject?.id) return;
          await aiStore.generateStructure(
            boardStore.activeBoard.id,
            url,
            projectsStore.activeProject.id,
            onStructureGenerated,
            onGenerationFail,
          );
          break;
      }
    }

    function onSummaryGenerated(
      result: { SummarizeResponse: AiSummarizeResponse } | null | undefined,
    ) {
      if (!result) {
        onAbort(true);
        return;
      }
      setStep(2);
      setGenerationResult(result.SummarizeResponse);
    }
    function onStructureGenerated(
      result: AiStructurizeResponse | null | undefined,
    ) {
      if (!result) {
        onAbort(true);
        return;
      }
      setStep(2);
      setGenerationResult(result);
    }

    function onAbort(local: boolean = false) {
      setStep(0);
      setGenerationType(null);
      setGenerationResult(null);
      // TODO: try to abort job (how?)
    }

    function onGenerationFail() {
      setStep(0);
      setGenerationType(null);
      setGenerationResult(null);
    }

    function onSubmit() {
      console.log('Generation result submitted!');
      setStep(0);
      setGenerationType(null);
      setGenerationResult(null);
    }

    return (
      <Drawer
        data-testid="ai-modal"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement={isMobile ? 'bottom' : 'left'}
        backdrop="transparent"
        className={clsx(
          bg_container,
          ai_sidebar_layout,
          'h-fit w-full overflow-visible sm:max-w-sm',
          'transform transition-all hover:bg-[hsl(var(--heroui-background))]/65 hover:pl-0.5',
        )}
      >
        <DrawerContent className="gap-4">
          <DrawerHeader className="text-medium flex items-center justify-start gap-2 py-0 sm:text-sm">
            <SparklesIcon className="stroke-f_accent font-semibold" />
            <h1 className="font-medium">{settingsStore.t.ai.title}</h1>
          </DrawerHeader>
          <DrawerBody className="text-medium flex flex-col gap-2 overflow-visible py-0 sm:text-sm">
            <div className="text-default-700 flex items-center gap-1 italic">
              <Image
                alt="Gemini icon"
                src="/images/gemini-color.svg"
                height={24}
                width={24}
                as={NextImage}
              />
              {settingsStore.t.ai.stepTitle[step.toString()]}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-72 flex-col gap-2 overflow-y-auto sm:h-[360px]"
                >
                  {Object.entries(generationTypeMap).map(
                    ([type, { title, description, cardStyle, CardIcon }]) => (
                      <Card
                        key={type}
                        className={clsx(cardStyle, 'w-full')}
                        shadow="none"
                        isPressable
                        onPress={() =>
                          onStartGeneration(
                            type as keyof typeof generationTypeMap,
                          )
                        }
                      >
                        <CardBody className="flex flex-col gap-1">
                          <p className="flex w-full items-end justify-between gap-1 font-semibold">
                            {title}
                            {CardIcon}
                          </p>
                          <p className="italic">{description}</p>
                        </CardBody>
                      </Card>
                    ),
                  )}
                </motion.div>
              )}

              {step === 1 && generationType !== null && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-72 flex-col gap-4 overflow-y-auto sm:h-[360px]"
                >
                  <GenerationSkeleton type={generationType} />
                  <FButton
                    size={commonSize}
                    onPress={onAbort}
                    variant="ghost"
                    color="danger"
                  >
                    {settingsStore.t.ai.abortButton}
                  </FButton>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-72 flex-col gap-4 overflow-y-auto sm:h-[360px]"
                >
                  {generationType === 'summarize' &&
                    'text' in generationResult && (
                      <Card shadow="none" className="h-full pr-1">
                        <CardBody>
                          <div
                            className="leading-relaxed [&>li]:mt-1 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5"
                            dangerouslySetInnerHTML={{
                              __html: generationResult.text.content,
                            }}
                          />
                        </CardBody>
                      </Card>
                    )}

                  {generationType === 'structurize' &&
                    'aiTreeResponse' in generationResult && (
                      <div className="flex flex-col gap-3 pr-1">
                        <p className="text-default-500 text-sm italic">
                          {generationResult.aiTreeResponse}
                        </p>
                        <div className="border-secondary/20 bg-secondary/5 overflow-x-auto rounded-xl border p-3">
                          <ProjectTreePreview node={generationResult.file} />
                        </div>
                      </div>
                    )}

                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <FButton
                      size={commonSize}
                      onPress={() => onAbort(true)}
                      variant="bordered"
                      color="danger"
                    >
                      {settingsStore.t.ai.discardButton}
                    </FButton>
                    <FButton
                      size={commonSize}
                      onPress={onSubmit}
                      color="primary"
                    >
                      {settingsStore.t.ai.submitButton}
                    </FButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  },
);

export default AiAssistantModal;
