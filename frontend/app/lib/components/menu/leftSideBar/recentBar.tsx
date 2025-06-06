'use client';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import { observer } from 'mobx-react-lite';
import { Button } from '@heroui/button';
import { PlusIcon } from 'lucide-react';
import projectsStore from '@/app/stores/projectsStore';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import React from 'react';
import Link from 'next/link';

const RecentBar = observer(
  ({
    openSideBar,
    onAddOpen,
  }: {
    openSideBar: () => void;
    onAddOpen: () => void;
  }) => {
    return (
      <>
        <div
          onClick={openSideBar}
          className={clsx(
            'absolute left-0 top-1/3 z-50 flex w-fit flex-col items-center' +
              ' justify-center gap-1 rounded-l-none rounded-r-[64px] px-3 py-6',
            bg_container,
            'transform transition-all hover:bg-opacity-65 hover:pl-4',
          )}
        >
          {projectsStore.activeBoard && (
            <Button
              as={Link}
              href={`/project/${projectsStore.activeProject?.id}/${projectsStore.activeBoard.sectionId}/${projectsStore.activeBoard.id}`}
              key={projectsStore.activeBoard?.id}
              isIconOnly
              variant="light"
              size="md"
            >
              <ElementIcon
                elementType={projectsStore.activeBoard?.type || 'SIMPLE'}
              />
            </Button>
          )}

          <Button onPress={onAddOpen} isIconOnly variant="light" size="md">
            <PlusIcon className="stroke-default-500" />
          </Button>
        </div>
      </>
    );
  },
);

export default RecentBar;
