'use client';

import { Chip } from '@heroui/chip';
import { Position } from '@xyflow/react';
import DoubledHandle from '@/app/lib/components/board/graph/doubledHandle';

export default function CustomNode() {
  return (
    <Chip color="primary" variant="flat">
      Custom node
      <DoubledHandle position={Position.Top} id="top" />
      <DoubledHandle position={Position.Bottom} id="bottom" />
      <DoubledHandle position={Position.Left} id="left" />
      <DoubledHandle position={Position.Right} id="right" />
    </Chip>
  );
}
