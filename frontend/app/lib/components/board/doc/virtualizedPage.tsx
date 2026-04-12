'use client';
import { observer } from 'mobx-react-lite';
import DocBlock from '@/app/lib/components/board/doc/textBlock';
import { ScrollShadow } from '@heroui/scroll-shadow';
import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const MOCK_BLOCKS: any[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `block-${i}`,
  type: 'paragraph',
}));

const VirtualizedPage = observer(() => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: MOCK_BLOCKS.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56,
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 3,
  });

  return (
    <ScrollShadow ref={scrollRef} className="h-full w-full overflow-y-auto">
      <div className="relative h-screen">
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={MOCK_BLOCKS[virtualItem.index].id}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            className="absolute w-full py-1"
            style={{
              top: virtualItem.start,
            }}
          >
            <DocBlock block={MOCK_BLOCKS[virtualItem.index]} />
          </div>
        ))}
      </div>
    </ScrollShadow>
  );
});

export default VirtualizedPage;
