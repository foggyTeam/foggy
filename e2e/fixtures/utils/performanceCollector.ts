import { Page } from '@playwright/test';
import { aggregateMetrics } from './aggregateMetrics';

export type RawPerformanceMetrics = {
  fps: number[];
  frames: number[];
  longTasks: number[];
  longTasksAgg: {
    count: number;
    totalTime: number;
    max: number;
    tbt: number;
  };
  eventLoopLag: number[];
  memory: {
    usedJSHeapSize: number[];
    totalJSHeapSize: number[];
  };
  paint: Array<{ name: string; startTime: number; duration: number }>;
  layout: Array<{ name: string; startTime: number; duration: number }>;
  cls: {
    value: number;
    entries: Array<{ startTime: number; value: number }>;
  };
  interactions: {
    durations: number[];
    totalCount: number;
    entries: Array<{
      name: string;
      duration: number;
      startTime: number;
      processingStart?: number;
      processingEnd?: number;
      interactionId?: number;
    }>;
  };
  measures: Array<{
    name: string;
    duration: number;
    startTime: number;
  }>;
  resources: PerformanceEntry[];
  navigation: PerformanceNavigationTiming | null;
};

export type AggregatedMetrics = {
  fps: {
    effective: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
  frameTime: {
    avg: number;
    p95: number;
  };
  droppedFrames: number;
  longTasks: {
    count: number;
    totalTime: number;
    max: number;
    tbt: number;
  };
  eventLoopLag: {
    avg: number;
    max: number;
  };
  memory: {
    usedHeapAvg: number;
    usedHeapMax: number;
    growth: number;
  };
  cls: number;
  inp: {
    p98: number;
    samples: number; // сколько значений использовано для percentile
    total: number;
  };
  measures: Array<{ name: string; duration: number; startTime: number }>;
};

export async function setCpuThrottling(page: Page, rate = 4) {
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate });
  return client;
}

export type PerformanceCollectorOptions = {
  boardSelector: string;
  eventDurationThreshold?: number;
  maxFrameSamples?: number;
  maxEventLoopLagSamples?: number;
  maxMemorySamples?: number;
  inpReservoirSize?: number;
  longTaskReservoirSize?: number;
  collectDebugEntries?: boolean;
  maxDebugEntries?: number;
  measureNameAllowlist?: {
    prefixes?: string[];
    exact?: string[];
  } | null;
  collectResources?: boolean;
  collectNavigation?: boolean;
};

export default class PerformanceCollector {
  constructor(
    public readonly page: Page,
    private options: PerformanceCollectorOptions,
  ) {}

