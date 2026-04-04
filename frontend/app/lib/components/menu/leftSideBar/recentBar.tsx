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
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import boardStore from '@/app/stores/board/boardStore';

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
            'absolute top-1/3 left-0 z-50 flex w-fit flex-col items-center' +
              ' justify-center gap-1 rounded-l-none rounded-r-[64px] px-3 py-6',
            bg_container,
            'transform transition-all hover:bg-[hsl(var(--heroui-background))]/65 hover:pl-4',
          )}
        >
          {projectsStore.recentBoards.map((board) => (
            <FTooltip key={board.url} content={board.name} placement="right">
              <Button
                as={Link}
                href={board.url}
                onClick={() => settingsStore.startLoading()}
                isIconOnly
                variant={
                  board.url.endsWith(
                    `${boardStore.activeBoard?.id}/${boardStore.activeBoard?.type.toLowerCase()}` ||
                      '',
                  )
                    ? 'flat'
                    : 'light'
                }
                color="primary"
                size="md"
              >
                <ElementIcon elementType={board.type} />
              </Button>
            </FTooltip>
          ))}

          <Button onPress={onAddOpen} isIconOnly variant="light" size="md">
            <PlusIcon className="stroke-default-600" />
          </Button>
        </div>
      </>
    );
  },
);

export default RecentBar;
