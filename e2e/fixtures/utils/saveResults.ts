import fs from 'fs';
import { AggregatedMetrics } from './performanceCollector';
import * as path from 'path';

export default function saveResults(metrics: AggregatedMetrics) {
  const dir = './e2e/performance/board';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(
    dir,
    `${new Date().toLocaleString().replace(', ', '_')}.json`,
  );
  fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));
}
