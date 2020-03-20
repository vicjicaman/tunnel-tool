import * as Utils from "@nebulario/tunnel-utils";

const CACHE_INDEX = {};

export const get = async (cacheid, valueFn, opts, cxt) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const current = CACHE_INDEX[cacheid];

  if (current) {
    if (current.opts.expire) {
      if (timestamp > current.timestamp + current.opts.expire) {
        await clear(cacheid, cxt);
      }
    }
  }

  if (!CACHE_INDEX[cacheid]) {
    CACHE_INDEX[cacheid] = {
      processing: true,
      timestamp,
      opts
    };

    try {
      CACHE_INDEX[cacheid].value = await valueFn(cxt);
      CACHE_INDEX[cacheid].processing = false;
    } catch (e) {
      delete CACHE_INDEX[cacheid];
      cxt.logger.error("cache.process.error", { cacheid });
      throw e;
    }
  } else {
    await wait(cacheid, cxt);
  }

  return CACHE_INDEX[cacheid].value;
};

export const clear = async (cacheid, cxt) => {
  delete CACHE_INDEX[cacheid];
};

export const set = async (cacheid, value, opts, cxt) => {
  const timestamp = Math.floor(Date.now() / 1000);

  if (CACHE_INDEX[cacheid] && CACHE_INDEX[cacheid].processing) {
    await wait(cacheid, cxt);
  } else {
    CACHE_INDEX[cacheid] = { value, timestamp, opts };
  }
};

const wait = async (cacheid, cxt) => {
  while (CACHE_INDEX[cacheid] && CACHE_INDEX[cacheid].processing) {
    await Utils.Process.wait(10);
  }
  if (!CACHE_INDEX[cacheid]) {
    cxt.logger.error("cache.wait.error", { cacheid });
    throw new Error("cache.wait.error");
  }
};
