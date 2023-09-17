const logger = maginai.logging.getLogger("plustalk");

class TalkDataNotFoundError extends Error {
  static {
    this.prototype.name = "TalkDataNotFoundError";
  }
  constructor(talkId, ...rest) {
    super(`会話データが存在しません ID：${talkId}`, ...rest);
    this.talkId = talkId;
  }
}

/**
 * fn == (src_current, dst_current, key)
 */
function traverseTalkObject(src, dst, fn, noError) {
  let keys = [];
  if (src === undefined || dst === undefined) {
    throw new Error(`src or dst is undefined`);
  }
  function internal(src_current, dst_current, keys) {
    for (const k in src_current) {
      const dst_obj = dst_current[k];
      const src_obj = src_current[k];
      if (dst_obj === undefined) {
        logger.debug(`dst_current doesn't have key: ${k} keys: ${keys}`);
        continue;
      }
      if (Array.isArray(src_obj)) {
        if (Array.isArray(dst_obj)) {
          fn(src_current, dst_current, k);
          // dst_obj.push(...src_obj);
        } else {
          const message = `dst_obj is not array: src=${dst_obj}, keys=${keys}`;
          if (noError) {
            logger.debug(message);
          } else {
            throw new Error(message);
          }
        }
      } else if (typeof src_obj === "object") {
        keys.push(k);
        internal(src_obj, dst_obj, keys);
        keys.pop();
      } else {
        logger.debug(`src_obj is not an object: ${src_obj}`);
      }
    }
  }
  internal(src, dst, keys);
  return dst;
}

function mergeTalkObject(src, dst, noError = true) {
  traverseTalkObject(
    src,
    dst,
    (src_current, dst_current, key) => {
      dst_current[key].push(...src_current[key]);
    },
    noError
  );
}

function replaceThroughTalkObject(src, dst, noError = true) {
  traverseTalkObject(
    src,
    dst,
    (src_current, dst_current, key) => {
      if (src_current[key].length !== 0) {
        dst_current[key] = src_current[key];
      }
    },
    noError
  );
}

function mergeTalk(talkData, srcId, dstId) {
  const srcPattern = talkData.patterns[srcId];
  const dstPattern = talkData.patterns[dstId];
  if (srcPattern === undefined) throw new TalkDataNotFoundError(srcId);
  if (dstPattern === undefined) throw new TalkDataNotFoundError(dstId);

  mergeTalkObject(srcPattern, dstPattern);
  // talks/commonTalkTypesはマージできない・不要なのでスキップ
}

function replaceThroughTalk(talkData, srcId, dstId) {
  const srcPattern = talkData.patterns[srcId];
  const dstPattern = talkData.patterns[dstId];
  if (srcPattern === undefined) throw new TalkDataNotFoundError(srcId);
  if (dstPattern === undefined) throw new TalkDataNotFoundError(dstId);
  replaceThroughTalkObject(srcPattern, dstPattern);

  const srcTalks = talkData.talks[srcId];
  const dstTalks = talkData.talks[dstId];
  if (srcTalks === undefined || dstTalks === undefined) {
    logger.warn(
      `指定IDのtalksが存在しないためtalksの置き換えをスキップします：`,
      srcId ?? dstId
    );
    return;
  }
  const resultTalks = [];
  for (let i in srcTalks) {
    resultTalks.push(srcTalks[i] === "" ? dstTalks[i] : srcTalks[i]);

    // replace talks[dstId]
    talkData.talks[dstId] = resultTalks;
  }
}

export {
  mergeTalk,
  replaceThroughTalk,
  TalkDataNotFoundError,
  replaceThroughTalkObject,
  mergeTalkObject,
};
