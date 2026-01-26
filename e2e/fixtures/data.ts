import fs from 'fs/promises';
import { ProjectSettings } from '../../frontend/app/lib/types/definitions';

const USER_CONTEXT_PATH = './e2e/.user_context.json';

export const BASE_URL = 'http://localhost:3000';

export const USER = {
  name: 'test_agent',
  email: 'test_agent@gmail.com',
  password: '123testPass',
};

export const PROJECT = {
  name: 'Test Project',
  description: 'Base project entity for tests.',
  section: 'TEST SECTION',
  settings: new ProjectSettings(),
};

export const SIMPLE_BOARD = {
  type: 'SIMPLE',
  name: 'Test Simple Board',
};

let cachedUserId = null;
export async function saveUserId(id: string) {
  cachedUserId = id;
  try {
    await fs.writeFile(
      USER_CONTEXT_PATH,
      JSON.stringify({ id }, null, 2),
      'utf8',
    );
    return true;
  } catch {
    return false;
  }
}

export async function getUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  const raw = await fs.readFile(USER_CONTEXT_PATH, 'utf8');

  const result = JSON.parse(raw);
  const userId = result.id;

  if (!userId) {
    throw new Error('userId is missing in .user_context.json');
  }

  cachedUserId = userId;
  return userId;
}
