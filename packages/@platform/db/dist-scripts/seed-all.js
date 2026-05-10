"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/seed-all.ts
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
var import_child_process = require("child_process");
var envPath = import_path.default.resolve(__dirname, "../../../../.env");
try {
  const result = import_dotenv.default.config({ path: envPath });
  if (result.error) {
  }
} catch (error) {
}
function runScript(scriptRelPath) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const cmd = isWin ? "tsx.cmd" : "tsx";
    const child = (0, import_child_process.spawn)(cmd, [scriptRelPath], {
      stdio: "inherit",
      shell: true,
      env: process.env,
      cwd: import_path.default.resolve(__dirname, "../")
      // run from package dir to avoid Windows space path issues
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Script failed: ${scriptRelPath} (code ${code})`));
    });
  });
}
async function main() {
  console.log("\u{1F331} Seeding: base data");
  await runScript("scripts/seed.ts");
  console.log("\u{1F331} Seeding: visibility data");
  await runScript("scripts/seed-visibility.ts");
  console.log("\u{1F331} Seeding: competitors data");
  await runScript("scripts/seed-competitors.ts");
  console.log("\u{1F331} Seeding: brand rise data");
  await runScript("scripts/seed-brand-rise.ts");
  console.log("\u{1F331} Seeding: reviews data");
  await runScript("scripts/seed-reviews.ts");
  console.log("\u{1F331} Seeding: metrics data");
  await runScript("scripts/seed-metrics.ts");
  console.log("\u{1F331} Seeding: GBP profile snapshots");
  await runScript("scripts/seed-snapshot.ts");
  console.log("\u2705 All seeders completed");
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
