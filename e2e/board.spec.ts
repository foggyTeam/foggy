import { expect, Page, test } from '@playwright/test';
import MainPageFixture from './fixtures/pages/mainPage';
import { BASE_URL, PROJECT, SIMPLE_BOARD } from './fixtures/data';
import ProjectPageFixture from './fixtures/pages/projectPage';
import BoardPageFixture from './fixtures/pages/boardPage';

let page: Page;
let projectId = undefined;

test.describe('Board', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // CREATING PROJECT IF NOT EXIST
    const mainPage = new MainPageFixture(page);
    await mainPage.goto();

    await page.waitForTimeout(1500); // loading page contents

    const isProjectOpened = await mainPage.openProject(PROJECT.name, true);
    expect(isProjectOpened).toBeTruthy();
    projectId = page.url().split('/').pop();

    // CREATING BOARD IF NOT EXIST
    const projectPage = new ProjectPageFixture(page);
    await page.waitForTimeout(1500); // loading page contents

    const pathExists = await projectPage.checkPathExists(
      [PROJECT.section],
      'section',
    );
    expect(pathExists).toBeTruthy();
  });
  test.beforeEach(async () => {
    const projectPage = new ProjectPageFixture(page);
    if (page.url() !== `${BASE_URL}/project/${projectId}`) {
      await projectPage.goto(projectId);
      await page.waitForTimeout(1500);
    }
    expect(page.url()).toMatch(`${BASE_URL}/project/${projectId}`);

    const deleteResult = await projectPage.deleteElement([
      PROJECT.section,
      SIMPLE_BOARD.name,
    ]);
    expect(deleteResult).toBeTruthy();

    await projectPage.addBoard(SIMPLE_BOARD.name, [PROJECT.section]);
    const isBoardOpened = await projectPage.openBoard(SIMPLE_BOARD.name, [
      PROJECT.section,
    ]);
    expect(isBoardOpened).toBeTruthy();

    await page.waitForTimeout(1500); // loading contents
  });
  test('Board tools work', async () => {
    const boardPage = new BoardPageFixture(page);

    await boardPage.toggleTool('pencil');
  });
  test.afterAll(async () => {
    await page.close();
  });
});
