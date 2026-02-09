'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

const createGridPattern = (gridSize: number) => {
  const size = gridSize;
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="1" fill="#d4d4d8" />
    </svg>
  `;
};

export default function GridBackground({ gridSize }: { gridSize: number }) {
  const { stageRef, updateGridRef } = useBoardContext();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const patternUrl = useMemo(() => {
    const svgPattern = createGridPattern(gridSize);
    return `data:image/svg+xml;base64,${btoa(svgPattern)}`;
  }, [gridSize]);

  const updateGrid = () => {
    const stage = stageRef.current;
    const grid = gridRef.current;
    if (!stage || !grid) return;

    const scale = stage.scaleX();
    const pos = stage.position();

    const step = gridSize * scale;

    const offsetX = pos.x % step;
    const offsetY = pos.y % step;

    grid.style.backgroundImage = `url(${patternUrl})`;
    grid.style.backgroundRepeat = 'repeat';
    grid.style.backgroundSize = `${step}px ${step}px`;
    grid.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
  };

  useEffect(() => {
    updateGridRef.current = updateGrid;
    updateGrid();
    return () => {
      if (updateGridRef.current === updateGrid) {
        updateGridRef.current = null;
      }
    };
  }, [updateGridRef, patternUrl, gridSize]);

  return <div ref={gridRef} className="pointer-events-none absolute inset-0" />;
}
