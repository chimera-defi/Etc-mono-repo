const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  const screenshotsDir = './screenshots';

  console.log('Starting screenshot capture...');

  // 1. Voice Interface (default view)
  console.log('1. Capturing Voice Interface...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotsDir}/01-voice-interface.png`, fullPage: false });

  // 2. Tasks View (empty state)
  console.log('2. Capturing Tasks View (empty)...');
  await page.click('button:has-text("Tasks")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${screenshotsDir}/02-tasks-empty.png`, fullPage: false });

  // 3. Repos View
  console.log('3. Capturing Repos View...');
  await page.click('button:has-text("Repos")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${screenshotsDir}/03-repos-view.png`, fullPage: false });

  // 4. Scroll down to see webhook info
  console.log('4. Capturing Repos View (webhook section)...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotsDir}/04-repos-webhook.png`, fullPage: false });

  // 5. Settings View
  console.log('5. Capturing Settings View...');
  await page.click('button:has-text("Settings")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${screenshotsDir}/05-settings-top.png`, fullPage: false });

  // 6. Settings View - scroll to see more
  console.log('6. Capturing Settings View (preferences)...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotsDir}/06-settings-bottom.png`, fullPage: false });

  // 7. Test connection button interaction
  console.log('7. Testing connection...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.click('button:has-text("Test Connection")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotsDir}/07-settings-connection-test.png`, fullPage: false });

  // 8. Voice Interface - type a task
  console.log('8. Capturing Voice Interface with text...');
  await page.click('button:has-text("Voice")');
  await page.waitForTimeout(500);
  await page.fill('textarea', 'Add error handling to the fetchData function in src/api.ts');
  await page.fill('input[placeholder*="github"]', 'https://github.com/example/my-project');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotsDir}/08-voice-with-task.png`, fullPage: false });

  // 9. Mobile view - Voice
  console.log('9. Capturing Mobile Voice View...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotsDir}/09-mobile-voice.png`, fullPage: false });

  // 10. Mobile view - Tasks
  console.log('10. Capturing Mobile Tasks View...');
  await page.click('button:has-text("Tasks")');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotsDir}/10-mobile-tasks.png`, fullPage: false });

  await browser.close();
  console.log('\nScreenshots saved to ./screenshots/');
}

captureScreenshots().catch(console.error);
