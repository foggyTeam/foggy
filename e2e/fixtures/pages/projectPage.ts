import type { Locator, Page } from '@playwright/test';
import { BASE_URL } from '../data';
import { ContentSectionFixture } from '../components/contentSection';
import ProjectSettingsFixture from '../components/projectSettings';
import AddProjectEntityFixture from '../components/addProjectEntity';

export default class ProjectPageFixture {
  private readonly membersSection: ContentSectionFixture;

  constructor(public readonly page: Page) {
    this.membersSection = new ContentSectionFixture(
      page,
      'all-project-members',
    );
  }

  private get projectSettingsButton() {
    return this.page.getByTestId('settings-btn');
  }
  private get addRootSectionButton() {
    return this.page.getByTestId('add-root-section-btn');
  }
  get projectSections() {
    return this.page.getByTestId('section-card');
  }
  get projectBoardCards() {
    return this.page.getByTestId('board-card');
  }

  async goto(projectId: string) {
    await this.page.goto(`${BASE_URL}/project/${projectId}`);
  }

  async changeProjectSettings(
    name?: string,
    description?: string,
    allowRequests?: boolean,
    isPublic?: boolean,
    membersPublic?: boolean,
  ) {
    await this.projectSettingsButton.click();
    const modal = new ProjectSettingsFixture(this.page);

    await modal.fillForm(
      name,
      description,
      allowRequests,
      isPublic,
      membersPublic,
    );

    await modal.close();
  }

  async deleteProject(force: boolean = false) {
    await this.projectSettingsButton.click();
    const modal = new ProjectSettingsFixture(this.page);
    await modal.deleteProject(force);
  }

  private async findProjectElement(path: string[]): Promise<Locator> {
    let currentContainer: Locator = this.page;
    const lastIndex = path.length - 1;

    for (let step = 0; step < path.length; step++) {
      const name = path[step];
      const allSections = currentContainer.getByTestId('section-card');
      const allBoards = currentContainer.getByTestId('board-card');
      const sectionsCount = await allSections.count();
      const boardsCount = await allBoards.count();
      let found = false;

      for (let i = 0; i < sectionsCount; i++) {
        const section = allSections.nth(i);
        const nameInput = section.locator('input[readonly]').first();
        let inputValue = '';
        if (await nameInput.isVisible()) {
          inputValue = await nameInput.inputValue();
        }
        if (inputValue === name) {
          const isExpanded = await section.getAttribute('aria-expanded');
          if (step < lastIndex && isExpanded === 'false') {
            const expandBtn = section.getByTestId('expand-btn');
            if (await expandBtn.isVisible()) await expandBtn.click();
          }
          currentContainer = section;
          found = true;
          break;
        }
      }
      if (step === lastIndex) {
        for (let i = 0; i < boardsCount; i++) {
          const board = allBoards.nth(i);
          const nameInput = board.locator('input[readonly]').first();
          let inputValue = '';
          if (await nameInput.isVisible()) {
            inputValue = await nameInput.inputValue();
          }
          if (inputValue === name) {
            currentContainer = board;
            found = true;
            break;
          }
        }
      }
      if (!found) throw new Error(`Failed to find "${name}"`);
    }

    return currentContainer;
  }

  async addSection(name: string, parentList: string[]) {
    if (!parentList.length) {
      await this.addRootSectionButton.click();
      await this.page.waitForTimeout(500);
    } else {
      const parent = await this.findProjectElement(parentList);
      await parent.hover();
      await parent.getByTestId('add-child-btn').click();
    }
    const modal = new AddProjectEntityFixture(this.page);
    await modal.createEntity(name, 'section');
  }
  async addBoard(
    name: string,
    parentList: string[],
    type: 'simple' | 'graph' | 'tree' = 'simple',
  ) {
    const parent = await this.findProjectElement(parentList);
    await parent.hover();
    await parent.getByTestId('add-child-btn').click();

    const modal = new AddProjectEntityFixture(this.page);
    await modal.createEntity(name, type);
  }

  async openBoard(name: string, path: string[]) {
    const boardCard = await this.findProjectElement([...path, name]);

    try {
      await Promise.all([
        this.page.waitForURL('**/project/*/*/*'),
        await boardCard.first().dblclick(),
      ]);
      return true;
    } catch (e: any) {
      console.error('Failed to open board');
      return false;
    }
  }

  async openBoardWithCreatePath(
    name: string,
    path: string[],
    type: 'simple' | 'graph' | 'tree' = 'simple',
  ) {
    try {
      await this.findProjectElement([...path, name]);
    } catch (e: any) {
      for (let i = 0; i < path.length; i++) {
        await this.addSection(path[i], path.slice(path.length - i));
      }
      await this.addBoard(name, path, type);
    }
    return await this.openBoard(name, path);
  }
}
