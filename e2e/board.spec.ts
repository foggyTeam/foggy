import { expect, Page, test } from '@playwright/test';
import MainPageFixture from './fixtures/pages/mainPage';
import { BASE_URL, PROJECT, SIMPLE_BOARD } from './fixtures/data';
import ProjectPageFixture from './fixtures/pages/projectPage';
import BoardPageFixture from './fixtures/pages/boardPage';
import PerformanceCollector from './fixtures/utils/performanceCollector';
import saveResults from './fixtures/utils/saveResults';
import { generatePath } from './fixtures/utils/boardUtils';

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
    await boardPage.drawLine([
      [180, 220],
      [220, 200],
      [280, 250],
      [340, 215],
      [400, 270],
      [460, 230],
      [520, 280],
    ]);

    await boardPage.drawLine([
      [320, 220],
      [350, 240],
      [400, 270],
      [460, 230],
      [520, 280],
    ]);
    await boardPage.toggleTool('eraser');
    await boardPage.drawLine([
      [320, 220],
      [350, 240],
      [325, 225],
      [345, 235],
    ]);

    await boardPage.toggleTool('rect');
    await boardPage.drawLine([
      [400, 200],
      [800, 400],
    ]);

    await boardPage.toggleTool('ellipse');
    await boardPage.drawLine([
      [600, 200],
      [800, 400],
    ]);

    await boardPage.placeText('Hello Board', { x: 700, y: 350 });

    await boardPage.zoom(3, true);
    await boardPage.zoom(4, false);

    await boardPage.dragBoard([
      [500, 500],
      [400, 400],
      [300, 100],
      [500, 500],
      [750, 800],
    ]);

    await boardPage.reset();
  });
  test('Performance benchmark', async () => {
    test.setTimeout(5 * 60 * 1000);

    const performanceCollector = new PerformanceCollector(page);
    const boardPage = new BoardPageFixture(page);

    await performanceCollector.start();

    {
      /* ---------- 1. WARM-UP ---------- */
      await boardPage.toggleTool('pencil');
      await boardPage.drawLine(generatePath(100, 100, 15, 30));

      /* ---------- 2. OBJECT ACCUMULATION ---------- */
      for (let i = 0; i < 20; i++) {
        await boardPage.drawLine(
          generatePath(200 + i * 20, 200 + i * 5, 10, 30),
        );

        if (i % 5 === 0) {
          await boardPage.toggleTool('rect');
          await boardPage.drawLine([
            [255 + i * 10, 500],
            [300 + i * 10, 550],
          ]);
          await boardPage.toggleTool('pencil');
        }
      }

      /* ---------- 3. CAMERA STRESS ---------- */
      for (let i = 0; i < 8; i++) {
        await boardPage.zoom(3, true);
        await boardPage.dragBoard([
          [400, 400],
          [200, 200],
          [550, 550],
        ]);
        await boardPage.reset();
      }

      /* ---------- 4. HEAVY INTERACTION AFTER RESET ---------- */
      await boardPage.toggleTool('ellipse');
      for (let i = 0; i < 10; i++) {
        await boardPage.drawLine([
          [500 + i * 15, 300],
          [700 + i * 15, 450],
        ]);
      }

      /* ---------- 5. TEXT OVERLOAD ---------- */
      /*
      for (let i = 0; i < 12; i++) {
        await boardPage.placeText(`Label ${i}`, {
          x: 150 + i * 70,
          y: 600,
        });
      }*/

      /* ---------- 6. FINAL CAMERA STRESS ---------- */
      for (let i = 0; i < 5; i++) {
        await boardPage.zoom(4, true);
        await boardPage.zoom(4, false);
        await boardPage.dragBoard([
          [500, 500],
          [300, 300],
          [700, 700],
        ]);
      }
    }

    const results = await performanceCollector.stop();
    saveResults(results);

    expect(results.fps.avg).toBeGreaterThan(25);
    expect(results.longTasks.count).toBeLessThan(20);
    expect(results.memory.growth).toBeLessThan(50_000_000);
  });
  test.afterAll(async () => {
    await page.close();
  });
});
