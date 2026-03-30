import { Page } from '@playwright/test';
import { BASE_URL } from '../data';

/** Page-object fixture for interacting with the GraphBoard. */
export default class GraphBoardPageFixture {
  private readonly viewportWidth: number;
  private readonly viewportHeight: number;

  private get board() {
    return this.page.locator('[data-testid="graph-board"]');
  }
  private get toolbar() {
    return this.page.getByTestId('board-toolbar');
  }

  constructor(public readonly page: Page) {
    const viewport = this.page.viewportSize();
    this.viewportWidth = viewport?.width ?? 1280;
    this.viewportHeight = viewport?.height ?? 800;
  }

  async goto(
    projectId: string,
    sectionId: string,
    boardId: string,
  ): Promise<void> {
    await this.page.goto(
      `${BASE_URL}/project/${projectId}/${sectionId}/${boardId}/graph`,
    );
  }

  /** Wait until the ReactFlow graph is visible and fully initialised. */
  async waitForReady(): Promise<void> {
    await this.board.waitFor({ state: 'visible' });
    // Wait for at least one node to appear (mock data loads on first render)
    await this.page
      .locator('.react-flow__node')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  private async releaseAllButtons(): Promise<void> {
    await this.page.mouse.up({ button: 'left' }).catch(() => {});
    await this.page.mouse.up({ button: 'middle' }).catch(() => {});
  }

  /**
   * Drag a specific node by its 0-based index on the canvas.
   * @param nodeIndex  Zero-based index of `.react-flow__node` in the DOM.
   * @param dx         Horizontal displacement in pixels.
   * @param dy         Vertical displacement in pixels.
   * @param steps      Number of intermediate mouse-move events (smoother = higher).
   */
  async dragNode(
    nodeIndex: number,
    dx: number,
    dy: number,
    steps: number = 20,
  ): Promise<void> {
    const node = this.page.locator('.react-flow__node').nth(nodeIndex);
    const box = await node.boundingBox();
    if (!box) return;

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down({ button: 'left' });
    for (let i = 1; i <= steps; i++) {
      await this.page.mouse.move(
        startX + (dx * i) / steps,
        startY + (dy * i) / steps,
      );
    }
    await this.page.mouse.up({ button: 'left' });
  }

  /**
   * Pan the canvas by holding the middle mouse button (or primary button on
   * the pane area) and dragging.
   */
  async pan(points: [number, number][]): Promise<void> {
    if (!points.length) return;

    // ReactFlow uses panOnDrag={[2]} — middle-button pan
    await this.page.mouse.move(points[0][0], points[0][1]);
    await this.page.mouse.down({ button: 'middle' });

    for (const [x, y] of points.slice(1)) {
      await this.page.mouse.move(x, y);
    }

    await this.releaseAllButtons();
  }

  /** Click somewhere on the empty pane (deselects all nodes). */
  async clickPane(x: number, y: number): Promise<void> {
    await this.page.mouse.click(x, y);
  }

  /** Click a node by its 0-based index to select it. */
  async clickNode(nodeIndex: number): Promise<void> {
    const node = this.page.locator('.react-flow__node').nth(nodeIndex);
    await node.click();
  }

  async reset(): Promise<void> {
    await this.releaseAllButtons();
    await this.page.getByTestId('reset-stage-btn').click({ button: 'left' });
  }

  /** Number of nodes currently visible in the DOM. */
  async nodeCount(): Promise<number> {
    return this.page.locator('.react-flow__node').count();
  }
}
