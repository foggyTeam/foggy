'use client';

import { Handle } from '@xyflow/react';

export default function DoubledHandle(props: any) {
  return (
    <>
      <Handle type="source" {...props} id={`${props.id}-source`} />
      <Handle
        type="target"
        {...props}
        id={`${props.id}-target`}
        style={{ visibility: 'hidden' }}
      />
    </>
  );
}
