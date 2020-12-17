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

  const slides = await page.evaluate(() => Array.from(document.querySelectorAll('article.step'))
    .map(e => e.id));

  await slides.reduce(async (promise, slide, index) => {
    await promise;
    const slideName = `${`${index + 1}`.padStart(2, 0)} - ${slide}`;
    console.log(slideName);

    const $slide = await page.$(`#${slide}`);

    await page.evaluate(id => impress().goto(id), slide);

    await page.evaluate(el => new Promise(resolve => {
      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      el.addEventListener('transitionend', onEnd);
    }), $slide);


    await page.screenshot({
      path: `${slideName}.png`,
      type: 'png',
      fullPage: false
    })
  }, Promise.resolve());
}


if (require.main === module) {
  require('./watcher')(__filename);
}

