import { Page } from '@playwright/test';

export default class AreYouSureFixture {
  private get dismissButton() {
    return this.page.getByTestId('dismiss-btn');
  }
  private get sureButton() {
    return this.page.getByTestId('sure-btn');
  }
  constructor(public readonly page: Page) {}

  async dismiss() {
    await this.dismissButton.click();
  }

  async submit() {
    await this.sureButton.click();
    await this.page.waitForTimeout(250);
  }
}
