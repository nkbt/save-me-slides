#!/usr/bin/env node


const puppeteer = require('puppeteer');
const {name} = require('./package.json');


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
//    defaultViewport: {width: 1920, height: 1080},
    defaultViewport: null,
    userDataDir: `/tmp/puppeteer__${name}`,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const [page] = await browser.pages();
  await page.goto(url, {waitUntil: 'networkidle0'});

  const slides = await page.evaluate(() => Array.from(document.querySelectorAll('article.step'))
    .map(e => e.id));

  await slides.reduce(async (promise, slide, index) => {
    await promise;
    const slideName = `${`${index + 1}`.padStart(2, 0)} - ${slide}`;
    console.log(slideName);

    const $slide = await page.$(`#${slide}`);

    await page.evaluate(id => impress().goto(id), slide);

    if (index > 0 && index < slides.length - 1) {
      await page.evaluate(el => new Promise(resolve => {
        const onEnd = () => {
          el.removeEventListener('transitionend', onEnd);
          resolve();
        };
        el.addEventListener('transitionend', onEnd);
      }), $slide);
    }

    await page.screenshot({
      path: `${dest}/${slideName}.png`,
      type: 'png',
      fullPage: false
    })
  }, Promise.resolve());

  await browser.close();
}

run();
