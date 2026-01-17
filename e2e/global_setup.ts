import { chromium } from '@playwright/test';
import { USER, PROJECT, SIMPLE_BOARD } from './fixtures/data.ts';

const CONTEXT_STORAGE_PATH = './e2e/.auth_state.json'

function log(text: string, step: boolean = true, error: boolean = false) {
  console.log(`${step ? '-----------' : ''}${error? '[ERROR] ' : ''}${text}${step ?  '-----------' : ''}`)
}

export default async function globalSetup(config) {
  const browser = await chromium.launch({headless: false});
  const page = await browser.newPage();

  log('START SETUP')

  await page.goto('http://localhost:3000/login');

  await page.fill('input[type="email"]', USER.email);
  await page.fill('input[type="password"]', USER.password);

  const logged = await authorize(page)
  if (!logged) throw new Error('Failed to authorize in app.')

  await checkEntities(page)

  log('SETUP FINISHED')

  await browser.close()
}

async function authorize(page: any) {
  let loggedIn = false;
  try {
    await page.getByTestId('login-btn').click()
    await page.waitForNavigation({ url: 'http://localhost:3000/', timeout: 8000 })

    loggedIn = true;
    log('Login success');
  } catch (e) {
    log('Login failed, will try to sign up');
    log( e.message, false)
  }

  if (!loggedIn) {
    await page.getByTestId('signin-btn').click()
    await page.waitForNavigation({ url: 'http://localhost:3000/', timeout: 8000 })

    loggedIn = true;
    log('Sign up success');
  }

  await page.context().storageState({ path: CONTEXT_STORAGE_PATH });
  return loggedIn
}

async function checkEntities(page: any) {
  const needToCreate = {
    project: true,
    team: true,
    section: true,
    board: true
  }

  log('Check project')
  {
    const projectCards = page.locator('[data-testid="project-card"]');
    const matchingProject = projectCards.filter({ hasText: PROJECT.name });

    console.log(matchingProject)
  }


  log('Check team')
}