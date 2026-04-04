import type { Locator, Page } from '@playwright/test';
import { BASE_URL } from '../data';
import { ContentSectionFixture } from '../components/contentSection';
import ProjectSettingsFixture from '../components/projectSettings';
import AddProjectEntityFixture from '../components/addProjectEntity';
import AreYouSureFixture from '../components/areYouSure';

export default class ProjectPageFixture {
  private readonly membersSection: ContentSectionFixture;

  constructor(public readonly page: Page) {
    this.membersSection = new ContentSectionFixture(
      page,
      'all-project-members',
    );
  }

  private get projectSettingsButton() {
    return this.page
      .getByTestId('settings-btn')
      .filter({ has: this.page.locator(':visible') });
  }
  private get addRootSectionButton() {
    return this.page
      .getByTestId('add-root-section-btn')
      .filter({ has: this.page.locator(':visible') });
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
    type: 'simple' | 'graph' | 'doc' = 'simple',
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
        this.page.waitForURL('**/project/*/*/*', { timeout: 10000 }),
        await boardCard.first().dblclick(),
      ]);
      return true;
    } catch (e: any) {
      console.error('Failed to open board');
      return false;
    }
  }

  async checkPathExists(
    path: string[],
    type: 'section' | 'simple' | 'graph' | 'doc' = 'simple',
    create: boolean = true,
  ) {
    try {
      await this.findProjectElement(path);
      return true;
    } catch (e: any) {
      if (!create) return false;
      console.warn('Element not found, creating');
    }
    try {
      for (let i = 0; i < path.length; i++) {
        let exists;
        try {
          await this.findProjectElement([
            ...path.slice(path.length - i),
            path[i],
          ]);
          exists = true;
        } catch (e: any) {
          exists = false;
        }
        if (!exists) {
          if (i == path.length - 1 && type !== 'section')
            await this.addBoard(path[i], path.slice(path.length - i), type);
          else await this.addSection(path[i], path.slice(path.length - i));
        }
      }

      return true;
    } catch (e: any) {
      console.error('Failed to create board');
    }
    return false;
  }

  async deleteElement(path: string[]) {
    let elementCard: Locator;
    try {
      elementCard = await this.findProjectElement(path);
    } catch (e: any) {
      return true;
    }
    await elementCard.hover();
    await elementCard.getByTestId('delete-btn').click();
    const modal = new AreYouSureFixture(this.page);
    await modal.submit();
    return true;
  }
}
