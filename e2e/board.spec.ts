import { expect, test } from '@playwright/test';
import MainPageFixture from './fixtures/pages/mainPage';
import { PROJECT } from './fixtures/data';

test.describe('Board', () => {
  test('Create test board if not exists', async ({ page }) => {
    const mainPage = new MainPageFixture(page);
    await mainPage.goto();

    await page.waitForTimeout(3000); // loading page contents

    const isProjectOpened = await mainPage.openProject(PROJECT.name, true);
    expect(isProjectOpened).toBeTruthy();
  });
});
