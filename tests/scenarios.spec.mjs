import { test, expect } from '@playwright/test';

const fieldnotes = 'http://127.0.0.1:4173';
const moss = 'http://127.0.0.1:4172';
const orbit = 'http://127.0.0.1:4171';

test('OrbitDesk: completing a task opens roadmap feedback and preserves progress', async ({ page }) => {
  await page.goto(`${orbit}/workspace/`);
  await page.getByRole('button', { name: 'Complete Write a welcome worth reading', exact: true }).click();
  await expect(page.locator('#roadmap-dialog')).toBeVisible();
  await expect(page.locator('#featurepriority-survey')).toContainText('FeaturePriority');
  await page.getByRole('button', { name: 'Close roadmap feedback' }).click();
  await expect(page.locator('[data-column="done"]')).toContainText('Write a welcome worth reading');
  await expect(page.locator('#task-progress-label')).toContainText('3 of 8');
  await page.reload();
  await expect(page.locator('#task-progress-label')).toContainText('3 of 8');
  await expect(page.locator('#roadmap-dialog')).toBeHidden();
});

test('OrbitDesk: cancellation is skippable and requires no survey answer', async ({ page }) => {
  await page.goto(`${orbit}/account/`);
  await page.getByRole('button', { name: 'Cancel subscription', exact: true }).click();
  await expect(page.locator('#cancellation-survey')).toBeVisible();
  await page.getByRole('button', { name: 'Keep my plan', exact: true }).click();
  await expect(page.locator('#cancel-flow')).toBeHidden();
  await page.getByRole('button', { name: 'Cancel subscription', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm cancellation', exact: true }).click();
  await expect(page.locator('#cancel-success')).toBeVisible();
  await page.reload();
  await expect(page.locator('#cancel-success')).toBeVisible();
  await page.getByRole('button', { name: 'Restore demo subscription' }).click();
  await expect(page.locator('#cancel-success')).toBeHidden();
  await expect(page.locator('#plan-status')).toHaveText('Active subscription');
});

test('OrbitDesk: PricePoint opens on request and Escape returns focus', async ({ page }) => {
  await page.goto(`${orbit}/pricing/`);
  const opener = page.locator('[data-open-dialog="pricing-dialog"]').first();
  await opener.click();
  await expect(page.locator('dialog[open] [data-survey="PricePoint"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('OrbitDesk: help answers reveal contextual Reaction and search can recover from no results', async ({ page }) => {
  await page.goto(`${orbit}/help/`);
  const guide = page.locator('#help-start');
  await expect(guide.locator('[data-survey="Reaction"]')).toBeHidden();
  await guide.locator('summary').click();
  await expect(guide.locator('[data-survey="Reaction"]')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search help articles' }).fill('unavailable-topic');
  await expect(page.locator('#help-empty')).toBeVisible();
  await page.locator('#clear-help').click();
  await expect(page.locator('#help-empty')).toBeHidden();
  await expect(guide).toBeVisible();
});

test('Fieldnotes: useful search, empty-state feedback, and safe query rendering', async ({ page }) => {
  await page.goto(`${fieldnotes}/search/`);
  await page.getByRole('searchbox', { name: 'Search journal stories' }).fill('forest');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('#search-results')).toContainText('The quiet way through the trees');
  await expect(page.locator('#search-feedback')).toBeHidden();
  await page.getByRole('searchbox').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('#search-feedback')).toBeVisible();
  await expect(page.locator('#results-label img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Explore all stories' }).click();
  await expect(page.locator('#search-results article')).toHaveCount(3);
  await expect(page.locator('#search-feedback')).toBeHidden();
});

test('Fieldnotes: unsubscribe completes before optional feedback and can be replayed', async ({ page }) => {
  await page.goto(`${fieldnotes}/newsletter/`);
  await expect(page.locator('#newsletter-feedback')).toBeHidden();
  await page.getByRole('button', { name: 'Unsubscribe from the newsletter' }).click();
  await expect(page.locator('#subscriber-status')).toHaveText('Unsubscribed');
  await expect(page.locator('#newsletter-feedback')).toBeVisible();
  await page.reload();
  await expect(page.locator('#subscriber-status')).toHaveText('Unsubscribed');
  await page.getByRole('button', { name: 'Bring the letters back' }).click();
  await expect(page.locator('#subscriber-status')).toHaveText('Subscribed');
  await expect(page.locator('#newsletter-feedback')).toBeHidden();
});

test('Fieldnotes: reading progress reveals Reaction and manual replay bypasses the session prompt limit', async ({ page }) => {
  await page.goto(`${fieldnotes}/articles/weekend-guide/`);
  await expect(page.locator('#article-reaction')).toBeHidden();
  await page.locator('[data-article-body]').evaluate((article) => {
    const rect = article.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.top + rect.height * .8 - window.innerHeight);
  });
  await expect(page.locator('#article-reaction')).toBeVisible();
  await page.goto(`${fieldnotes}/articles/weekend-guide/`);
  await page.locator('[data-article-body]').evaluate((article) => {
    const rect = article.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.top + rect.height * .8 - window.innerHeight);
  });
  await expect(page.locator('#article-reaction')).toBeHidden();
  await page.getByRole('button', { name: 'Try this scenario' }).click();
  await expect(page.locator('#article-reaction')).toBeVisible();
  await expect(page.locator('#article-reaction')).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Try this scenario' }).click();
  await expect(page.locator('#article-reaction')).toBeInViewport();
});

test('Fieldnotes: membership preview opens a dismissible dialog without purchasing', async ({ page }) => {
  await page.goto(`${fieldnotes}/membership/`);
  await page.getByRole('button', { name: 'Monthly', exact: true }).click();
  await expect(page.locator('#member-price')).toHaveText('$5');
  await page.getByRole('button', { name: 'Preview the member experience' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('Moss & Mug: a cart survives navigation, updates totals, and checks out locally', async ({ page }) => {
  const submissions = [];
  page.on('request', (request) => { if (!['GET', 'HEAD'].includes(request.method())) submissions.push(request.url()); });
  await page.goto(`${moss}/products/starter-kit/`);
  await page.locator('[data-add-product="starter-kit"]').click();
  await page.goto(`${moss}/cart/`);
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await page.getByRole('button', { name: 'Increase quantity of The morning kit' }).click();
  await expect(page.locator('.summary-total')).toContainText('$128');
  await page.getByRole('link', { name: 'Continue to checkout' }).click();
  await page.locator('input[name="shipping"][value="express"]').check();
  await expect(page.locator('.summary-total')).toContainText('$136');
  await page.getByRole('button', { name: 'Place demo order' }).click();
  await expect(page).toHaveURL(`${moss}/order/`);
  await expect(page.locator('#order-content')).toBeVisible();
  await expect(page.locator('#order-content [data-survey="Reaction"]')).toBeVisible();
  await expect(page.locator('#order-items')).toContainText('$136');
  await page.goto(`${moss}/cart/`);
  await expect(page.locator('.empty-state')).toBeVisible();
  expect(submissions).toEqual([]);
});

test('Moss & Mug: product comparison opens UserChoice without changing the cart', async ({ page }) => {
  await page.goto(`${moss}/products/starter-kit/`);
  await page.locator('[data-open-dialog="bundle-dialog"]').first().click();
  await expect(page.locator('#bundle-dialog [data-survey="UserChoice"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#bundle-dialog')).toBeHidden();
  await page.goto(`${moss}/cart/`);
  await expect(page.locator('.empty-state')).toBeVisible();
});

test('Moss & Mug: an inactive cart reveals optional FastPoll after 20 seconds', async ({ page }) => {
  await page.clock.install();
  await page.goto(`${moss}/products/starter-kit/`);
  await page.locator('[data-add-product="starter-kit"]').click();
  await page.goto(`${moss}/cart/`);
  await page.clock.fastForward(19000);
  await expect(page.locator('#cart-feedback')).toBeHidden();
  await page.clock.fastForward(1001);
  await expect(page.locator('#cart-feedback')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss feedback invitation' }).click();
  await expect(page.locator('#cart-feedback')).toBeHidden();
  await page.clock.fastForward(21000);
  await expect(page.locator('#cart-feedback')).toBeHidden();
  await page.locator('[data-try-cart]').click();
  await expect(page.locator('#cart-feedback')).toBeVisible();
});

test('Moss & Mug: removing the last item produces a useful empty state', async ({ page }) => {
  await page.goto(`${moss}/products/starter-kit/`);
  await page.locator('[data-add-product="starter-kit"]').click();
  await page.goto(`${moss}/cart/`);
  await page.getByRole('button', { name: 'Remove The morning kit' }).click();
  await expect(page.locator('.empty-state')).toBeVisible();
  await page.goto(`${moss}/checkout/`);
  await expect(page.locator('#checkout-empty')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Place demo order' })).toHaveCount(0);
});

test('Static placeholders never contain answer inputs', async ({ page }) => {
  for (const url of [`${orbit}/pricing/`, `${moss}/products/starter-kit/`, `${fieldnotes}/membership/`]) {
    await page.goto(url);
    await expect(page.locator('.survey-placeholder')).not.toHaveCount(0);
    await expect(page.locator('.survey-placeholder input, .survey-placeholder textarea, .survey-placeholder select')).toHaveCount(0);
  }
});
