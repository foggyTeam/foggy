import { expect, Page, test } from '@playwright/test';
import { BASE_URL, GRAPH_BOARD, PROJECT } from './fixtures/data';
import GraphBoardPageFixture from './fixtures/pages/graphBoardPage';
import PerformanceCollector from './fixtures/utils/performanceCollector';
import saveResults from './fixtures/utils/saveResults';
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

test.describe('Graph Board', () => {
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
    const project = await GetProject(projectId);
    const section = project.sections.find((s) => s.id === sectionId);
    for (const child of section.children) {
      if (
        child.name === GRAPH_BOARD.name &&
        child.type.toUpperCase() === GRAPH_BOARD.type
      )
        await DeleteBoard(child.id);
    }

    const result = await AddBoard(projectId, {
      sectionId,
      name: GRAPH_BOARD.name,
      type: GRAPH_BOARD.type,
    });

    boardId = result?.data?.id;
    expect(boardId).toBeTruthy();
  });

  test('Graph board renders and nodes are interactive', async () => {
    const boardPage = new GraphBoardPageFixture(page);
    await boardPage.goto(projectId, sectionId, boardId);
    await boardPage.waitForReady();

    // Verify that mock nodes loaded
    const count = await boardPage.nodeCount();
    expect(count).toBeGreaterThan(0);

    // Basic node interaction: select first node, then deselect
    await boardPage.clickNode(0);
    await boardPage.clickPane(50, 50);

    // Drag first node and verify it doesn't crash
    await boardPage.dragNode(0, 80, 60, 20);

    // Reset viewport
    await boardPage.reset();
  });

  test('Performance benchmark', async () => {
    test.setTimeout(5 * 60 * 1000);

    const boardPage = new GraphBoardPageFixture(page);
    const performanceCollector = new PerformanceCollector(page, {
      boardSelector: '[data-testid="graph-board"]',
      eventDurationThreshold: 16,
    });

    await performanceCollector.start();

    /* ---------- 0. READY-TIME ---------- */
    await page.evaluate(() => performance.mark('board:ready:start'));
    await boardPage.goto(projectId, sectionId, boardId);
    await boardPage.waitForReady();
    await page.evaluate(() => {
      performance.mark('board:ready:end');
      performance.measure('board:ready', 'board:ready:start', 'board:ready:end');
    });

    /* ---------- 1. WARM-UP — select and deselect nodes ---------- */
    const nodeCount = await boardPage.nodeCount();
    for (let i = 0; i < Math.min(nodeCount, 5); i++) {
      await boardPage.clickNode(i);
      await page.waitForTimeout(80);
      await boardPage.clickPane(40, 40);
      await page.waitForTimeout(80);
    }

    /* ---------- 2. NODE DRAG STRESS ---------- */
    await page.evaluate(() => performance.mark('board:drag:start'));

    for (let i = 0; i < 3; i++) {
      // Drag each of the first few nodes in sequence
      for (let j = 0; j < Math.min(nodeCount, 4); j++) {
        await boardPage.dragNode(j, 60 + i * 20, 40 + i * 10, 30);
        await page.waitForTimeout(60);
      }
    }

    await page.evaluate(() => {
      performance.mark('board:drag:end');
      performance.measure('board:drag', 'board:drag:start', 'board:drag:end');
    });

    /* ---------- 3. PAN / CAMERA STRESS ---------- */
    for (let i = 0; i < 5; i++) {
      await boardPage.pan([
        [640, 400],
        [400, 250],
        [700, 500],
        [640, 400],
      ]);
      await boardPage.reset();
    }

    /* ---------- 4. RAPID SELECTION CHANGES ---------- */
    // Rapidly clicking different nodes in succession exercises the
    // context selection-change path, which was a key TBT contributor.
    await page.evaluate(() => performance.mark('board:select:start'));

    for (let i = 0; i < 15; i++) {
      await boardPage.clickNode(i % Math.min(nodeCount, 6));
      await page.waitForTimeout(50);
    }
    await boardPage.clickPane(40, 40);

    await page.evaluate(() => {
      performance.mark('board:select:end');
      performance.measure(
        'board:select',
        'board:select:start',
        'board:select:end',
      );
    });

    /* ---------- 5. COMBINED DRAG + PAN ---------- */
    for (let i = 0; i < 4; i++) {
      await boardPage.dragNode(i % Math.min(nodeCount, 4), -50 + i * 20, 40, 25);
      await boardPage.pan([
        [640, 400],
        [500, 300],
        [640, 400],
      ]);
    }

    await boardPage.reset();

    const results = await performanceCollector.stop();
    saveResults('./e2e/performance/graph-board', results);

    expect(results.fps.avg).toBeGreaterThan(25);
    expect(results.longTasks.count).toBeLessThan(30);
    expect(results.memory.growth).toBeLessThan(50_000_000);
    expect(results.inp.p98).toBeLessThan(200);
    expect(results.cls).toBeLessThan(0.1);
  });

  test.afterAll(async () => {
    await page.close();
  });
});
