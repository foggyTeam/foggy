import { expect, test } from '@playwright/test';
import MainPageFixture from './fixtures/pages/mainPage';
import { PROJECT, SIMPLE_BOARD } from './fixtures/data';
import ProjectPageFixture from './fixtures/pages/projectPage';

test.describe('Board', () => {
  test('Create test board if not exists', async ({ page }) => {
    // CREATING PROJECT
    const mainPage = new MainPageFixture(page);
    await mainPage.goto();

    await page.waitForTimeout(3000); // loading page contents

    const isProjectOpened = await mainPage.openProject(PROJECT.name, true);
    expect(isProjectOpened).toBeTruthy();

    // CREATING BOARD
    const projectPage = new ProjectPageFixture(page);
    await page.waitForTimeout(3000); // loading page contents

    await projectPage.addSection(PROJECT.section, []);
    await projectPage.addBoard(SIMPLE_BOARD.name, [PROJECT.section]);
    const isBoardOpened = await projectPage.openBoard(SIMPLE_BOARD.name, [
      PROJECT.section,
    ]);
    expect(isBoardOpened).toBeTruthy();
  });
});
