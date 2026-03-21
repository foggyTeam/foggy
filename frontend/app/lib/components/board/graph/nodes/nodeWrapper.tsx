'use client';

import DoubledHandle from '@/app/lib/components/board/graph/doubledHandle';
import { Position } from '@xyflow/react';
import { Card, CardBody } from '@heroui/card';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import GraphTooltipToolbar from '@/app/lib/components/board/graph/menu/graphTooltipToolbar';
import { useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';

export default function NodeWrapper({
  isSelected,
  onBlur,
  onPress,
  toolbarProps,
  toolbarTools,
  children,
  className,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      delayedMenu.current.cancel();
    };
  }, []);

  const delayedMenu = useRef(
    debounce((newValue: boolean) => setIsMenuOpen(newValue), 256),
  );
  return (
    <div
      onMouseEnter={() => delayedMenu.current(true)}
      onMouseLeave={() => delayedMenu.current(false)}
    >
      <GraphTooltipToolbar
        {...toolbarProps}
        tools={toolbarTools}
        isOpen={isMenuOpen}
      />

      <Card
        onPress={onPress}
        onBlur={onBlur}
        allowTextSelectionOnPress
        disableRipple
        isPressable
        className={clsx(
          'w-56 px-1 py-2 text-sm',
          bg_container_no_padding,
          isSelected && 'border-primary dark:border-primary-100 border-1.5',
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