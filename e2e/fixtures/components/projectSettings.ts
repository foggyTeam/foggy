import { Locator, Page } from '@playwright/test';

export default class ProjectSettingsFixture {
  private readonly modal: Locator;

  private readonly imageInput: Locator;
  private readonly nameInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly settingsCheckboxes: {
    allowRequests: Locator;
    isPublic: Locator;
    membersPublic: Locator;
  };

  private readonly deleteButton: Locator;
  private readonly saveButton: Locator;

  public readonly isNew: boolean;

  constructor(
    public readonly page: Page,
    isNew: boolean = false,
  ) {
    this.modal = page.getByTestId('project-settings-modal');

    this.imageInput = this.modal.getByTestId('upload-avatar-btn');
    this.nameInput = this.modal.locator('input[name=name]');
    this.descriptionInput = this.modal.locator('textarea[name=description]');
    this.settingsCheckboxes = {
      allowRequests: this.modal.getByTestId('allow-requests-chb'),
      isPublic: this.modal.getByTestId('public-chb'),
      membersPublic: this.modal.getByTestId('members-public-chb'),
    };
    this.deleteButton = this.modal.getByTestId('delete-btn');
    this.saveButton = this.modal.getByTestId('save-btn');

    this.isNew = isNew;
  }

  async fillForm(
    name?: string,
    description?: string,
    allowRequests?: boolean,
    isPublic?: boolean,
    membersPublic?: boolean,
  ) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (description !== undefined)
      await this.descriptionInput.fill(description);
    if (allowRequests !== undefined)
      await this.settingsCheckboxes.allowRequests.setChecked(allowRequests);
    if (isPublic !== undefined)
      await this.settingsCheckboxes.isPublic.setChecked(isPublic);
    if (membersPublic !== undefined)
      await this.settingsCheckboxes.membersPublic.setChecked(membersPublic);
  }

  async deleteProject(force: boolean = false) {
    await this.deleteButton.click();
    if (force) {
      // TODO: click in are you sure dialog
    }
  }

  async save() {
    await this.saveButton.click();
    if (this.isNew) {
      try {
        await this.page.waitForURL('**/project/*');
        return this.page.url().split('/').pop();
      } catch (e: any) {
        console.error('Missed navigation to a new project');
      }
    }
    return null;
  }

  async close() {
    await this.modal.locator('..').click();
  }
}
