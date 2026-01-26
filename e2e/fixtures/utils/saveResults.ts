import fs from 'fs';
import { AggregatedMetrics } from './performanceCollector';
import * as path from 'path';

export default function saveResults(metrics: AggregatedMetrics) {
  const dir = './e2e/performance/board';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const date = new Date().toISOString(); // 2026-01-26T12:34:56.789Z
  const safeDate = date.replace(/[:.]/g, '-'); // 2026-01-26T12-34-56-789Z

  const filePath = path.join(dir, `${safeDate}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));
}
