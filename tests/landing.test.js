import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('landing page: navigation, fields, BEDE, mobile, and reduced motion', async () => {
  const browser = await chromium.launch({ channel: 'chromium' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5174/');
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const loadedFonts = await page.evaluate(async () => {
      const families = ['Inter', 'Plus Jakarta Sans', 'Material Symbols Outlined'];
      return Promise.all(families.map(async family => ({ family, loaded: (await document.fonts.load('16px "' + family + '"')).length > 0 })));
    });
    assert.ok(loadedFonts.every(font => font.loaded), JSON.stringify(loadedFonts));
    assert.ok(await page.locator('.google-icon').count() > 30);
    assert.ok(await page.locator('p').evaluateAll(elements => elements.every(element => getComputedStyle(element).textAlign === 'justify')));
    await page.locator('.mascot-button img').evaluate(image => image.decode());
    assert.equal(await page.locator('.header .brand-logo').getAttribute('src'), '/logo.png');
    assert.equal(await page.locator('.stage-mascot').count(), 1);
    assert.equal(await page.locator('.activity-icon').count(), 6);
    assert.ok(!(await page.locator('.activity-grid').innerText()).includes('?'));
    assert.equal(await page.locator('img[src^="/bede-"]').count(), 4);
    assert.ok(!(await page.locator('body').innerText()).includes('\ufffd'));
    await page.getByRole('button', { name: 'Inspired BEDE', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#bede-expression').getAttribute('src').endsWith('bede-idea.png'));
    assert.equal(await page.getByRole('button', { name: 'Inspired BEDE', exact: true }).getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('#bede-caption').innerText(), /little idea/);
    await page.getByRole('button', { name: 'Sleepy BEDE', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#bede-expression').getAttribute('src').endsWith('bede-sleep.png'));
    await page.getByRole('button', { name: 'Confident BEDE', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#bede-expression').getAttribute('src').endsWith('bede-cool.png'));
    assert.match((await page.locator('h1').innerText()).replace(/\s+/g, ' '), /Learn\. Collaborate\. Build\. Grow\./);
    await page.getByRole('tab', { name: /Design/ }).click();
    assert.match(await page.getByRole('tabpanel').innerText(), /UI & UX Design/);
    await page.getByRole('tab', { name: /Design/ }).press('ArrowRight');
    assert.match(await page.getByRole('tabpanel').innerText(), /Artificial Intelligence/);
    await page.getByRole('tab', { name: /Data/ }).press('End');
    assert.match(await page.getByRole('tabpanel').innerText(), /Cybersecurity/);
    await page.getByRole('tab', { name: /Systems/ }).press('Home');
    await page.getByRole('button', { name: 'Say hello to BEDE', exact: true }).first().click();
    assert.match(await page.locator('#toast').innerText(), /BEDE/);
    const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => href !== '#'));
    for (const anchor of anchors) assert.ok(await page.locator(anchor).count(), `Missing destination ${anchor}`);
    assert.equal(await page.locator('.join-inner .button').getAttribute('href'), 'https://discord.gg/c6NDJP8HFc');
    assert.equal(await page.locator('.mascot-gallery').count(), 0);
    await page.locator('img').evaluateAll(images => Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); if (!image.naturalWidth) throw new Error(image.src); })));
    assert.equal(await page.locator('a[href="https://discord.gg/c6NDJP8HFc"]').count(), 4);
    assert.equal(await page.locator('.mascot-button').evaluate(element => getComputedStyle(element).animationName), 'none');
    await page.locator('#toast.visible').waitFor({ state: 'hidden' });
    await mkdir('.playwright', { recursive: true });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: '.playwright/desktop.png', fullPage: true });
    await page.screenshot({ path: '.playwright/desktop-hero.png' });
    for (const width of [320, 360, 390, 480, 600, 760, 761, 768, 820, 1000, 1001, 1024, 1280, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => scrollTo(0, 0));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
      const overflow = await page.locator('h1,h2,h3,p,.button,.card,.field-panel,.project-board,.bede-portrait,.join-inner,.header,.footer-top,.footer-bottom,.footer-wordmark').evaluateAll(elements => elements.filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 1);
      }).map(element => element.className || element.tagName));
      assert.deepEqual(overflow, [], `Clipped content at ${width}`);
      assert.ok(await page.locator('.header-join').isVisible(), `Discord hidden at ${width}`);
      const overlaps = await page.locator('.header').evaluate(header => {
        const rects = [...header.children].filter(item => getComputedStyle(item).display !== 'none').map(item => item.getBoundingClientRect());
        return rects.some((rect, i) => rects.slice(i + 1).some(other => rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top));
      });
      assert.equal(overlaps, false, `Header overlap at ${width}`);
      if (width <= 760 && await page.locator('.menu-toggle').count() > 0) {
        await page.getByRole('button', { name: 'Open navigation' }).click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
        await page.locator('#navigation').getByRole('link', { name: 'Community', exact: true }).click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
        await page.getByRole('button', { name: 'Open navigation' }).click();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      }
      if (width === 390) { await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: '.playwright/mobile.png', fullPage: true }); await page.screenshot({ path: '.playwright/mobile-hero.png' }); }
    }
    await page.setViewportSize({ width: 844, height: 390 });
    await page.evaluate(() => scrollTo(0, 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Landscape overflow');
    await page.screenshot({ path: '.playwright/landscape.png', fullPage: true });
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.screenshot({ path: '.playwright/tablet.png', fullPage: true });
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});



