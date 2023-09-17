import maginai from "maginai";
import {
  loadTalkDataToDst,
  downloadTalkText,
  downloadTalkTextAsRaw,
} from "./modules/get-talk-data";
import {
  replaceThroughTalk,
  mergeTalk,
  TalkDataNotFoundError,
  replaceThroughTalkObject,
  mergeTalkObject,
} from "./modules/edit-talk";

const logger = maginai.logging.getLogger("plustalk");
let setting = null;

function formatArray(obj) {
  if (obj instanceof Array) {
    return "[" + obj.map((e) => formatArray(e)).toString() + "]";
  } else {
    return obj.toString();
  }
}

class Plustalk {
  constructor() {
    this.skippedReplacedThrough = [];
    this.skippedMerge = [];

    this.loadTalkDataToDst = loadTalkDataToDst;
    this.downloadTalkText = downloadTalkText;
    this.downloadTalkTextAsRaw = downloadTalkTextAsRaw;

    this.replaceThroughTalkObject = replaceThroughTalkObject;
    this.mergeTalkObject = mergeTalkObject;
  }
  setCheckTalk() {
    if (!setting["isCheckTalkMode"]) return;
    maginai.patcher.patchMethod(tGameCharactor, "affect", (origMethod) => {
      const rtnFn = function (a, ...rest) {
        const talk = a?.charactor.talk;
        const talkPattern = a?.charactor.talkPattern;
        const talkOverridePattern = a?.charactor.talkOverridePattern;
        const talkSubPattern = a?.charactor.talkSubPattern;
        maginai.logToInGameLogDebug(
          `[${talkPattern}, ${talk}, ${talkSubPattern}, ${talkOverridePattern}]`
        );

        return origMethod.call(this, a, ...rest);
      };
      return rtnFn;
    });
  }

  replaceThroughTalks() {
    const talkData = tWgm.tGameTalkResource.talkData;

    const pairs = setting["replaceThroughSrcAndDsts"];

    for (let [src, dst] of pairs) {
      logger.debug("Replace through:", src, dst);
      try {
        const dstPatternId = dst instanceof Array ? dst[0] : dst;
        replaceThroughTalk(talkData, src, dstPatternId);
      } catch (e) {
        if (e instanceof TalkDataNotFoundError) {
          logger.error(
            `存在しないIDが指定されました。会話置換をスキップします：${e.talkId}`
          );
          this.skippedReplacedThrough.push([src, dst]);
        } else {
          throw e;
        }
      }
    }
  }
  mergeTalks() {
    const talkData = tWgm.tGameTalkResource.talkData;

    const pairs = setting["mergeSrcAndDsts"];

    for (let [src, dst] of pairs) {
      logger.debug("Merge:", src, dst);
      try {
        const dstPatternId = dst instanceof Array ? dst[0] : dst;
        mergeTalk(talkData, src, dstPatternId);
      } catch (e) {
        if (e instanceof TalkDataNotFoundError) {
          logger.error(
            `存在しないIDが指定されました。会話追加をスキップします：${e.talkId}`
          );
          this.skippedMerge.push([src, dst]);
        } else {
          throw e;
        }
      }
    }
  }
  logFailedProcess() {
    if (
      this.skippedMerge.length === 0 &&
      this.skippedReplacedThrough.length === 0
    ) {
      return;
    }

    let message = "%c[charactor]変更に失敗した会話データがあります\n";
    const skippedMerge =
      "追加: " + this.skippedMerge.map((e) => formatArray(e)).join(", ") + "\n";
    const skippedReplacedThrough =
      "置換: " +
      this.skippedReplacedThrough.map((e) => formatArray(e)).join(", ") +
      "\n";
    maginai.logToInGameLogDebug(
      message + skippedReplacedThrough + skippedMerge
    );
  }
}

const plustalk = new Plustalk();

const postprocess = maginai
  .loadJsData("./js/mod/mods/plustalk/talk-setting.js")
  .then((loaded) => {
    setting = loaded;
    // If the setting is true, show talk info on in-geme log when the player affect someone
    plustalk.setCheckTalk();
    maginai.events.gameLoadFinished.addHandler(() => {
      // Edit talk data
      plustalk.replaceThroughTalks();
      plustalk.mergeTalks();
      // If edit errors exist, show them on in-game log
      plustalk.logFailedProcess();
    });
  });

maginai.setModPostprocess(postprocess);

export default plustalk;
