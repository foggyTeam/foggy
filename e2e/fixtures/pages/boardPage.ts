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
  private get toolbar() {
    return this.page.getByTestId('board-toolbar');
  }
  constructor(public readonly page: Page) {}

  async goto(projectId: string, sectionId: string, boardId: string) {
    await this.page.goto(
      `${BASE_URL}/project/${projectId}/${sectionId}/${boardId}`,
    );
  }

  async toggleTool(toolName: AvailableTools) {
    await this.toolbar.getByTestId(`${toolName}-tool-btn`).click();
  }
}
