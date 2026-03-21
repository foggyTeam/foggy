'use client';

import DoubledHandle from '@/app/lib/components/board/graph/doubledHandle';
import { Position } from '@xyflow/react';
import { Card, CardBody } from '@heroui/card';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import GraphTooltipToolbar from '@/app/lib/components/board/graph/menu/graphTooltipToolbar';
import { useCallback, useState } from 'react';
import debounce from 'lodash/debounce';

export default function NodeWrapper({
  className,
  children,
  toggleEdit,
  onBlur,
  onPress,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const delayedMenu = useCallback(
    debounce((newValue: boolean) => setIsMenuOpen(newValue), 256) as any,
    [setIsMenuOpen],
  );
  return (
    <div
      onMouseEnter={() => delayedMenu(true)}
      onMouseLeave={() => delayedMenu(false)}
    >
      <GraphTooltipToolbar toggleEdit={toggleEdit} isOpen={isMenuOpen} />

      <Card
        onPress={onPress}
        onBlur={onBlur}
        allowTextSelectionOnPress
        disableRipple
        isPressable
        className={clsx(
          'w-56 px-1 py-2 text-sm',
          bg_container_no_padding,
          className,
        )}
      >
        <CardBody className="flex flex-col gap-2">{children}</CardBody>
      </Card>
      <DoubledHandle position={Position.Top} id="top" />
      <DoubledHandle position={Position.Bottom} id="bottom" />
      <DoubledHandle position={Position.Left} id="left" />
      <DoubledHandle position={Position.Right} id="right" />
    </div>
  );
}
