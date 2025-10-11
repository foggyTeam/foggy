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
  action?: { title: string; callback: () => void };
  size?: 'default' | 'sm' | 'lg';
}

export default function EmptyState({
  title,
  text,
  illustrationType,
  action,
  size = 'default',
}: EmptyStateProps) {
  const Illustration = illustrationsMap[illustrationType];
  const maxHeight = (size) => {
    switch (size) {
      case 'default':
        return 'max-h-40';
      case 'sm':
        return 'max-h-24';
      case 'lg':
        return 'max-h-96';
    }
  };
  return (
    <div className="flex h-full min-h-fit w-full flex-col items-center justify-center gap-2 px-2 py-4">
      {illustrationType && (
        <Illustration
          className={clsx(
            'h-full w-full max-w-sm object-fill px-8',
            maxHeight(size),
          )}
        />
      )}
      <div className="flex w-full flex-col items-center justify-center gap-1">
        <p className="text-small text-default-700 line-clamp-1 w-full text-center font-medium">
          {title}
        </p>
        {text && <p className="text-default-500 w-full text-center">{text}</p>}
      </div>
      {action && (
        <FButton color="primary" onClick={action.callback}>
          {action.title}
        </FButton>
      )}
    </div>
  );
}
