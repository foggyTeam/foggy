'use client';

import DoubledHandle from '@/app/lib/components/board/graph/doubledHandle';
import { Position } from '@xyflow/react';
import { Card, CardBody } from '@heroui/card';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import GraphTooltipToolbar from '@/app/lib/components/board/graph/menu/graphTooltipToolbar';
import React, { useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';

function NodeWrapper({
  isSelected,
  onBlur,
  onPress,
  toolbarProps,
  toolbarTools,
  underlay,
  children,
  className,
  style,
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
      {underlay && (
        <div
          className={clsx(
            'pointer-events-none absolute inset-0 overflow-clip rounded-xl',
            isSelected && 'border-primary dark:border-primary-100 border-1.5',
          )}
        >
          {underlay}
        </div>
      )}
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
          underlay &&
            'bg-opacity-0 rounded-none border-none bg-none shadow-none backdrop-blur-none',
          className,
        )}
        style={style}
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

export default React.memo(NodeWrapper);
