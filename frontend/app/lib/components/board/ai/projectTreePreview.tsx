'use client';

import { AiFileNode } from '@/app/lib/components/board/ai/aiAssistantModal';
import { FileIcon, FolderIcon } from 'lucide-react';

export default function ProjectTreePreview({ node }: { node: AiFileNode }) {
  return (
    <div className="mt-1 flex flex-col gap-1 pl-4 text-sm">
      <div className="text-foreground flex items-center gap-2">
        {node.type === 'section' ? (
          <FolderIcon
            size={16}
            className="text-secondary-400 fill-secondary-400/20"
          />
        ) : (
          <FileIcon size={16} className="text-default-400" />
        )}
        <span className="font-medium">{node.name}</span>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="border-default-200 ml-2 border-l">
          {node.children.map((child, idx) => (
            <ProjectTreePreview key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
