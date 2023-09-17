import {
  replaceThroughTalk,
  replaceThroughTalkObject,
  mergeTalkObject,
  TalkDataNotFoundError,
} from "./edit-talk";
class Downloader {
  constructor() {
    this.downloadLink = document.createElement("a");
    this.downloadLink.href = "javascript:void(0)";
    this.downloadLink.download = "temp.txt";
    document.body.appendChild(this.downloadLink);
  }

  download(data, name) {
    this.downloadLink.download = name;
    const blob = new Blob([data], { type: "text/plain" });
    window.navigator.msSaveBlob
      ? window.navigator.msSaveBlob(blob, name)
      : (this.downloadLink.href = window.URL.createObjectURL(blob));
    this.downloadLink.click();
  }
}

function loadTalkDataToDst(templateId, dstId, callback) {
  tWgm.tGameTalkResource.parent.loadJsData(
    "./mydata/talk/" + templateId + ".js",
    function (c, a) {
      if (!c) return callback(!1);
      c = a.match(
        /\/\/ -----------------------------------------------------------------------START\n([\s\S]+)\n\/\/ -------------------------------------------------------------------------END/m
      );
      if (!c) return callback(!1);
      c = tWgm.tGameTalkResource.decodeMyTalkData(c[1]);
      if (!c) return callback(!1);
      c = tWgm.tGameTalkResource.setMyTlkDataToTalkData(c, dstId);
      if (!c) return callback(!1);
      callback(!0);
    },
    tWgm.tGameTalkResource.parent.getCachePrefix(),
    !0
  );
}

function formatTalkText(name, talkText) {
  const template = `var LOADDATA = \`
// ----------------------------------------------------------------------------
// ここから
// -----------------------------------------------------------------------START
#@@@@#
${name}
${talkText.replace("\\n", "\\\\n")}
// -------------------------------------------------------------------------END
// ここまで
// ----------------------------------------------------------------------------
\`;`;
  return template;
}
function downloadTalkText(
  templateTalkId,
  patternId,
  subPatternId,
  overridePatternId
) {
  const promise = new Promise((resolve, reject) => {
    const talkData = tWgm.tGameTalkResource.talkData;
    const downloader = new Downloader();
    const idForLoad = 20000 + parseInt(patternId, 10);
    // 空テンプレートの読み込み
    loadTalkDataToDst(templateTalkId, idForLoad, (isOk) => {
      if (!isOk) reject();
      // 対象のパターンを読み込み
      replaceThroughTalk(talkData, patternId, idForLoad);
      // overridePatternが指定されているなら上書き
      // nullが入力されるケースもありうるため!=
      if (overridePatternId != undefined) {
        const overridePattern = talkData.overridePatterns[overridePatternId];
        if (overridePattern === undefined) {
          throw new TalkDataNotFoundError(overridePatternId);
        }
        replaceThroughTalkObject(overridePattern, talkData.patterns[idForLoad]);
      }
      // subPatternが指定されているなら追加
      // nullが入力されるケースもありうるため!=
      if (subPatternId != undefined) {
        const subPattern = talkData.subPatterns[subPatternId];
        if (subPattern === undefined) {
          throw new TalkDataNotFoundError(subPatternId);
        }
        mergeTalkObject(subPattern, talkData.patterns[idForLoad]);
      }
      const talkText = tWgm.tGameTalkResource.encodeMyTalkData(idForLoad);
      if (talkText == false)
        throw new Error(`Talk data ${patternId} not found`);
      downloader.download(
        formatTalkText(`${patternId}`, talkText),
        `${patternId}.txt`
      );
      resolve();
    });
  });
  return promise;
}
function downloadTalkTextAsRaw(talkId) {
  const talkData = tWgm.tGameTalkResource.talkData;
  const downloader = new Downloader();
  const talkText = tWgm.tGameTalkResource.encodeMyTalkData(talkId);
  downloader.download(formatTalkText(`${talkId}`, talkText), `${talkId}.txt`);
}

export { loadTalkDataToDst, downloadTalkText, downloadTalkTextAsRaw };
