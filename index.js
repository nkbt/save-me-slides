const waitForTransition = require('./waitForTransition')
const [url = 'http://localhost:3000'] = process.argv.slice(2);

let i = 0;
module.exports = async () => {
  const page = await require('./browser').devPage();
  console.log(`page.url()`, i++, page.url());
  if (page.url() === 'about:blank') {
    await page.goto(url, {waitUntil: 'networkidle0'});
  }

  await page.click('#nav [data-id="overview"]');
  await page.waitForSelector('article.active.present[data-id="overview"]');

  const [slide1] = await page.evaluate(() => Array.from(document.querySelectorAll('article.step'))
    .map(e => e.id));

  await [slide1].reduce(async (promise, slide, index) => {
    await promise;
    const slideName = `${`${index + 1}`.padStart(2, 0)} - ${slide}`;
    console.log('Saving:', slideName);
    await page.evaluate(id => impress().goto(id), slide);
    const $slide = await page.$(`#${slide}`);
    await page.evaluate(waitForTransition, $slide);
    await page.screenshot({path: `${dest}/${slideName}.png`, type: 'png'})
  }, Promise.resolve());
}


if (require.main === module) {
  require('./watcher')(__filename);
}

