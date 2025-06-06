'use client';

import { Layer } from 'react-konva';
import { useEffect, useState } from 'react';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

const createGridPattern = (gridSize: number) => {
  const size = gridSize;
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="1" fill="#d4d4d8" />
    </svg>
  `;
};

export default function GridLayer({ gridSize }: { gridSize: number }) {
  const { stageRef, scale } = useBoardContext();
  const [pattern, setPattern] = useState(null);

  useEffect(() => {
    const svgPattern = createGridPattern(gridSize);
    const image: any = new Image();
    image.src = `data:image/svg+xml;base64,${btoa(svgPattern)}`;
    image.onload = () => {
      setPattern(image);
      if (stageRef.current?.container && stageRef.current?.container()) {
        stageRef.current.container().style.backgroundImage = `url(${image.src})`;
        stageRef.current.container().style.backgroundRepeat = 'repeat';
      }
    };
  }, [stageRef, gridSize]);

  const updatePatternPosition = () => {
    const stage = stageRef.current;
    if (stage && pattern) {
      const position = stage.position();
      const offsetX = (position.x % (gridSize * scale)) / scale;
      const offsetY = (position.y % (gridSize * scale)) / scale;
      if (offsetX || offsetY) {
        stage.container().style.backgroundPosition = `${offsetX}px ${offsetY}px`;
        stage.container().style.backgroundSize = `${gridSize / scale}px ${gridSize / scale}px`;
      }
    }
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      stage.on('mousemove', updatePatternPosition);
      stage.on('touchmove', updatePatternPosition);
      stage.on('wheel', updatePatternPosition);
    }
    return () => {
      if (stage) {
        stage.off('mousemove', updatePatternPosition);
        stage.off('touchmove', updatePatternPosition);
        stage.off('wheel', updatePatternPosition);
      }
    };
  }, [stageRef, pattern]);

  return <Layer />;
}
