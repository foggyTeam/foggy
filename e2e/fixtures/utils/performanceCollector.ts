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
  paint: PerformanceEntry[];
  layout: PerformanceEntry[];
  resources: PerformanceEntry[];
  navigation: PerformanceNavigationTiming | null;
};

export type AggregatedMetrics = {
  fps: {
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
};

export default class PerformanceCollector {
  constructor(public readonly page: Page) {}

  async start() {
    await this.page.evaluate(() => {
      // @ts-ignore
      window.__perf = {
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
        resources: [],
        navigation: null,
      };

      // FPS
      let lastFrame = performance.now();
      function frame(now) {
        const delta = now - lastFrame;
        lastFrame = now;

        // @ts-ignore
        window.__perf.frames.push(delta);
        // @ts-ignore
        window.__perf.fps.push(1000 / delta);

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      // EVENT LOOP LAG
      let lastTick = performance.now();
      setInterval(() => {
        const now = performance.now();
        const lag = now - lastTick - 100;
        lastTick = now;
        // @ts-ignore
        window.__perf.eventLoopLag.push(Math.max(0, lag));
      }, 100);

      // LONG TASKS
      new PerformanceObserver((list) => {
        list.getEntries().forEach((e) => {
          // @ts-ignore
          window.__perf.longTasks.push(e.duration);
        });
      }).observe({ entryTypes: ['longtask'] });

      // PAINT & LAYOUT
      new PerformanceObserver((list) => {
        list.getEntries().forEach((e) => {
          // @ts-ignore
          window.__perf.paint.push({
            name: e.name,
            startTime: e.startTime,
            duration: e.duration,
          });
        });
      }).observe({ entryTypes: ['paint'] });

      new PerformanceObserver((list) => {
        list.getEntries().forEach((e) => {
          // @ts-ignore
          window.__perf.layout.push({
            name: e.name,
            startTime: e.startTime,
            duration: e.duration,
          });
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // MEMORY
      if ('memory' in performance) {
        setInterval(() => {
          // @ts-ignore
          window.__perf.memory.usedJSHeapSize.push(
            performance.memory.usedJSHeapSize,
          );
          // @ts-ignore
          window.__perf.memory.totalJSHeapSize.push(
            performance.memory.totalJSHeapSize,
          );
        }, 200);
      }

      // RESOURCES
      // @ts-ignore
      window.__perf.resources = performance.getEntriesByType('resource');

      // NAVIGATION
      const nav = performance.getEntriesByType('navigation')[0];
      // @ts-ignore
      window.__perf.navigation = nav || null;
    });
  }

  async stop() {
    const raw: RawPerformanceMetrics = await this.page.evaluate(() => {
      // @ts-ignore
      return window.__perf;
    });

    return aggregateMetrics(raw);
  }
}
