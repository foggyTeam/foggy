'use client';

import NotFoundIllustration from '@/app/lib/components/svg/illustrations/404';
import ServerDownIllustration from '@/app/lib/components/svg/illustrations/500';
import CreativeIllustration from '@/app/lib/components/svg/illustrations/creative';
import EmptyIllustration from '@/app/lib/components/svg/illustrations/empty';
import BuildingIllustration from '@/app/lib/components/svg/illustrations/building';
import QuestionsIllustration from '@/app/lib/components/svg/illustrations/question';
import MultiDeviceIllustration from '@/app/lib/components/svg/illustrations/files';
import TrueLoveIllustration from '@/app/lib/components/svg/illustrations/love';
import SearchDocumentsIllustration from '@/app/lib/components/svg/illustrations/search';
import ChartIllustration from '@/app/lib/components/svg/illustrations/statistics';
import MessagingIllustration from '@/app/lib/components/svg/illustrations/study';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import clsx from 'clsx';

const illustrationsMap = {
  404: NotFoundIllustration,
  500: ServerDownIllustration,
  building: BuildingIllustration,
  creative: CreativeIllustration,
  empty: EmptyIllustration,
  files: MultiDeviceIllustration,
  love: TrueLoveIllustration,
  search: SearchDocumentsIllustration,
  question: QuestionsIllustration,
  statistics: ChartIllustration,
  study: MessagingIllustration,
};

export interface EmptyStateProps {
  title: string;
  text?: string;
  illustrationType?: keyof typeof illustrationsMap;
  leftButton?: { title: string; callback: () => void };
  rightButton?: { title: string; callback: () => void };
  size?: 'default' | 'sm' | 'lg' | 'full';
  className?: string;
}

export default function EmptyState({
  title,
  text,
  illustrationType = 'love',
  leftButton,
  rightButton,
  size = 'default',
  className,
}: EmptyStateProps) {
  const Illustration = illustrationsMap[illustrationType];
  const maxHeight = (size: 'default' | 'sm' | 'lg' | 'full') => {
    switch (size) {
      case 'default':
        return 'max-h-40 max-w-sm';
      case 'sm':
        return 'max-h-24 max-w-sm';
      case 'lg':
        return 'max-h-96 max-w-lg';
      case 'full':
        return '';
    }
  };
  return (
    <div
      className={clsx(
        'flex h-full min-h-fit w-full flex-col items-center justify-center gap-2 px-2 py-4',
        size === 'full' && 'gap-4',
        className,
      )}
    >
      {illustrationType && (
        <Illustration
          className={clsx('h-fit w-full object-fill px-8', maxHeight(size))}
        />
      )}
      <div className="flex w-full flex-col items-center justify-center gap-1">
        <p className="text-small text-primary-900 line-clamp-1 w-full text-center font-medium">
          {title.toUpperCase()}
        </p>
        {text && (
          <p className="text-default-500 text-small w-full text-center">
            {text}
          </p>
        )}
      </div>
      {(leftButton || rightButton) && (
        <div className="flex w-full items-center justify-center gap-16">
          {!!leftButton && (
            <FButton
              size="md"
              variant="light"
              color="primary"
              onClick={leftButton.callback}
            >
              {leftButton.title}
            </FButton>
          )}
          {!!rightButton && (
            <FButton size="md" color="primary" onClick={rightButton.callback}>
              {rightButton.title}
            </FButton>
          )}
        </div>
      )}
    </div>
  );
}
