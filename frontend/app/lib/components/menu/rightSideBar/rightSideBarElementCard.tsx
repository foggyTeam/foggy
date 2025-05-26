import { Project, Team } from '@/app/lib/types/definitions';
import { Avatar } from '@heroui/avatar';
import React, { ComponentType } from 'react';
import { Button } from '@heroui/button';
import Link from 'next/link';
import clsx from 'clsx';

export default function RightSideBarElementCard({
  element,
  link,
  isActive,
}: {
  element?: Project | Team;
  link?: { href: string; Icon: ComponentType; text: string };
  isActive?: boolean;
}) {
  return (
    <Button
      as={Link}
      href={
        (element &&
          ('projects' in element
            ? `/team/${element.id}`
            : `/project/${element.id}`)) ||
        link.href
      }
      className="flex h-fit w-full items-center justify-between gap-1 rounded-full bg-white/25 pl-0 pr-1 transition-colors duration-300 shadow-container hover:bg-primary-100"
    >
      <div className="flex items-center justify-start gap-1">
        {element ? (
          <Avatar
            size="sm"
            color="primary"
            classNames={{
              base: 'border-default-50 border-1.5',
            }}
            className="p-0"
            name={element.name}
            src={element.avatar}
          />
        ) : (
          <link.Icon className="h-8 w-8 stroke-default-500 p-1" />
        )}
        <p className={clsx('font-medium', isActive && 'text-f_accent')}>
          {element ? element.name : link.text}
        </p>
      </div>
    </Button>
  );
}