  async start() {
    const boardSelector = this.options.boardSelector;

    // OPTIONS
    const durationThreshold = this.options.eventDurationThreshold ?? 16;
    const maxFrameSamples = this.options.maxFrameSamples ?? 20_000;
    const maxEventLoopLagSamples =
      this.options.maxEventLoopLagSamples ?? 10_000;
    const maxMemorySamples = this.options.maxMemorySamples ?? 10_000;
    const inpReservoirSize = this.options.inpReservoirSize ?? 2000;
    const longTaskReservoirSize = this.options.longTaskReservoirSize ?? 2000;
    const collectDebugEntries = this.options.collectDebugEntries ?? false;
    const maxDebugEntries = this.options.maxDebugEntries ?? 2_000;
    const measureAllow = this.options.measureNameAllowlist ?? {
      prefixes: ['board:'],
      exact: [],
    };
    const collectResources = this.options.collectResources ?? false;
    const collectNavigation = this.options.collectNavigation ?? true;

    await this.page.evaluate(
      ({
        boardSelector,
        durationThreshold,
        maxFrameSamples,
        maxEventLoopLagSamples,
        maxMemorySamples,
        inpReservoirSize,
        longTaskReservoirSize,
        collectDebugEntries,
        maxDebugEntries,
        measureAllow,
        collectResources,
        collectNavigation,
      }) => {
        type PerfState = RawPerformanceMetrics & {
          __timers?: number[];
          __rafId?: number;
          __startedAt?: number;
          __ring?: Record<
            string,
            { cap: number; buf: number[]; idx: number; full: boolean }
          >;
          __reservoir?: Record<
            string,
            { cap: number; arr: number[]; seen: number }
          >;
        };

        const createRing = (cap: number) => ({
          cap,
          buf: new Array<number>(cap),
          idx: 0,
          full: false,
        });

        const ringPush = (
          ring: { cap: number; buf: number[]; idx: number; full: boolean },
          v: number,
        ) => {
          ring.buf[ring.idx] = v;
          ring.idx = (ring.idx + 1) % ring.cap;
          if (ring.idx === 0) ring.full = true;
        };

        const ringToArray = (ring: {
          cap: number;
          buf: number[];
          idx: number;
          full: boolean;
        }) => {
          if (!ring.full) return ring.buf.slice(0, ring.idx);
          return ring.buf.slice(ring.idx).concat(ring.buf.slice(0, ring.idx));
        };

        // Reservoir sampling (Vitter's Algorithm R)
        const reservoirPush = (
          r: { cap: number; arr: number[]; seen: number },
          v: number,
        ) => {
          r.seen += 1;
          const n = r.seen;
          if (r.arr.length < r.cap) {
            r.arr.push(v);
            return;
          }
          const j = Math.floor(Math.random() * n);
          if (j < r.cap) r.arr[j] = v;
        };

        const shouldCollectMeasure = (name: unknown): boolean => {
          if (!measureAllow) return false;
          if (typeof name !== 'string') return false;

          const exact = measureAllow.exact ?? [];
          if (exact.includes(name)) return true;

          const prefixes = measureAllow.prefixes ?? [];
          return prefixes.some((p) => name.startsWith(p));
        };

        const perf: PerfState = (window.__perf = {
          fps: [],
          frames: [],
          longTasks: [],
          longTasksAgg: { count: 0, totalTime: 0, max: 0, tbt: 0 },
          eventLoopLag: [],
          memory: { usedJSHeapSize: [], totalJSHeapSize: [] },

          paint: [],
          layout: [],

          cls: { value: 0, entries: [] },
          interactions: { durations: [], totalCount: 0, entries: [] },

          measures: [],
          resources: [],
          navigation: null,

          __timers: [],
          __rafId: undefined,
          __startedAt: performance.now(),
          __ring: {
            frames: createRing(maxFrameSamples),
            fps: createRing(maxFrameSamples),
            lag: createRing(maxEventLoopLagSamples),
            memUsed: createRing(maxMemorySamples),
            memTotal: createRing(maxMemorySamples),
          },
          __reservoir: {
            inp: { cap: inpReservoirSize, arr: [], seen: 0 },
            long: { cap: longTaskReservoirSize, arr: [], seen: 0 },
          },
        });

        // FPS / frame times (ring)
        let lastFrame = performance.now();
        const raf = (now: number) => {
          const delta = now - lastFrame;
          lastFrame = now;

          if (Number.isFinite(delta) && delta > 0 && delta < 1000) {
            ringPush(perf.__ring!.frames, delta);
            ringPush(perf.__ring!.fps, 1000 / delta);
          }

          perf.__rafId = requestAnimationFrame(raf);
        };
        perf.__rafId = requestAnimationFrame(raf);

        // EVENT LOOP LAG (ring)
        let lastTick = performance.now();
        const lagTimer = window.setInterval(() => {
          const now = performance.now();
          const lag = now - lastTick - 100;
          lastTick = now;
          ringPush(perf.__ring!.lag, Math.max(0, lag));
        }, 100);
        perf.__timers!.push(lagTimer);

        // LONG TASKS
        try {
          new PerformanceObserver((list) => {
            list.getEntries().forEach((e) => {
              const d = Number(e.duration) || 0;
              if (d <= 0) return;

              perf.longTasksAgg.count += 1;
              perf.longTasksAgg.totalTime += d;
              if (d > perf.longTasksAgg.max) perf.longTasksAgg.max = d;
              if (d > 50) perf.longTasksAgg.tbt += d - 50;

              reservoirPush(perf.__reservoir!.long, d);
            });
          }).observe({ type: 'longtask', buffered: true } as any);
        } catch {}

        // PAINT / LAYOUT (debug-only)
        const pushLastN = <T>(arr: T[], item: T, cap: number) => {
          arr.push(item);
          if (arr.length > cap) arr.splice(0, arr.length - cap);
        };

        if (collectDebugEntries) {
          try {
            new PerformanceObserver((list) => {
              list.getEntries().forEach((e) => {
                pushLastN(
                  perf.paint,
                  {
                    name: e.name,
                    startTime: e.startTime,
                    duration: e.duration,
                  },
                  maxDebugEntries,
                );
              });
            }).observe({ type: 'paint', buffered: true });
          } catch {}

          try {
            new PerformanceObserver((list) => {
              list.getEntries().forEach((e: any) => {
                pushLastN(
                  perf.layout,
                  {
                    name: e.name,
                    startTime: e.startTime,
                    duration: e.duration,
                  },
                  maxDebugEntries,
                );
              });
            }).observe({ type: 'layout-shift', buffered: true } as any);
          } catch {}
        }

        // CLS
        try {
          new PerformanceObserver((list) => {
            list.getEntries().forEach((e: any) => {
              if (e.hadRecentInput) return;
              perf.cls.value += e.value;
              pushLastN(
                perf.cls.entries,
                { startTime: e.startTime, value: e.value },
                maxDebugEntries,
              );
            });
          }).observe({ type: 'layout-shift', buffered: true } as any);
        } catch {}

        // INP — Event Timing API (reservoir)
        const isFromBoard = (target: any) => {
          if (!target || !target.closest) return false;
          return !!target.closest(boardSelector);
        };

        try {
          new PerformanceObserver((list) => {
            list.getEntries().forEach((e: any) => {
              if (!isFromBoard(e.target)) return;

              const duration = Number(e.duration) || 0;
              if (duration <= 0) return;

              perf.interactions.totalCount += 1;
              reservoirPush(perf.__reservoir!.inp, duration);

              if (collectDebugEntries) {
                pushLastN(
                  perf.interactions.entries,
                  {
                    name: e.name,
                    duration,
                    startTime: e.startTime,
                    processingStart: e.processingStart,
                    processingEnd: e.processingEnd,
                    interactionId: e.interactionId,
                  },
                  maxDebugEntries,
                );
              }
            });
          }).observe({
            type: 'event',
            buffered: true,
            durationThreshold,
          } as any);
        } catch {}

        // USER TIMINGS
        if (measureAllow) {
          try {
            new PerformanceObserver((list) => {
              list.getEntries().forEach((e: any) => {
                if (!shouldCollectMeasure(e.name)) return;
                pushLastN(
                  perf.measures,
                  {
                    name: e.name,
                    duration: e.duration,
                    startTime: e.startTime,
                  },
                  maxDebugEntries,
                );
              });
            }).observe({ type: 'measure', buffered: true } as any);
          } catch {}
        }

        // MEMORY (ring)
        if ('memory' in performance) {
          const memTimer = window.setInterval(() => {
            // @ts-ignore
            const mem = performance.memory;
            if (!mem) return;

            ringPush(perf.__ring!.memUsed, mem.usedJSHeapSize);
            ringPush(perf.__ring!.memTotal, mem.totalJSHeapSize);
          }, 200);
          perf.__timers!.push(memTimer);
        }

        // RESOURCES / NAVIGATION
        try {
          if (collectResources) {
            perf.resources = performance.getEntriesByType('resource');
          }
        } catch {}

        try {
          if (collectNavigation) {
            const nav = performance.getEntriesByType('navigation')[0];
            perf.navigation = nav || null;
          }
        } catch {}

        perf.__materialize = () => {
          perf.frames = ringToArray(perf.__ring!.frames);
          perf.fps = ringToArray(perf.__ring!.fps);
          perf.eventLoopLag = ringToArray(perf.__ring!.lag);
          perf.memory.usedJSHeapSize = ringToArray(perf.__ring!.memUsed);
          perf.memory.totalJSHeapSize = ringToArray(perf.__ring!.memTotal);

          perf.interactions.durations = perf.__reservoir!.inp.arr.slice();
          perf.longTasks = perf.__reservoir!.long.arr.slice();
        };
      },
      {
        boardSelector,
        durationThreshold,
        maxFrameSamples,
        maxEventLoopLagSamples,
        maxMemorySamples,
        inpReservoirSize,
        longTaskReservoirSize,
        collectDebugEntries,
        maxDebugEntries,
        measureAllow,
        collectResources,
        collectNavigation,
      },
    );
  }

  async stop(): Promise<AggregatedMetrics> {
    const raw: RawPerformanceMetrics = await this.page.evaluate(() => {
      const perf = window.__perf;

      try {
        if (perf?.__rafId) cancelAnimationFrame(perf.__rafId);
      } catch {}
      try {
        if (Array.isArray(perf?.__timers)) {
          for (const t of perf.__timers) clearInterval(t);
        }
      } catch {}

      try {
        perf?.__materialize?.();
      } catch {}

      return perf;
    });

    return aggregateMetrics(raw);
  }
}
