import maginai from "maginai";
// maginaiからloggerの取得
const logger = maginai.logging.getLogger("plustalk"); // getLoggerに渡すnameは任意だがわかりやすさのためMod名が望ましい
// MODでのコンソールへのログ出力はconsole.logではなくこのようにloggerを取得して行うのを推奨
// ユーザーでレベル制御や特定のModのログ抑制などができる

function logMessage(message) {
  // loggerに出力
  logger.info(message);
  // ゲーム内ログに出力
  maginai.logToInGameLogDebug(message);
  // ※すぐに出力したい場合はaddAndViewLogを推奨
  // ここではゲームロード時の出力を意図
}

export { logMessage };
