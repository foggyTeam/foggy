'use client';

import React from 'react';
import { GEdge } from '@/app/lib/types/definitions';

export default function GraphEdgeToolbar({
  edge,
  onEdgeUpdate,
}: {
  edge: GEdge;
  onEdgeUpdate: (id: string, updatedEdge: GEdge) => void;
}) {
  const tools = [];

  return (
    <div className="flex justify-center gap-1">
      {tools.map((Tool: any, index) => (
        <Tool key={index} />
      ))}
    </div>
  );
}
