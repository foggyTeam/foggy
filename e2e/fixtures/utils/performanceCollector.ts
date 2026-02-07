import { Page } from '@playwright/test';
import { aggregateMetrics } from './aggregateMetrics';

export type RawPerformanceMetrics = {
  fps: number[];
  frames: number[];
  longTasks: number[];
  eventLoopLag: number[];
  memory: {
    usedJSHeapSize: number[];
    totalJSHeapSize: number[];
  };

  /**
   * Дебаг-данные. По умолчанию отключены/ограничены caps.
   * Хранить "всё подряд" (layout/paint/resources/interactions.entries) дорого.
   */
  paint: Array<{ name: string; startTime: number; duration: number }>;
  layout: Array<{ name: string; startTime: number; duration: number }>;

  cls: {
    value: number;
    entries: Array<{ startTime: number; value: number }>;
  };

  interactions: {
    /**
     * Для INP p98 достаточно durations.
     * entries по умолчанию выключены (или ограничены cap), чтобы не раздувать память.
     */
    durations: number[];
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
    tbt: number; // Total Blocking Time
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
    samples: number;
  };
  measures: Array<{ name: string; duration: number; startTime: number }>;
};

export async function setCpuThrottling(page: Page, rate = 4) {
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate });
  return client;
}

export type PerformanceCollectorOptions = {
  /** selector для фильтрации INP (Event Timing entries) */
  boardSelector?: string;
  /** threshold для Event Timing API */
  eventDurationThreshold?: number;

  /**
   * Сколько точек кадров хранить. FPS/frameTime при rAF быстро разрастаются.
   * Можно оставить большим, но cap защищает от "случайно 15 минут гоняли тест".
   */
  maxFrameSamples?: number;

  /** Максимум longtask samples */
  maxLongTaskSamples?: number;

  /** Event loop lag samples */
  maxEventLoopLagSamples?: number;

  /** Memory samples */
  maxMemorySamples?: number;

  /**
   * Собираем ли подробные entries (дорого).
   * По умолчанию: false.
   */
  collectDebugEntries?: boolean;

  /** Максимум элементов для paint/layout/interactions.entries, если collectDebugEntries=true */
  maxDebugEntries?: number;

  /**
   * Какие user-timing measure собирать.
   * По умолчанию: только имена, начинающиеся с "board:".
   * Поставьте null/undefined чтобы вообще не собирать measures.
   */
  measureNameAllowlist?: {
    prefixes?: string[];
    exact?: string[];
  } | null;

  /** Если true — собирать resources */
  collectResources?: boolean;

  /** Если true — собирать navigation */
  collectNavigation?: boolean;
};

export default class PerformanceCollector {
  constructor(
    public readonly page: Page,
    private options: PerformanceCollectorOptions = {},
  ) {}

  async start() {
    const boardSelector =
      this.options.boardSelector ?? '[data-testid="simple-board-stage"]';
    const durationThreshold = this.options.eventDurationThreshold ?? 16;

    const maxFrameSamples = this.options.maxFrameSamples ?? 20_000;
    const maxLongTaskSamples = this.options.maxLongTaskSamples ?? 10_000;
    const maxEventLoopLagSamples =
      this.options.maxEventLoopLagSamples ?? 10_000;
    const maxMemorySamples = this.options.maxMemorySamples ?? 10_000;

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
        maxLongTaskSamples,
        maxEventLoopLagSamples,
        maxMemorySamples,
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
        };

        const pushCapped = <T>(arr: T[], item: T, cap: number) => {
          if (arr.length >= cap) return;
          arr.push(item);
        };

        // @ts-ignore
        const perf: PerfState = (window.__perf = {
          fps: [],
          frames: [],
          longTasks: [],
          eventLoopLag: [],
          memory: {
            usedJSHeapSize: [],
            totalJSHeapSize: [],
          },

          paint: [],
          layout: [],

          cls: { value: 0, entries: [] },
          interactions: { durations: [], entries: [] },

          measures: [],
          resources: [],
          navigation: null,

          __timers: [],
          __rafId: undefined,
          __startedAt: performance.now(),
        });

        // -----------------------
        // FPS (rAF)
        // -----------------------
        let lastFrame = performance.now();
        const raf = (now: number) => {
          const delta = now - lastFrame;
          lastFrame = now;

          // frame time
          if (delta > 0 && delta < 1000) {
            pushCapped(perf.frames, delta, maxFrameSamples);
            pushCapped(perf.fps, 1000 / delta, maxFrameSamples);
          }

          perf.__rafId = requestAnimationFrame(raf);
        };
        perf.__rafId = requestAnimationFrame(raf);

