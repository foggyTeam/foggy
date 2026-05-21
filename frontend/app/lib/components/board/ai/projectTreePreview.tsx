'use client';

import { AiFileNode } from '@/app/lib/components/board/ai/aiAssistantModal';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import { ProjectElementTypes } from '@/app/lib/types/definitions';
import { Avatar } from '@heroui/avatar';
import React from 'react';
import projectsStore from '@/app/stores/projectsStore';

export default function ProjectTreePreview({
  node,
  root,
}: {
  node: AiFileNode;
  root?: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-start justify-start py-0.5 pr-0 sm:py-1">
      {root ? (
        <div className="flex items-center justify-start gap-2 overflow-hidden">
          <Avatar
            size="md"
            color="primary"
            name={projectsStore.activeProject?.name?.toUpperCase()}
            src={projectsStore.activeProject?.avatar}
          />
          <h1 className="truncate font-medium text-nowrap">
            {projectsStore.activeProject?.name}
          </h1>
        </div>
      ) : (
        <div className="hover:bg-default-100 flex w-full items-center justify-start gap-0 rounded-xl p-0.5 pr-0 sm:p-1">
          <ElementIcon
            elementType={node.type.toUpperCase() as ProjectElementTypes}
          />
          <p className="h-6 truncate px-2 text-nowrap">{node.name}</p>
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div className={root ? 'mt-2' : 'pl-5'}>
          {node.children.map((child, idx) => (
            <ProjectTreePreview key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
