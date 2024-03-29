// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import * as fs from 'node:fs/promises';

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: resolve(__dirname, 'game/game/js/mod/mods/plustalk'),
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'js/mod/mods/plustalk/init.js'),
      name: 'plustalk',
      formats: ['iife'],
    },
    rollupOptions: {
      //!重要! ここのexternal/output.globalsでmaginaiをバンドルから除外し、
      //    グローバル変数ライブラリとして読み込む設定をしないと
      //    modとして正しく動作しません
      external: ['maginai'],
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        globals: {
          maginai: ['maginai'],
        },
      },
    },
  },
  plugins: [
    {
      name: 'copy-mod-assets',
      closeBundle: async () => {
        const devRoot = 'js/mod/mods/plustalk';
        const buildRoot = 'game/game/js/mod/mods/plustalk';
        try {
          await fs.mkdir(resolve(__dirname, buildRoot));
        } catch (err) {
          if (err.code !== 'EEXIST') throw err;
        }
        const assets = [
          'talk-setting.js', //
        ];
        // Copy assets
        for (let assetName of assets) {
          await fs.cp(
            resolve(__dirname, devRoot, assetName),
            resolve(__dirname, buildRoot, assetName),
            {
              recursive: true,
            }
          );
        }
      },
    },
  ],
});
