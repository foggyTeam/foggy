import type { Page, Locator } from '@playwright/test';

export class ContentSectionFixture {
  private readonly head: Locator;
  private readonly content: Locator;

  private readonly searchInput: Locator;

  private readonly settingsButton: Locator;
  private readonly filterButton: Locator;
  private readonly favoriteButton: Locator;
  private readonly notificationButton: Locator;

  private readonly addNewButton: Locator;
  private readonly addMemberButton: Locator;

  constructor(
    public readonly page: Page,
    testId: string,
  ) {
    const section = page.getByTestId(testId);

    this.head = section.getByTestId('content-section-head');
    this.content = section.getByTestId('content-section-content');

    this.searchInput = this.head.locator('input[type="text"]');
    this.addNewButton = this.head.getByTestId('add-new-btn');
    this.addMemberButton = this.head.getByTestId('add-member-btn');
    this.settingsButton = this.head.getByTestId('settings-btn');
    this.filterButton = this.head.getByTestId('filters-btn');
    this.favoriteButton = this.head.getByTestId('favorite-btn');
    this.notificationButton = this.head.getByTestId('with-notification-btn');
  }

  async search(value: string) {
    await this.searchInput.fill(value);
  }

  async openFilters() {
    if (!(await this.filterButton.isVisible())) {
      throw new Error('No filter button in this section');
    }
    await this.filterButton.click();
  }

  async addNew() {
    if (!(await this.addNewButton.isVisible())) {
      throw new Error('No add new button in this section');
    }
    await this.addNewButton.click();
  }

  async addMember() {
    if (!(await this.addMemberButton.isVisible())) {
      throw new Error('No add member button in this section');
    }
    await this.addMemberButton.click();
  }

  async openSettings() {
    if (!(await this.settingsButton.isVisible())) {
      throw new Error('No settings button in this section');
    }
    await this.settingsButton.click();
  }

  async toggleFavorite() {
    if (!(await this.favoriteButton.isVisible())) {
      throw new Error('No favorite button in this section');
    }
    await this.favoriteButton.click();
  }

  async toggleNotification() {
    if (!(await this.notificationButton.isVisible())) {
      throw new Error('No notification button in this section');
    }
    await this.notificationButton.click();
  }

  async isEmpty() {
    return await this.content.locator('.emptyState').isVisible();
  }

  async getDataCards(cardTestId: string) {
    return this.content.getByTestId(cardTestId);
  }
}
