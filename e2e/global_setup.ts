import { chromium, expect } from '@playwright/test';
import { saveUserId, USER } from './fixtures/data.ts';
import LoginPageFixture from './fixtures/pages/loginPage';
import { AuthorizeUser } from './fixtures/api/user';

const CONTEXT_STORAGE_PATH = './e2e/.auth_state.json';

function log(text: string, step: boolean = true, error: boolean = false) {
  console.log(
    `${step ? '-----------' : ''}${error ? '[ERROR] ' : ''}${text}${step ? '-----------' : ''}`,
  );
}

export default async function globalSetup(config) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  log('START SETUP');

  const userId = await AuthorizeUser(USER.email, USER.password);
  expect(userId).toBeTruthy();

  const saveResult = await saveUserId(userId);
  expect(saveResult).toBeTruthy();

  const loginPage = new LoginPageFixture(page);

  await loginPage.goto();
  await loginPage.authorize(USER.email, USER.password);
  await page.context().storageState({ path: CONTEXT_STORAGE_PATH });

  log('SETUP FINISHED');

  await browser.close();
}
