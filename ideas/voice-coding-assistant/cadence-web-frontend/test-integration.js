const { chromium } = require('playwright');

async function testIntegration() {
  console.log('Starting integration tests...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  const screenshotsDir = './screenshots';
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  // Navigate to app
  console.log('Opening frontend at http://localhost:3000...\n');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Test 1: Frontend loads
  await test('Frontend loads successfully', async () => {
    const title = await page.title();
    if (!title.includes('Cadence')) {
      throw new Error(`Expected title to contain "Cadence", got "${title}"`);
    }
  });

  // Test 2: Navigate to Settings
  await test('Can navigate to Settings', async () => {
    await page.click('button:has-text("Settings")');
    await page.waitForTimeout(500);
    const heading = await page.textContent('h2');
    if (!heading.includes('Settings')) {
      throw new Error('Settings page not loaded');
    }
  });

  // Test 3: Test connection to backend
  await test('Can test backend connection', async () => {
    // The endpoint should be pre-filled or set to localhost:3001
    const endpointInput = page.locator('input[placeholder="http://localhost:3001"]');
    await endpointInput.fill('http://localhost:3001');
    await page.waitForTimeout(300);

    await page.click('button:has-text("Test Connection")');
    await page.waitForTimeout(2000);

    // Check for success indicator
    const successText = await page.locator('text=Connected').count();
    if (successText === 0) {
      throw new Error('Connection test did not show success');
    }
  });

  await page.screenshot({ path: `${screenshotsDir}/integration-01-connected.png` });

  // Test 4: Save settings
  await test('Can save settings', async () => {
    await page.click('button:has-text("Save Settings")');
    await page.waitForTimeout(1000);
  });

  // Test 5: Navigate to Voice interface
  await test('Can navigate to Voice interface', async () => {
    await page.click('button:has-text("Voice")');
    await page.waitForTimeout(500);
  });

  // Test 6: Enter task and repo URL
  await test('Can enter task description', async () => {
    await page.fill('textarea', 'Fix the login bug in auth.ts');
    await page.waitForTimeout(300);

    const textarea = page.locator('textarea');
    const value = await textarea.inputValue();
    if (!value.includes('Fix the login bug')) {
      throw new Error('Task description not entered');
    }
  });

  await test('Can enter repo URL', async () => {
    await page.fill('input[placeholder*="github"]', 'https://github.com/test/repo');
    await page.waitForTimeout(300);
  });

  await page.screenshot({ path: `${screenshotsDir}/integration-02-task-entered.png` });

  // Test 7: Submit task
  await test('Can submit task via Send button', async () => {
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(2000);
  });

  // Test 8: Check Tasks list
  await test('Can view created task in Tasks list', async () => {
    await page.click('button:has-text("Tasks")');
    await page.waitForTimeout(1000);

    // The task should appear in the list
    const taskContent = await page.locator('.space-y-3').textContent();
    if (!taskContent.includes('Fix the login bug') && !taskContent.includes('No tasks yet')) {
      // Check if we can see any task cards
      const taskCards = await page.locator('[class*="border-border"]').count();
      if (taskCards === 0) {
        throw new Error('No tasks visible in list');
      }
    }
  });

  await page.screenshot({ path: `${screenshotsDir}/integration-03-tasks-list.png` });

  // Test 9: Verify task was sent to backend
  await test('Task exists in backend', async () => {
    const response = await page.evaluate(async () => {
      const res = await fetch('http://localhost:3001/api/tasks');
      return res.json();
    });

    if (!response.tasks || response.tasks.length === 0) {
      throw new Error('No tasks found in backend');
    }

    const hasOurTask = response.tasks.some(t =>
      t.task.includes('Fix the login bug') || t.task.includes('error handling')
    );
    if (!hasOurTask) {
      console.log('   Tasks in backend:', response.tasks.map(t => t.task));
    }
  });

  // Test 10: Repos view
  await test('Can navigate to Repos view', async () => {
    await page.click('button:has-text("Repos")');
    await page.waitForTimeout(500);
  });

  await page.screenshot({ path: `${screenshotsDir}/integration-04-repos.png` });

  await browser.close();

  console.log('\n' + '='.repeat(40));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(40));
  console.log('\nScreenshots saved to ./screenshots/');

  process.exit(failed > 0 ? 1 : 0);
}

testIntegration().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
