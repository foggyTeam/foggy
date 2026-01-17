import type { Locator, Page } from '@playwright/test';
import { BASE_URL } from '../data';
import { ContentSectionFixture } from '../components/contentSection';

export default class MainPageFixture {
  private readonly searchProjectInput: Locator;
  private readonly projectSectionButtons: {
    filters: Locator;
    favorite: Locator;
    withNotification: Locator;
  };
  private readonly allProjectCards: Locator;

  constructor(public readonly page: Page) {}
}