        // -----------------------
        // EVENT LOOP LAG
        // -----------------------
        let lastTick = performance.now();
        const lagTimer = window.setInterval(() => {
          const now = performance.now();
          const lag = now - lastTick - 100;
          lastTick = now;
          pushCapped(
            perf.eventLoopLag,
            Math.max(0, lag),
            maxEventLoopLagSamples,
          );
        }, 100);
        perf.__timers!.push(lagTimer);

        // -----------------------
        // LONG TASKS
        // -----------------------
        try {
          new PerformanceObserver((list) => {
            list.getEntries().forEach((e) => {
              pushCapped(perf.longTasks, e.duration, maxLongTaskSamples);
            });
          }).observe({ type: 'longtask', buffered: true } as any);
        } catch {
          // longtask может быть недоступен
        }

        // -----------------------
        // PAINT (debug-only)
        // -----------------------
        if (collectDebugEntries) {
          try {
            new PerformanceObserver((list) => {
              list.getEntries().forEach((e) => {
                pushCapped(
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
        }

        // -----------------------
        // LAYOUT-SHIFT + CLS
        // -----------------------
        try {
          new PerformanceObserver((list) => {
            list.getEntries().forEach((e: any) => {
              // raw entries — только если явно включили
              if (collectDebugEntries) {
                pushCapped(
                  perf.layout,
                  {
                    name: e.name,
                    startTime: e.startTime,
                    duration: e.duration,
                  },
                  maxDebugEntries,
                );
              }

              // CLS accumulation
              if (e.hadRecentInput) return;

              perf.cls.value += e.value;

              // подробности CLS тоже могут разрастаться → cap
              pushCapped(
                perf.cls.entries,
                { startTime: e.startTime, value: e.value },
                maxDebugEntries,
              );
            });
          }).observe({ type: 'layout-shift', buffered: true } as any);
        } catch {}

        // -----------------------
        // INP — Event Timing API
        // -----------------------
        const isFromBoard = (target: any) => {
          if (!target || !target.closest) return false;
          return !!target.closest(boardSelector);
        };

        const shouldCollectMeasure = (name: unknown): boolean => {
          if (!measureAllow) return false;
          if (typeof name !== 'string') return false;

          const exact = measureAllow.exact ?? [];
          if (exact.includes(name)) return true;

          const prefixes = measureAllow.prefixes ?? [];
          return prefixes.some((p) => name.startsWith(p));
        };

        try {
          new PerformanceObserver((list) => {
            list.getEntries().forEach((e: any) => {
              if (!isFromBoard(e.target)) return;

              const duration = Number(e.duration) || 0;
              if (duration <= 0) return;

              // durations достаточно для p98
              pushCapped(
                perf.interactions.durations,
                duration,
                maxFrameSamples,
              );

              // entries — только если включили дебаг
              if (collectDebugEntries) {
                pushCapped(
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
        } catch {
          // Event Timing может быть недоступен
        }

        // -----------------------
        // USER TIMINGS (filtered)
        // -----------------------
        if (measureAllow) {
          try {
            new PerformanceObserver((list) => {
              list.getEntries().forEach((e: any) => {
                if (!shouldCollectMeasure(e.name)) return;

                pushCapped(
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

        // -----------------------
        // MEMORY
        // -----------------------
        // Важно: performance.memory не стандартизован и есть не везде.
        if ('memory' in performance) {
          const memTimer = window.setInterval(() => {
            // @ts-ignore
            const mem = performance.memory;
            if (!mem) return;

            pushCapped(
              perf.memory.usedJSHeapSize,
              mem.usedJSHeapSize,
              maxMemorySamples,
            );
            pushCapped(
              perf.memory.totalJSHeapSize,
              mem.totalJSHeapSize,
              maxMemorySamples,
            );
          }, 200);
          perf.__timers!.push(memTimer);
        }

        // -----------------------
        // RESOURCES / NAVIGATION
        // -----------------------
        try {
          if (collectResources) {
            // @ts-ignore
            perf.resources = performance.getEntriesByType('resource');
          }
        } catch {}

        try {
          if (collectNavigation) {
            const nav = performance.getEntriesByType('navigation')[0];
            // @ts-ignore
            perf.navigation = nav || null;
          }
        } catch {}
      },
      {
        boardSelector,
        durationThreshold,
        maxFrameSamples,
        maxLongTaskSamples,
        maxEventLoopLagSamples,
        maxMemorySamples,
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
      // @ts-ignore
      const perf = window.__perf;

      // подчистим таймеры/raf, чтобы не тянулись дальше
      try {
        if (perf?.__rafId) cancelAnimationFrame(perf.__rafId);
      } catch {}
      try {
        if (Array.isArray(perf?.__timers)) {
          for (const t of perf.__timers) clearInterval(t);
        }
      } catch {}

      // @ts-ignore
      return perf;
    });

    return aggregateMetrics(raw);
  }
}
