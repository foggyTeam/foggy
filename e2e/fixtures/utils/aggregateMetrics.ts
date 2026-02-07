import {
  AggregatedMetrics,
  RawPerformanceMetrics,
} from './performanceCollector';

export function aggregateMetrics(
  raw: RawPerformanceMetrics,
): AggregatedMetrics {
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const safeMin = (arr: number[]) => (arr.length ? Math.min(...arr) : 0);
  const safeMax = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);

  const percentile = (arr: number[], p: number) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.min(
      sorted.length - 1,
      Math.max(0, Math.ceil(p * sorted.length) - 1),
    );
    return sorted[idx];
  };

  const droppedFrames = raw.frames.filter((f) => f > 50).length;

  const tbt = raw.longTasks
    .filter((t) => t > 50)
    .reduce((a, b) => a + (b - 50), 0);

  const used = raw.memory.usedJSHeapSize ?? [];
  const growth = used.length >= 2 ? used[used.length - 1] - used[0] : 0;

  const inpDurations = (raw.interactions?.durations ?? []).filter((n) =>
    Number.isFinite(n),
  );

  return {
    fps: {
      avg: avg(raw.fps),
      min: safeMin(raw.fps),
      max: safeMax(raw.fps),
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
      max: safeMax(raw.longTasks),
      tbt,
    },
    eventLoopLag: {
      avg: avg(raw.eventLoopLag),
      max: safeMax(raw.eventLoopLag),
    },
    memory: {
      usedHeapAvg: avg(used),
      usedHeapMax: safeMax(used),
      growth,
    },
    cls: raw.cls?.value ?? 0,
    inp: {
      p98: percentile(inpDurations, 0.98),
      samples: inpDurations.length,
    },
    measures: raw.measures ?? [],
  };
}
