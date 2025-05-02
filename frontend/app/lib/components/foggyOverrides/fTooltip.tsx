import { Tooltip } from '@heroui/tooltip';

export default function FTooltip({ content, children }) {
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
    >
      {children}
    </Tooltip>
  );
}
