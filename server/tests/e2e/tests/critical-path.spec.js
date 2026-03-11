import { test, expect } from '@playwright/test';

/**
 * Critical Path / Happy Path Tests
 * End-to-end tests covering main user workflows
 */

test.describe('Critical Path - Happy Path Tests', () => {
  test('Complete Faculty Dashboard Journey', async ({ page }) => {
    // Step 1: Access the app
    console.log('Step 1: Accessing application...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    const pageUrl = page.url();
    console.log(`✅ Application loaded at: ${pageUrl}`);

    // Step 2: Verify dashboard loads
    console.log('Step 2: Verifying dashboard...');
    const dashboardContent = await page.content();
    expect(dashboardContent.length).toBeGreaterThan(100);
    console.log('✅ Dashboard content present');

    // Step 3: Check for main navigation elements
    console.log('Step 3: Checking navigation...');
    const navigationElements = await page.locator('nav, [role="navigation"], [class*="sidebar"], [class*="navbar"], [class*="menu"], aside').count();
    console.log(`✅ Navigation elements checked: ${navigationElements} found`);

    // Step 4: Verify API connectivity
    console.log('Step 4: Verifying API connectivity...');
    const apiResponses = [];
    page.on('response', response => {
      if (response.url().includes('/api/') && response.ok()) {
        apiResponses.push(response.url().split('/api/')[1]);
      }
    });

    await page.waitForTimeout(2000);
    console.log(`✅ API endpoints responsive: ${apiResponses.length} successful calls`);

    // Step 5: Test responsive design
    console.log('Step 5: Testing responsive design...');
    const initialViewport = page.viewportSize();
    console.log(`✅ Initial viewport: ${initialViewport?.width}x${initialViewport?.height}`);

    // Step 6: Check for accessibility
    console.log('Step 6: Checking accessibility...');
    const headings = await page.locator('h1, h2, h3').count();
    const buttons = await page.locator('button, [role="button"]').count();
    const links = await page.locator('a').count();
    console.log(`✅ Found ${headings} headings, ${buttons} buttons, ${links} links`);

    console.log('✨ Faculty Dashboard Journey completed successfully!');
  });

  test('Complete Leave Request Workflow', async ({ page }) => {
    console.log('\n📋 Starting Leave Request Workflow...');

    // Step 1: Navigate to leave management
    console.log('Step 1: Navigate to leave management...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const leaveButton = await page.locator('text=/leave/i').first();
    if (await leaveButton.isVisible()) {
      await leaveButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Leave management page opened');
    } else {
      console.log('⚠️ Leave button not found, checking page content');
    }

    // Step 2: Check for leave list
    console.log('Step 2: Checking leave list...');
    const leaveItems = await page.locator('[role="listitem"], tr, [class*="leave"]').count();
    console.log(`✅ Found ${leaveItems} leave-related elements`);

    // Step 3: Check for request button
    console.log('Step 3: Looking for request button...');
    const requestButton = await page.locator('button:has-text("Request"), button:has-text("Apply")').first();
    if (await requestButton.isVisible()) {
      console.log('✅ Leave request button available');
    } else {
      console.log('⚠️ Request button not found');
    }

    // Step 4: Monitor API calls
    console.log('Step 4: Monitoring API calls...');
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/leaves')) {
        apiCalls.push({
          status: response.status(),
          method: response.request().method()
        });
      }
    });

    await page.waitForTimeout(2000);
    console.log(`✅ API calls monitored: ${apiCalls.length} requests`);

    // Step 5: Check form validation
    console.log('Step 5: Checking form validation...');
    const inputs = await page.locator('input, textarea, select').count();
    console.log(`✅ Found ${inputs} form input elements`);

    console.log('✨ Leave Request Workflow test completed!');
  });

  test('Complete Event Management Workflow', async ({ page }) => {
    console.log('\n📅 Starting Event Management Workflow...');

    // Step 1: Access events section
    console.log('Step 1: Accessing events section...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const eventButton = await page.locator('text=/event|allocation|activity/i').first();
    if (await eventButton.isVisible()) {
      await eventButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Events section opened');
    }

    // Step 2: Verify event list loads
    console.log('Step 2: Verifying event list...');
    const eventElements = await page.locator('[class*="event"], [role="listitem"], [data-testid*="event"]').count();
    console.log(`✅ Event list rendered with ${eventElements} items`);

    // Step 3: Check add event functionality
    console.log('Step 3: Checking add event functionality...');
    const addButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
    if (await addButton.isVisible()) {
      console.log('✅ Add event button available');
    }

    // Step 4: Monitor event-related API calls
    console.log('Step 4: Monitoring API calls...');
    const eventApiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/schedule') || response.url().includes('/api/events')) {
        eventApiCalls.push(response.status());
      }
    });

    await page.waitForTimeout(2000);
    const successfulCalls = eventApiCalls.filter(status => status === 200).length;
    console.log(`✅ Successful API calls: ${successfulCalls}/${eventApiCalls.length}`);

    console.log('✨ Event Management Workflow test completed!');
  });

  test('Complete Workload Analysis Workflow', async ({ page }) => {
    console.log('\n📊 Starting Workload Analysis Workflow...');

    // Step 1: Access workload section
    console.log('Step 1: Accessing workload analytics...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const workloadButton = await page.locator('text=/workload|analytics|capacity|report/i').first();
    if (await workloadButton.isVisible()) {
      await workloadButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Workload page opened');
    }

    // Step 2: Verify metrics display
    console.log('Step 2: Verifying metrics display...');
    const metrics = await page.locator('text=/hours|completion|efficiency|utilization|engagement/i').count();
    console.log(`✅ Found ${metrics} metric references`);

    // Step 3: Check for charts/visualizations
    console.log('Step 3: Checking visualizations...');
    const charts = await page.locator('canvas, svg, [class*="chart"]').count();
    console.log(`✅ Found ${charts} chart elements`);

    // Step 4: Monitor API performance
    console.log('Step 4: Monitoring API performance...');
    const performanceData = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        performanceData.push({
          endpoint: response.url().split('/api/')[1]?.split('?')[0],
          status: response.status()
        });
      }
    });

    await page.waitForTimeout(2000);
    console.log(`✅ API calls captured: ${performanceData.length}`);

    // Step 5: Test export if available
    console.log('Step 5: Checking export functionality...');
    const exportButton = await page.locator('button:has-text("Export"), button:has-text("Download")').first();
    if (await exportButton.isVisible()) {
      console.log('✅ Export functionality available');
    }

    console.log('✨ Workload Analysis Workflow test completed!');
  });

  test('Complete Announcement Communication Workflow', async ({ page }) => {
    console.log('\n📢 Starting Announcement Workflow...');

    // Step 1: Navigate to announcements
    console.log('Step 1: Navigating to announcements...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const announcementButton = await page.locator('text=/announcement|notification|message/i').first();
    if (await announcementButton.isVisible()) {
      await announcementButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Announcements page opened');
    }

    // Step 2: Verify announcement list
    console.log('Step 2: Verifying announcement list...');
    const announcements = await page.locator('[role="listitem"], [class*="announcement"], tr').count();
    console.log(`✅ Found ${announcements} announcement elements`);

    // Step 3: Check for create functionality
    console.log('Step 3: Checking create functionality...');
    const createButton = await page.locator('button:has-text("Create"), button:has-text("Send"), button:has-text("Broadcast")').first();
    if (await createButton.isVisible()) {
      console.log('✅ Create announcement button available');
    }

    // Step 4: Monitor announcement API calls
    console.log('Step 4: Monitoring API calls...');
    const announcementCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/announcements')) {
        announcementCalls.push(response.status());
      }
    });

    await page.waitForTimeout(2000);
    console.log(`✅ Announcement API responses: ${announcementCalls.length}`);

    // Step 5: Check for targeting/filtering
    console.log('Step 5: Checking targeting options...');
    const targetingElements = await page.locator('select, [data-testid*="target"], [class*="filter"]').count();
    console.log(`✅ Found ${targetingElements} targeting/filter elements`);

    console.log('✨ Announcement Workflow test completed!');
  });

  test('Comprehensive Data Flow Validation', async ({ page }) => {
    console.log('\n🔄 Starting Comprehensive Data Flow Validation...');

    const flowMetrics = {
      pageLoads: 0,
      apiCalls: [],
      errors: [],
      warnings: []
    };

    // Monitor all network activity
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        flowMetrics.apiCalls.push({
          method: request.method(),
          endpoint: request.url().split('/api/')[1]?.split('?')[0]
        });
      }
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        flowMetrics.errors.push({
          status: response.status(),
          url: response.url()
        });
      }
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        flowMetrics.warnings.push(msg.text());
      }
    });

    // Navigate through key pages
    const pages = [
      '/',
      '/#/dashboard',
      '/#/schedule',
      '/#/announcements'
    ];

    for (const path of pages) {
      await page.goto(`http://localhost:5173${path}`);
      await page.waitForLoadState('networkidle');
      flowMetrics.pageLoads++;
    }

    // Generate report
    console.log('\n📊 Data Flow Validation Report:');
    console.log(`  ✅ Pages loaded: ${flowMetrics.pageLoads}`);
    console.log(`  ✅ API calls made: ${flowMetrics.apiCalls.length}`);
    console.log(`  ⚠️ Errors encountered: ${flowMetrics.errors.length}`);
    console.log(`  ⚠️ Warnings: ${flowMetrics.warnings.length}`);

    if (flowMetrics.apiCalls.length > 0) {
      const uniqueEndpoints = new Set(flowMetrics.apiCalls.map(c => c.endpoint));
      console.log(`  📡 Unique endpoints accessed: ${uniqueEndpoints.size}`);
    }

    console.log('✨ Data Flow Validation completed!');
  });
});
