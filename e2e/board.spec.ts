import { expect, Page, test } from '@playwright/test';
import { BASE_URL, PROJECT, SIMPLE_BOARD } from './fixtures/data';
import BoardPageFixture from './fixtures/pages/boardPage';
import PerformanceCollector from './fixtures/utils/performanceCollector';
import saveResults from './fixtures/utils/saveResults';
import { generatePath } from './fixtures/utils/boardUtils';
import {
  AddBoard,
  AddNewProject,
  AddSection,
  DeleteBoard,
  GetAllProjects,
  GetProject,
} from './fixtures/api/project';

let page: Page;
let projectId = undefined;
let sectionId = undefined;
let boardId = undefined;

test.describe('Board', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    const projects = await GetAllProjects();
    const existing = projects.find((p: any) => p.name === PROJECT.name);

    if (existing) projectId = existing.id;
    else {
      const result = await AddNewProject({
        name: PROJECT.name,
        description: PROJECT.description,
        settings: PROJECT.settings,
      });
      projectId = result?.data.id;
    }

    expect(projectId).toBeTruthy();

    const project = await GetProject(projectId);

    const section = project.sections.find((s) => s.name === PROJECT.section);
    if (section) sectionId = section.id;
    else {
      const result = await AddSection(projectId, {
        name: PROJECT.section,
        parentSectionId: null,
      });
      sectionId = result.data.id;
    }

    expect(sectionId).toBeTruthy();
  });
  test.beforeEach(async () => {
    if (boardId) {
      await DeleteBoard(boardId);
    }

    const result = await AddBoard(projectId, {
      sectionId,
      name: SIMPLE_BOARD.name,
      type: SIMPLE_BOARD.type,
    });
    boardId = result?.data?.id;

    expect(boardId).toBeTruthy();

    await page.goto(`${BASE_URL}/project/${projectId}/${sectionId}/${boardId}`);

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
