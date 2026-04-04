'use client';

import { Tooltip } from '@heroui/tooltip';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { JSX } from 'react';

export default function FTooltip({
  content,
  children,
  placement,
  showArrow = true,
}: {
  content: string | JSX.Element;
  children: any;
  placement?: any;
  showArrow?: boolean;
}) {
  const { isMobile } = useAdaptiveParams();

  if (isMobile) return children;

  return (
    <Tooltip
      showArrow={showArrow}
      classNames={{
        base: 'before:shadow-container',
        content: 'shadow-container',
      }}
      size="sm"
      content={content}
      delay={600}
      placement={placement}
    >
      {children}
    </Tooltip>
  );
}
