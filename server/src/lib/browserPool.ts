import puppeteer, { type Browser, type Page } from 'puppeteer';

const MAX_CONCURRENT_RENDERS = 2;

let browserPromise: Promise<Browser> | null = null;
let activeRenders = 0;
const waitQueue: Array<() => void> = [];

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    // --no-sandbox/--disable-setuid-sandbox: Chromium's sandbox needs kernel
    // privileges a default Docker container doesn't grant. Safe to disable
    // here because we only ever render our own report template with data we
    // generated -- never untrusted/attacker-controlled HTML.
    browserPromise = puppeteer
      .launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }

  const browser = await browserPromise;
  if (!browser.connected) {
    browserPromise = null;
    return getBrowser();
  }
  return browser;
}

function acquireSlot(): Promise<void> {
  if (activeRenders < MAX_CONCURRENT_RENDERS) {
    activeRenders++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waitQueue.push(resolve));
}

function releaseSlot(): void {
  const next = waitQueue.shift();
  if (next) {
    next();
  } else {
    activeRenders--;
  }
}

export async function withBrowserPage<T>(render: (page: Page) => Promise<T>): Promise<T> {
  await acquireSlot();
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
      return await render(page);
    } finally {
      await page.close();
    }
  } finally {
    releaseSlot();
  }
}
