#!/usr/bin/env node


const puppeteer = require('puppeteer');
const {name} = require('./package.json');
const waitForTransition = require('./waitForTransition')
const [url = 'http://localhost:3000', dest = '.'] = process.argv.slice(2);


const run = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 0,
    devtools: false,
    args: [
      '--no-sandbox',
      '--disable-web-security',
      '--start-maximized',
      '--no-first-run',
      '--suppress-message-center-popups',
    ],
    defaultViewport: {width: 1200, height: 900, deviceScaleFactor: 2},
    userDataDir: `/tmp/puppeteer__${name}`,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const [page] = await browser.pages();
  await page.goto(url, {waitUntil: 'networkidle0'});

  const slides = await page.evaluate(() => Array.from(document.querySelectorAll('article.step'))
    .map(e => e.id));

  // Open every slide to make sure we get through "code typing"
  await slides.reduce(async (promise, slide, index) => {
    await promise;
    const slideName = `${`${index + 1}`.padStart(2, 0)} - ${slide}`;
    console.log('Walk:', slideName);
    await page.evaluate(id => impress().goto(id), slide);
    const $slide = await page.$(`#${slide}`);
    await page.evaluate(waitForTransition, $slide);
  }, Promise.resolve());

  // Back to title and wait for all animations to settle
  await page.evaluate(() => impress().goto('title'));
  await page.waitForTimeout(5000);

  await slides.reduce(async (promise, slide, index) => {
    await promise;
    const slideName = `${`${index + 1}`.padStart(2, 0)} - ${slide}`;
    console.log('Saving:', slideName);
    await page.evaluate(id => impress().goto(id), slide);
    const $slide = await page.$(`#${slide}`);
    await page.evaluate(waitForTransition, $slide);
    await page.screenshot({path: `${dest}/${slideName}.png`, type: 'png'})
  }, Promise.resolve());

  await browser.close();
}

run();
