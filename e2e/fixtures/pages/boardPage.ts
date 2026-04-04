import { Page } from '@playwright/test';
import { BASE_URL } from '../data';

type AvailableTools =
  | 'delete'
  | 'ellipse'
  | 'eraser'
  | 'pencil'
  | 'rect'
  | 'text'
  | 'fill'
  | 'layer'
  | 'size'
  | 'stroke'
  | 'color'
  | 'line-cap'
  | 'slider';
export default class BoardPageFixture {
  private readonly viewportWidth: number;
  private readonly viewportHeight: number;
  private readonly paddings = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  private get stage() {
    return this.page.locator('.konvajs-content');
  }
  private get toolbar() {
    return this.page.getByTestId('board-toolbar');
  }
  private async isStagePoint(x, y) {
    return (
      this.paddings.left < x &&
      x < this.viewportWidth - this.paddings.right &&
      this.paddings.top < y &&
      y < this.viewportHeight - this.paddings.bottom
    );
  }

  private async safeMouseInteract(
    x: number,
    y: number,
    type: 'move' | 'click' | 'down' | 'up' = 'move',
    button: 'left' | 'right' | 'middle' = 'left',
  ) {
    if (!(await this.isStagePoint(x, y)) && !(type === 'up')) {
      console.warn(`Mouse is not over stage [${x}, ${y}]. Mouse up.`);
      await this.releaseAllButtons();
      return;
    }

    try {
      switch (type) {
        case 'move':
          await this.page.mouse.move(x, y);
          break;
        case 'click':
          await this.stage.click({ position: { x, y }, button });
          break;
        case 'down':
          await this.page.mouse.move(x, y);
          await this.page.mouse.down({ button });
          break;
        case 'up':
          await this.releaseAllButtons();
          break;
      }
    } catch (e: any) {
      console.error(
        `Mouse action (${type}) failed at [${x}, ${y}]:`,
        e.message,
      );
      await this.releaseAllButtons();
    }
  }

  private async releaseAllButtons() {
    await this.page.mouse.up({ button: 'left' }).catch(() => {});
    await this.page.mouse.up({ button: 'right' }).catch(() => {});
    await this.page.mouse.up({ button: 'middle' }).catch(() => {});
  }

  constructor(public readonly page: Page) {
    const viewport = this.page.viewportSize();
    this.viewportWidth = viewport?.width ?? 800;
    this.viewportHeight = viewport?.height ?? 600;
  }

  async goto(projectId: string, sectionId: string, boardId: string, boardType: 'graph' | 'doc' | 'simple') {
    await this.page.goto(
      `${BASE_URL}/project/${projectId}/${sectionId}/${boardId}/${boardType}`,
    );
  }

  async toggleTool(toolName: AvailableTools) {
    await this.toolbar.getByTestId(`${toolName}-tool-btn`).click();
  }

  async drawLine(points: number[][]) {
    if (!points.length) return;

    await this.safeMouseInteract(points[0][0], points[0][1], 'down');

    for (const point of points.slice(1)) {
      await this.safeMouseInteract(...point);
    }

    await this.releaseAllButtons();
  }

  async placeText(text: string, position: { x: number; y: number }) {
    await this.toggleTool('text');

    await this.safeMouseInteract(position.x, position.y, 'click');

    const textEditor = this.page.locator('.ql-editor');

    await textEditor.fill(text);

    await this.safeMouseInteract(position.x - 100, position.y, 'click');
    await this.releaseAllButtons();
  }

  async zoom(times: number = 1, zoomIn: boolean = true) {
    for (let i = 0; i < times; i++) {
      await this.stage.dispatchEvent('wheel', { deltaY: zoomIn ? -100 : 100 });
    }
  }
  async dragBoard(points: number[][]) {
    if (!points.length) return;

    await this.safeMouseInteract(points[0][0], points[0][1], 'down', 'right');

    for (const point of points.slice(1)) await this.safeMouseInteract(...point);

    await this.releaseAllButtons();
  }

  async reset() {
    await this.releaseAllButtons();
    await this.page.getByTestId('reset-stage-btn').click({ button: 'left' });
  }
}
