import Path from './pathlibx.js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import * as fse from 'fs-extra';

import { version } from '../js/mod/mods/plustalk/modules/version.js';

const modName = 'plustalk';

const distRoot = new Path('./dist');
const buildDir = new Path(`game/game/js/mod/mods/${modName}`);
const assetDir = new Path('./assets');

distRoot.mkdirSync({ existOk: true });
const distDir = distRoot.t(`${modName}-${version}`);
distDir.mkdirSync({ existOk: true });
const distArchivePath = distDir.withName(distDir.name + '.zip');

assetDir.cpSync(distDir, { recursive: true });

buildDir.cpSync(distDir.t(buildDir.name));

execSync(
  `cd "${distDir.parent()}" && zip -r "${distArchivePath.resolve()}" "${
    distDir.name
  }/"`
);
