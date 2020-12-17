module.exports = el => new Promise(resolve => {
  let timer;
  const onEnd = () => {
    el.removeEventListener('transitionend', onEnd);
    clearTimeout(timer);
    resolve();
  };
  el.addEventListener('transitionend', onEnd);
  // Fallback timer
  timer = setTimeout(onEnd, 2000);
});
