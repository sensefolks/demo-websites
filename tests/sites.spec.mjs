import { test, expect } from '@playwright/test';

const sites = [
  { name: 'OrbitDesk', port: 4171, routes: ['/', '/pricing/', '/workspace/', '/help/', '/account/'] },
  { name: 'Moss & Mug', port: 4172, routes: ['/', '/products/starter-kit/', '/cart/', '/checkout/', '/order/'] },
  { name: 'Fieldnotes', port: 4173, routes: ['/', '/articles/weekend-guide/', '/search/', '/membership/', '/newsletter/'] },
];

for (const site of sites) {
  test(`${site.name}: every page loads independently and fits the viewport`, async ({ page }) => {
    const errors = [];
    const unexpectedRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (!['127.0.0.1', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname) || request.method() !== 'GET') unexpectedRequests.push(`${request.method()} ${url.hostname}`);
    });
    await page.addInitScript(() => {
      window.policyViolations = [];
      document.addEventListener('securitypolicyviolation', (event) => window.policyViolations.push(`${event.violatedDirective}: ${event.blockedURI}`));
    });
    for (const route of site.routes) {
      const response = await page.goto(`http://127.0.0.1:${site.port}${route}`);
      expect(response.status()).toBe(200);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.title()).toContain(site.name);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      expect(await page.evaluate(() => window.policyViolations)).toEqual([]);
      await expect(page.locator('#example-controls, #survey-example, .example-discovery, [href*="survey-examples"], [data-try-cart], [data-sample-order]')).toHaveCount(0);
      for (const placeholder of await page.locator('.survey-placeholder').all()) {
        await expect(placeholder).toHaveAttribute('data-survey-status', 'unconfigured');
        await expect(placeholder).toContainText('This feedback form is coming soon.');
        await expect(placeholder.locator('input, textarea, select, form')).toHaveCount(0);
      }
      const brokenVisibleImages = await page.locator('img').evaluateAll((images) => images.filter((image) => {
        const rect = image.getBoundingClientRect();
        return rect.width && rect.height && rect.top < innerHeight && rect.bottom > 0 && !image.naturalWidth;
      }).map((image) => image.getAttribute('src')));
      expect(brokenVisibleImages).toEqual([]);
    }
    expect(errors).toEqual([]);
    expect(unexpectedRequests).toEqual([]);
  });

  test(`${site.name}: missing pages return a real 404`, async ({ request }) => {
    const response = await request.get(`http://127.0.0.1:${site.port}/not-a-page/`);
    expect(response.status()).toBe(404);
    expect(response.headers()['content-security-policy']).toContain("connect-src 'none'");
  });
}
