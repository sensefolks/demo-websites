import { test, expect } from '@playwright/test';
import '../shared/survey-placements.js';

const sites = [{ site: 'orbitdesk', port: 4171 }, { site: 'moss-and-mug', port: 4172 }, { site: 'fieldnotes', port: 4173 }];
const destination = (placement) => `${placement.path}${placement.query ? `?${placement.query}` : ''}#${placement.anchor}`;

for (const { site, port } of sites) {
  const base = `http://127.0.0.1:${port}`;
  test(`${site}: old survey links forward to the native invitation without adding a survey menu`, async ({ page }) => {
    for (const [type, placement] of Object.entries(globalThis.SurveyPlacements[site])) {
      for (const oldPath of [`/survey-examples/?type=${type}`, `${placement.path}?example=1&type=${type}&placement=inline#survey-example`]) {
        await page.goto(base + oldPath);
        await expect(page).toHaveURL(base + destination(placement));
        await expect(page.locator(`#${placement.anchor}`)).toHaveCount(1);
        await expect(page.locator(`[data-survey-key="${placement.key}"]`)).toHaveAttribute('data-survey', type);
        await expect(page.locator('#survey-example, #example-controls, dialog[open]')).toHaveCount(0);
      }
    }
    for (const invalidType of ['unknown', '__proto__', 'constructor']) {
      await page.goto(`${base}/survey-examples/?type=${invalidType}`);
      await expect(page).toHaveURL(`${base}/`);
    }
  });
}

const invitations = [
  { port: 4171, path: '/workspace/', dialog: 'feedback-dialog', key: 'orbitdesk-workspace-friction', type: 'OpenFeedback' },
  { port: 4171, path: '/pricing/', dialog: 'plan-research-dialog', key: 'orbitdesk-team-plan-tradeoffs', type: 'UserChoice' },
  { port: 4172, path: '/products/starter-kit/', dialog: 'kit-feedback-dialog', key: 'moss-kit-suggestions', type: 'OpenFeedback' },
  { port: 4172, path: '/', dialog: 'collection-dialog', key: 'moss-next-collection', type: 'FeaturePriority' },
  { port: 4172, path: '/', dialog: 'coffee-club-dialog', key: 'moss-coffee-club-price', type: 'PricePoint' },
  { port: 4173, path: '/membership/', dialog: 'reader-packages-dialog', key: 'reader-packages', type: 'UserChoice' },
  { port: 4173, path: '/membership/', dialog: 'membership-value-dialog', key: 'membership-value', type: 'PricePoint' },
  { port: 4173, path: '/newsletter/', dialog: 'newsletter-priorities-dialog', key: 'newsletter-priorities', type: 'FeaturePriority' },
];
for (const { port, path, dialog, key, type } of invitations) {
  test(`${key}: a native invitation opens dismissible feedback without changing business state`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:${port}${path}`);
    const before = await page.evaluate(() => JSON.stringify(sessionStorage));
    const mount = page.locator(`[data-survey-key="${key}"]`);
    await expect(mount).toBeHidden();
    const opener = page.locator(`[data-open-dialog="${dialog}"]`).first();
    await opener.click();
    await expect(mount).toBeVisible();
    await expect(mount).toHaveAttribute('data-survey', type);
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(mount).toBeHidden();
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => JSON.stringify(sessionStorage))).toBe(before);
  });
}

test('Moss & Mug: direct feedback links never manufacture a cart or a completed purchase', async ({ page }) => {
  await page.clock.install();
  await page.goto('http://127.0.0.1:4172/cart/?example=1&type=FastPoll');
  await expect(page).toHaveURL('http://127.0.0.1:4172/cart/#cart-title');
  await page.clock.fastForward(21000);
  await expect(page.locator('.empty-state')).toBeVisible();
  await expect(page.locator('#cart-feedback')).toBeHidden();
  await page.goto('http://127.0.0.1:4172/order/?example=1&type=Reaction');
  await expect(page).toHaveURL('http://127.0.0.1:4172/order/#checkout-reaction');
  await expect(page.locator('#order-empty')).toBeVisible();
  await expect(page.locator('#order-survey')).toBeHidden();
  expect(await page.evaluate(() => window.Demo.state.get('moss-order'))).toBeNull();
});

test('The shared host helper preserves an embed installed in a named mount', async ({ page }) => {
  await page.goto('http://127.0.0.1:4171/pricing/');
  const result = await page.evaluate(() => {
    const mount = document.createElement('section');
    mount.className = 'survey-placeholder';
    mount.dataset.survey = 'PricePoint';
    const embed = document.createElement('sf-pricepoint');
    mount.append(embed);
    window.Demo.initializePlaceholders(mount);
    return { sameEmbed: mount.firstElementChild === embed, count: mount.children.length, unconfigured: mount.hasAttribute('data-survey-status') };
  });
  expect(result).toEqual({ sameEmbed: true, count: 1, unconfigured: false });
});
