import type { Page } from '@playwright/test';
import { BASE_URL } from '../data';
import { ContentSectionFixture } from '../components/contentSection';
import ProjectSettingsFixture from '../components/projectSettings';

export default class MainPageFixture {
  private readonly allProjectsSection: ContentSectionFixture;
  private readonly allTeamsSection: ContentSectionFixture;

  constructor(public readonly page: Page) {
    this.allProjectsSection = new ContentSectionFixture(page, 'all-projects');
    this.allTeamsSection = new ContentSectionFixture(page, 'all-teams');
  }

  async goto() {
    await this.page.goto(`${BASE_URL}/`);
  }

  async getAllProjects() {
    return await this.allProjectsSection.getDataCards('project-card');
  }
  async openProject(name: string, createIfNotExist: boolean = false) {
    const allProjects = await this.getAllProjects();
    try {
      await allProjects.getByRole('link', { name }).click();
      await this.page.waitForURL('**/project/*');
      return true;
    } catch (e: any) {
      console.error(`Failed to open project ${name}`);
    }
    if (createIfNotExist) {
      const result = await this.addProject(name);
      return !!result;
    }
    return false;
  }
  async addProject(name: string, description?: string) {
    await this.allProjectsSection.addNew();
    const modal = new ProjectSettingsFixture(this.page, true);
    await modal.fillForm(name, description);
    return await modal.save();
  }

  async getAllTeams() {
    return await this.allTeamsSection.getDataCards('team-card');
  }
}
