#!/usr/bin/env node

const logError = err => {
  if (err) {
    console.error(err);
  }
};

process.on('uncaughtException', logError);
process.on('unhandledRejection', logError);

let i = 0;

module.exports = async filepath => {
  const run = async () => {
    console.clear();
    console.log(`[RUN]`, i++, filepath);
    try {
      const page = await require('./browser').devPage();

      if (filepath in require.cache) {
        delete require.cache[filepath];
      }

      const newRunner = require(filepath);
      newRunner();
      console.log('[DONE]');
    } catch (err) {
      console.error(err);
    }
  };

  require('fs').watch(filepath, eventName => {
    console.log(`eventName`, eventName)
    if (eventName === 'change') {
      run().catch(e => console.error(e));
    }
  });
  run().catch(e => console.error(e));
};
