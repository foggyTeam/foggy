import {
  AggregatedMetrics,
  RawPerformanceMetrics,
} from './performanceCollector';

export function aggregateMetrics(
  raw: RawPerformanceMetrics,
): AggregatedMetrics {
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

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

  const frameDeltas = (raw.frames ?? []).filter(
    (d) => Number.isFinite(d) && d > 0 && d < 1000,
  );

  const avgFrameTime = avg(frameDeltas);
  const totalTimeMs = sum(frameDeltas);
  const framesCount = frameDeltas.length;

  const avgFpsFromFrames = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

  const effectiveFps = totalTimeMs > 0 ? framesCount / (totalTimeMs / 1000) : 0;

  const p95FrameTime = percentile(frameDeltas, 0.95);
  const p5FrameTime = percentile(frameDeltas, 0.05);
  const p95FpsFromFrames = p5FrameTime > 0 ? 1000 / p5FrameTime : 0;

  const targetFrameMs = 1000 / 60;
  const droppedFrameThresholdMs = targetFrameMs * 2.5;
  const droppedFrames = frameDeltas.filter(
    (d) => d > droppedFrameThresholdMs,
  ).length;

  // TBT
  const longTasks = (raw.longTasks ?? []).filter(
    (t) => Number.isFinite(t) && t > 0,
  );
  const tbt = longTasks.filter((t) => t > 50).reduce((a, b) => a + (b - 50), 0);

  // MEMORY
  const used = (raw.memory?.usedJSHeapSize ?? []).filter((n) =>
    Number.isFinite(n),
  );
  const growth = used.length >= 2 ? used[used.length - 1] - used[0] : 0;

  // INP
  const inpDurations = (raw.interactions?.durations ?? []).filter(
    (n) => Number.isFinite(n) && n > 0,
  );

  const minFpsFromFrames =
    safeMax(frameDeltas) > 0 ? 1000 / safeMax(frameDeltas) : 0;
  const maxFpsFromFrames =
    safeMin(frameDeltas) > 0 ? 1000 / safeMin(frameDeltas) : 0;

  return {
    fps: {
      effective: effectiveFps,
      avg: avgFpsFromFrames,
      min: minFpsFromFrames,
      max: maxFpsFromFrames,
      p95: p95FpsFromFrames,
    },
    frameTime: {
      avg: avgFrameTime,
      p95: p95FrameTime,
    },
    droppedFrames,
    longTasks: {
      count: longTasks.length,
      totalTime: sum(longTasks),
      max: safeMax(longTasks),
      tbt,
    },
    eventLoopLag: {
      avg: avg(
        (raw.eventLoopLag ?? []).filter((n) => Number.isFinite(n) && n >= 0),
      ),
      max: safeMax(
        (raw.eventLoopLag ?? []).filter((n) => Number.isFinite(n) && n >= 0),
      ),
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
