'use client';

import { Tooltip } from '@heroui/tooltip';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function FTooltip({
  content,
  children,
  placement,
}: {
  content: string;
  children: any;
  placement?: any;
}) {
  const { isMobile } = useAdaptiveParams();

  if (isMobile) return children;

  return (
    <Tooltip
      showArrow
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
