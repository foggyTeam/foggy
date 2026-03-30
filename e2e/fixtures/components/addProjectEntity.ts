import { Page } from '@playwright/test';

export default class AddProjectEntityFixture {
  private get container() {
    return this.page.getByTestId('add-project-element-modal');
  }
  get disabled() {
    const allTabs = this.container.getByRole('tab');
    return allTabs.evaluateAll((elements) => {
      if (!elements || elements.length === 0) return false;
      return elements.every(
        (el) => el.getAttribute('data-disabled') === 'true',
      );
    });
  }

  constructor(public readonly page: Page) {}

  async selectType(type: 'section' | 'simple' | 'graph' | 'doc') {
    const tab = this.container.getByTestId(`${type}-btn`);

    await tab.click();
  }
  async fillName(name: string) {
    await this.container.locator('input').fill(name);
  }
  async submit() {
    await this.container.getByTestId('create-btn').last().click();
    await this.page.waitForTimeout(1000);
  }

  async createEntity(
    name: string,
    type: 'section' | 'simple' | 'graph' | 'doc' = 'simple',
  ) {
    await this.selectType(type);
    await Promise.all([this.submit(), this.fillName(name)]);
  }
}
