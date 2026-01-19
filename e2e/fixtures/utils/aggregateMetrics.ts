import {
  AggregatedMetrics,
  RawPerformanceMetrics,
} from './performanceCollector';

export function aggregateMetrics(
  raw: RawPerformanceMetrics,
): AggregatedMetrics {
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const percentile = (arr: number[], p: number) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(p * sorted.length)];
  };

  const droppedFrames = raw.frames.filter((f) => f > 50).length;
  const tbt = raw.longTasks
    .filter((t) => t > 50)
    .reduce((a, b) => a + (b - 50), 0);

  return {
    fps: {
      avg: avg(raw.fps),
      min: Math.min(...raw.fps),
      max: Math.max(...raw.fps),
      p95: percentile(raw.fps, 0.95),
    },
    frameTime: {
      avg: avg(raw.frames),
      p95: percentile(raw.frames, 0.95),
    },
    droppedFrames,
    longTasks: {
      count: raw.longTasks.length,
      totalTime: raw.longTasks.reduce((a: number, b: number) => a + b, 0),
      max: Math.max(0, ...raw.longTasks),
      tbt,
    },
    eventLoopLag: {
      avg: avg(raw.eventLoopLag),
      max: Math.max(0, ...raw.eventLoopLag),
    },
    memory: {
      usedHeapAvg: avg(raw.memory.usedJSHeapSize),
      usedHeapMax: Math.max(0, ...raw.memory.usedJSHeapSize),
      growth: raw.memory.usedJSHeapSize.at(-1) - raw.memory.usedJSHeapSize[0],
    },
  };
}
