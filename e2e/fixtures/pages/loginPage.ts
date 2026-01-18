import type { Locator, Page } from '@playwright/test';
import { BASE_URL } from '../data';

export default class LoginPageFixture {
  private readonly loginInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly signinButton: Locator;
  private readonly googleButton: Locator;
  private readonly yandexButton: Locator;

  public isAuthorized: boolean;
  constructor(public readonly page: Page) {
    this.loginInput = this.page.locator('input[type="email"]');
    this.passwordInput = this.page.locator('input[type="password"]');

    this.loginButton = page.getByTestId('login-btn');
    this.signinButton = page.getByTestId('signin-btn');
    this.googleButton = page.getByTestId('google-btn');
    this.yandexButton = page.getByTestId('yandex-btn');

    this.isAuthorized = false;
  }

  async goto() {
    await this.page.goto(`${BASE_URL}/login`);
  }

  async fillForm(email: string, password: string) {
    await this.loginInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async login() {
    try {
      await this.loginButton.click();
      await this.page.waitForURL(`${BASE_URL}/`);
    } catch (e: any) {
      console.error('Failed to login', e);
      return false;
    }

    this.isAuthorized = true;
    return true;
  }

  async signIn() {
    try {
      await this.signinButton.click();
      await this.page.waitForURL(`${BASE_URL}/`);
    } catch (e: any) {
      console.error('Failed to sign in', e);
      return false;
    }

    this.isAuthorized = true;
    return true;
  }

  async clickGoogle() {
    await this.googleButton.click();
  }
  async clickYandex() {
    await this.yandexButton.click();
  }

  async authorize(email: string, password: string) {
    if (this.isAuthorized) console.warn("You've already been authorized");

    await this.fillForm(email, password);
    let success = await this.login();
    if (!success) success = await this.signIn();
    if (!success)
      console.error(
        `Failed to authorize: [email: ${email}], [password: ${password}]`,
      );
    return success;
  }
}
