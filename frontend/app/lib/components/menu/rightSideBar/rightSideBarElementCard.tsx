import { Project, Team } from '@/app/lib/types/definitions';
import { Avatar } from '@heroui/avatar';
import React, { ComponentType, SVGProps } from 'react';
import { Button } from '@heroui/button';
import Link from 'next/link';
import clsx from 'clsx';
import { ChevronLeftIcon } from 'lucide-react';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function RightSideBarElementCard({
  link = { href: '/', Icon: ChevronLeftIcon, text: '' },
  element,
  isActive,
  type,
}: {
  link?: {
    href: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    text: string;
  };
  element?: Project | Team;
  isActive?: boolean;
  type?: 'team' | 'project';
}) {
  const { smallerSize } = useAdaptiveParams();
  return (
    <Button
      as={Link}
      href={(element && type && `/${type}/${element.id}`) || link.href}
      className="shadow-container sm:text-small hover:bg-primary-100 text-medium flex h-10 w-full items-center justify-between gap-1 rounded-full bg-[hsl(var(--heroui-background))]/25 pr-1 pl-0 transition-colors duration-300 sm:h-fit"
    >
      <div className="flex items-center justify-start gap-1">
        {element ? (
          <Avatar
            size={smallerSize}
            color="primary"
            classNames={{
              base: 'border-default-50 border-1.5',
            }}
            className="p-0"
            name={element.name}
            src={element.avatar}
          />
        ) : (
          <link.Icon className="stroke-default-600 h-10 w-10 p-1 sm:h-8 sm:w-8" />
        )}
        <p className={clsx('font-medium', isActive && 'text-f_accent')}>
          {element ? element.name : link.text}
        </p>
      </div>
    </Button>
  );
}
