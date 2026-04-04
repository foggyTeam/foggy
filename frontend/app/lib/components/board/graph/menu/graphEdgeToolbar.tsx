'use client';

import React, { useEffect, useRef } from 'react';
import { GEdge } from '@/app/lib/types/definitions';
import StepTypeTool from '@/app/lib/components/board/graph/tools/edgeTools/stepTypeTool';
import LineStyleTool from '@/app/lib/components/board/graph/tools/edgeTools/lineStyleTool';
import EndsTool from '@/app/lib/components/board/graph/tools/edgeTools/endsTool';
import EdgeColorTool from '@/app/lib/components/board/graph/tools/edgeTools/edgeColorTool';
import LabelTool from '@/app/lib/components/board/graph/tools/edgeTools/labelTool';
import { useReactFlow } from '@xyflow/react';

type EdgeUpdate = Partial<
  Pick<GEdge, 'type' | 'label' | 'style' | 'markerStart' | 'markerEnd'>
>;

export default function GraphEdgeToolbar({
  edgeId,
  onEdgeUpdate,
}: {
  edgeId: string;
  onEdgeUpdate: (id: string, updatedEdge: GEdge) => void;
}) {
  const { getEdge } = useReactFlow();
  const edge = useRef(getEdge(edgeId));

  const tools = [
    StepTypeTool,
    LineStyleTool,
    EndsTool,
    EdgeColorTool,
    LabelTool,
  ];

  useEffect(() => {
    edge.current = getEdge(edgeId);
  }, [edgeId]);

  const applyChange = (newAttrs: EdgeUpdate) => {
    const updatedEdge = { ...getEdge(edgeId), ...newAttrs } as GEdge;
    onEdgeUpdate(edgeId, updatedEdge);
    edge.current = updatedEdge; // enables keeping edge state actual for each tool
  };

  return (
    <div className="flex justify-center gap-1">
      {tools.map((Tool: any, index) => (
        <Tool key={index} edge={edge.current} onChange={applyChange} />
      ))}
    </div>
  );
}
