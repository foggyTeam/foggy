'use client';

import NodeWrapper from '@/app/lib/components/board/graph/nodes/nodeWrapper';
import React, { useCallback } from 'react';
import { GInternalLinkNode, GNodeLinkNode } from '@/app/lib/types/definitions';
import { observer } from 'mobx-react-lite';
import graphBoardStore from '@/app/stores/board/graphBoardStore';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { GlobeIcon } from 'lucide-react';
import useGraphNode from '@/app/lib/hooks/graphBoard/useGraphNode';
import { internalLinkNodeSchema } from '@/app/lib/types/schemas';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import SelectProjectElement from '@/app/lib/components/board/graph/nodes/selectProjectElement';

const InternalLinkNode = observer((node: GNodeLinkNode) => {
  const data: GInternalLinkNode['data'] = graphBoardStore.nodesDataMap?.get(
    node.id,
  );

  const { smallerSize } = useAdaptiveParams();

  const { nodeState, dispatch, isEditing, onBlur, toggleEdit, onCopyLink } =
    useGraphNode<GNodeLinkNode['data']>(
      node.id,
      node.selected,
      data,
      !!data?.element,
      internalLinkNodeSchema,
    );

  const setElement = useCallback((v) => dispatch({ element: v }), [dispatch]);

  const openLink = async (e: MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (data?.element?.path && !isEditing) {
        const url = ``;
        window.open(url, '_blank');
      }
    }
  };

  return (
    <NodeWrapper
      isSelected={node.selected}
      onPress={openLink}
      onBlur={onBlur}
      toolbarProps={{
        onToggleEdit: toggleEdit,
        onCopyNodeLink: onCopyLink,
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
          onBlur={onBlur}
        >
          <SelectProjectElement
            value={data?.element}
            onValueChange={setElement}
          />
        </div>
      )}
    </NodeWrapper>
  );
});

export default InternalLinkNode;
