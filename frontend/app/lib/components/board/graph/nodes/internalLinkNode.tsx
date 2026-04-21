'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { MouseEvent, useCallback } from 'react';
import { GInternalLinkNode, GNodeLinkNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import settingsStore from '@/app/stores/settingsStore';
import { GlobeIcon } from 'lucide-react';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import ProjectElementSelect from '@/app/lib/components/board/graph/nodes/projectElementSelect/projectElementSelect';
import projectsStore from '@/app/stores/projectsStore';
import { PressEvent } from '@heroui/button';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';

type GInternalLinkNodeData = GInternalLinkNode['data'];

const InternalLinkNode = observer((node: GNodeLinkNode) => {
  const data = graphBoardStore.nodesDataMap?.get(
    node.id,
  ) as GInternalLinkNodeData;

  const { deleteNode } = useGraphBoardContext();
  const { nodeState, dispatch, isEditing, onBlur, toggleEdit, onCopyLink } =
    useGraphNode<GInternalLinkNodeData>(
      node.id,
      node.selected,
      data,
      !!data?.element?.path,
      null,
    );

  const setElement = useCallback(
    (v: GInternalLinkNodeData['element']) => dispatch({ element: v }),
    [dispatch],
  );

  const openLink = async (e: MouseEvent | PressEvent, dbl = false) => {
    if (e.ctrlKey || e.metaKey || dbl) {
      if (data?.element?.path && !isEditing) {
        let url = `${window.location.origin}/project/${projectsStore.activeProject?.id}`;
        const pathLength = data.element.path.length;
        if (data.element.type === 'SECTION')
          url += `?section_id=${data.element.path[pathLength - 1]}`;
        else
          url += `/${data.element.path[pathLength - 2]}/${data.element.path[pathLength - 1]}/${data.element.type.toLowerCase()}`;
        window.open(url, '_blank');
      }
    }
  };

  return (
    <NodeWrapper
      isSelected={node.selected}
      onPress={openLink}
      onDblClick={(e) => openLink(e, true)}
      onBlur={onBlur}
      toolbarProps={{
        onToggleEdit: toggleEdit,
        onCopyNodeLink: onCopyLink,
        onDelete: () => deleteNode(node.id),
      }}
    >
      {!isEditing && (
        <div className="flex h-7 w-full items-center justify-start gap-2">
          {data?.element?.type ? (
            <ElementIcon
              className="h-5 w-5 shrink-0"
              elementType={data.element.type}
            />
          ) : (
            <GlobeIcon className="text-f_accent-500 h-5 w-5 shrink-0" />
          )}

          <h1 className="line-clamp-1 w-fit truncate font-medium text-nowrap">
            {data?.element?.title || settingsStore.t.toolBar.emptyLink}
          </h1>
        </div>
      )}

      {isEditing && (
        <div
          className="nopan nodrag nowheel flex flex-col gap-1"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => e.stopPropagation()}
        >
          <ProjectElementSelect
            value={nodeState.element}
            onValueChange={setElement}
            onMenuClose={toggleEdit}
            isDraggable={!!node.draggable}
          />
        </div>
      )}
    </NodeWrapper>
  );
});

export default InternalLinkNode;
