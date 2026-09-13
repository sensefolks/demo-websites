import { test, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import '../shared/survey-catalog.js';

const catalog = globalThis.SurveyCatalog;
const types = ['FastPoll', 'Reaction', 'OpenFeedback', 'UserChoice', 'FeaturePriority', 'PricePoint'];
const sites = [{ site: 'orbitdesk', port: 4171 }, { site: 'moss-and-mug', port: 4172 }, { site: 'fieldnotes', port: 4173 }];

for (const { site, port } of sites) {
  const base = `http://127.0.0.1:${port}`;
  test(`${site}: all six types, every valid data mode, and all placements are reachable`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${base}/survey-examples/`);
    await expect(page.locator('#example-types button')).toHaveCount(6);
    for (const type of types) {
      await page.getByRole('button', { name: type, exact: true }).click();
      const dataModes = type === 'Reaction' ? ['none', 'session'] : ['none', 'respondent', 'session', 'both'];
      for (let index = 0; index < dataModes.length; index++) {
        const data = dataModes[index];
        await page.locator('#example-data').selectOption(data);
        const placement = ['inline', 'dialog', 'drawer'][index % 3];
        await page.locator('#example-placement').selectOption(placement);
        await page.getByRole('button', { name: 'Try this combination', exact: true }).click();
        const target = page.locator(placement === 'inline' ? '#example-placeholder-inline' : '#example-placeholder-dialog');
        await expect(target).toBeVisible();
        await expect(target).toHaveAttribute('data-survey', type);
        await expect(target).toHaveAttribute('data-data-mode', data);
        await expect(target.locator('input, textarea, select, form')).toHaveCount(0);
        if (placement !== 'inline') await page.getByRole('button', { name: 'Close survey preview' }).click();
      }
    }
    expect(errors).toEqual([]);
  });

  test(`${site}: mixed required fields and typed session data survive a contextual page link`, async ({ page }) => {
    await page.goto(`${base}/survey-examples/?type=UserChoice&mode=full&attributes=7&noneOption=on&data=both&placement=drawer`);
    for (const [index, type] of catalog.respondentTypes.entries()) await page.locator(`#example-field_${type}`).selectOption(index % 2 ? 'optional' : 'required');
    await expect(page.locator('.example-fields tbody tr')).toHaveCount(6);
    await expect(page.locator('.example-session')).toContainText('string');
    await expect(page.locator('.example-session')).toContainText('number');
    await expect(page.locator('.example-session')).toContainText('boolean');
    await page.getByRole('link', { name: 'Open in page context' }).click();
    const context = page.locator('#survey-example');
    await expect(context).toBeVisible();
    await context.locator('summary').click();
    await expect(context.locator('.example-fields tbody tr')).toHaveCount(6);
    await expect(context).toContainText('Full · 7 attributes');
    await expect(context).toContainText('None of these');
    await context.getByRole('button').click();
    await expect(page.locator('#example-dialog')).toHaveClass(/example-dialog--drawer/);
    await expect(page.locator('#example-placeholder-dialog')).toContainText('6 respondent fields · 3 session fields');
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'Change this combination' }).click();
    await expect(page.locator('#example-mode')).toHaveValue('full');
    await expect(page.locator('#example-field_email')).toHaveValue('optional');
    await expect(page.locator('#example-data')).toHaveValue('both');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });

  test(`${site}: every type has a real page context, with no answer collection`, async ({ page }) => {
    for (const type of types) {
      const route = catalog.sites[site].scenarios[type].path;
      await page.goto(`${base}${route}?example=1&type=${type}&data=session&placement=inline#survey-example`);
      await page.locator('#survey-example').getByRole('button').click();
      await expect(page.locator('#example-placeholder-inline')).toBeVisible();
      await expect(page.locator('#example-placeholder-inline')).toHaveAttribute('data-survey', type);
    }
  });
}

test('FastPoll makes triggered, skipped, Other, and multi-choice mixed paths explicit', async ({ page }) => {
  await page.goto('http://127.0.0.1:4171/survey-examples/?type=FastPoll&followup=selected');
  await expect(page.locator('#example-details')).toContainText('Follow-up is shown and requires');
  await page.locator('#example-answer').selectOption('alternative');
  await expect(page.locator('#example-details')).toContainText('Follow-up is skipped');
  await page.locator('#example-trigger_1').selectOption('on');
  await expect(page.locator('#example-details')).toContainText('Follow-up is shown');
  await page.locator('#example-answer').selectOption('other');
  await expect(page.locator('#example-details')).toContainText('Follow-up is skipped');
  await page.locator('#example-choice').selectOption('multi');
  await page.locator('#example-answer').selectOption('mixed');
  await expect(page.locator('#example-details')).toContainText('Follow-up is shown');
  await page.locator('#example-choice').selectOption('single');
  await expect(page.locator('#example-answer option[value="mixed"]')).toHaveCount(0);
});

test('Unsupported Reaction data modes and method combinations are not offered', async ({ page }) => {
  await page.goto('http://127.0.0.1:4172/survey-examples/?type=Reaction&data=both&bot=on');
  await expect(page.locator('#example-data')).toHaveValue('session');
  await expect(page.locator('#example-data option')).toHaveCount(2);
  await expect(page.locator('#example-field_email')).toHaveCount(0);
  await expect(page.locator('#example-bot')).toHaveCount(0);
  await expect(page.locator('#example-notes')).toContainText('Favourite Gallery');
  await page.getByRole('button', { name: 'PricePoint', exact: true }).click();
  await page.locator('#example-cohort').selectOption('calibration-gg');
  await expect(page.locator('#example-details')).toContainText('one assigned price');
  await page.locator('#example-cohort').selectOption('legacy');
  await expect(page.locator('#example-currency')).toHaveCount(0);
  await expect(page.locator('#example-details')).toContainText('Four Van Westendorp');
  await page.getByRole('button', { name: 'FeaturePriority', exact: true }).click();
  await page.locator('#example-features').selectOption('7');
  await page.locator('#example-shortlist').selectOption('6');
  await page.locator('#example-features').selectOption('4');
  await expect(page.locator('#example-shortlist')).toHaveValue('3');
  await expect(page.locator('#example-shortlist option')).toHaveCount(2);
});

test('Catalog supports every respondent-field inclusion/rule combination without key collisions', () => {
  for (const { site } of sites) {
    for (const type of types.filter((type) => type !== 'Reaction')) {
      for (let mask = 1; mask < 3 ** 6; mask++) {
        const input = { site, type, data: 'both' };
        let number = mask;
        let expected = 0;
        for (const field of catalog.respondentTypes) {
          const digit = number % 3;
          input[`field_${field}`] = ['off', 'optional', 'required'][digit];
          if (digit) expected++;
          number = Math.floor(number / 3);
        }
        const example = catalog.describe(input);
        assert.equal(example.respondent.length, expected);
        for (const field of example.respondent) {
          assert.equal(field.required, input[`field_${field.type}`] === 'required');
          assert.equal(Object.hasOwn(example.session, field.key), false);
        }
        assert.deepEqual(Object.values(example.session).map((value) => typeof value), ['string', 'number', 'boolean']);
      }
    }
  }
});
