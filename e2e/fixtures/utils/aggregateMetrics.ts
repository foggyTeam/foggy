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

  const frames = (raw.frames ?? []).filter(
    (d) => Number.isFinite(d) && d > 0 && d < 1000,
  );

  const totalTimeMs = sum(frames);
  const framesCount = frames.length;

  const effectiveFps = totalTimeMs > 0 ? framesCount / (totalTimeMs / 1000) : 0;
  const avgFrameTime = avg(frames);
  const avgFps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

  const minFps = safeMax(frames) > 0 ? 1000 / safeMax(frames) : 0;
  const maxFps = safeMin(frames) > 0 ? 1000 / safeMin(frames) : 0;

  const p5FrameTime = percentile(frames, 0.05);
  const p95Fps = p5FrameTime > 0 ? 1000 / p5FrameTime : 0;

  const targetFrameMs = 1000 / 60;
  const droppedFrameThresholdMs = targetFrameMs * 2.5;
  const droppedFrames = frames.filter(
    (d) => d > droppedFrameThresholdMs,
  ).length;

  const ltAgg = raw.longTasksAgg ?? { count: 0, totalTime: 0, max: 0, tbt: 0 };

  const used = (raw.memory?.usedJSHeapSize ?? []).filter((n) =>
    Number.isFinite(n),
  );
  const growth = used.length >= 2 ? used[used.length - 1] - used[0] : 0;

  const inpDurations = (raw.interactions?.durations ?? []).filter(
    (n) => Number.isFinite(n) && n > 0,
  );

  return {
    fps: {
      effective: effectiveFps,
      avg: avgFps,
      min: minFps,
      max: maxFps,
      p95: p95Fps,
    },
    frameTime: {
      avg: avgFrameTime,
      p95: percentile(frames, 0.95),
    },
    droppedFrames,
    longTasks: {
      count: ltAgg.count,
      totalTime: ltAgg.totalTime,
      max: ltAgg.max,
      tbt: ltAgg.tbt,
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
      total: raw.interactions?.totalCount ?? inpDurations.length,
    },
    measures: raw.measures ?? [],
  };
}
