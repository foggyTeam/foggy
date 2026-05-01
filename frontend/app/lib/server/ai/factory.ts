import 'server-only';

import { IAiAdapter } from './adapter';
import { DirectAdapter } from './adapters/direct';
import { BackendAdapter } from './adapters/backend';

const mode: 'direct' | 'backend' = process.env.AI_MODE || 'backend';
let aiAdapterInstance: IAiAdapter | null = null;

export function getAiAdapter(): IAiAdapter {
  if (aiAdapterInstance) return aiAdapterInstance;

  if (mode === 'direct') {
    aiAdapterInstance = new DirectAdapter();
    console.log('[AI Factory] Initialized DirectAdapter (Go AI Service)');
  } else {
    aiAdapterInstance = new BackendAdapter();
    console.log('[AI Factory] Initialized BackendAdapter (Main Backend)');
  }

  return aiAdapterInstance;
}
