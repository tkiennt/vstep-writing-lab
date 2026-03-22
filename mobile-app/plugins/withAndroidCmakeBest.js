/**
 * During prebuild, set cmake.dir to the newest CMake under
 * %LOCALAPPDATA%\\Android\\Sdk\\cmake (writes android/local.properties).
 * Install multiple CMake versions in SDK Manager; this picks the highest (e.g. 3.31 over 3.22.1).
 * Helps with Ninja "build.ninja still dirty" loops on some Windows machines (Defender, long paths).
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function parseVersion(v) {
  const m = String(v).match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3] || '0', 10)];
}

/** @returns {number} negative if a<b, 0 if equal, positive if a>b */
function compareVersion(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function getBestCmakeDir() {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) return null;
  const cmakeRoot = path.join(localAppData, 'Android', 'Sdk', 'cmake');
  if (!fs.existsSync(cmakeRoot)) return null;
  const dirs = fs
    .readdirSync(cmakeRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => /^\d+\.\d+/.test(n));
  if (dirs.length === 0) return null;
  dirs.sort((a, b) => compareVersion(b, a));
  return path.join(cmakeRoot, dirs[0]);
}

module.exports = function withAndroidCmakeBest(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const root = config.modRequest.platformProjectRoot;
      const cmakeDir = getBestCmakeDir();
      if (!cmakeDir) {
        return config;
      }

      const localProps = path.join(root, 'local.properties');
      const cmakeLine = `cmake.dir=${cmakeDir.replace(/\\/g, '/')}`;

      let lines = [];
      if (fs.existsSync(localProps)) {
        lines = fs.readFileSync(localProps, 'utf8').split(/\r?\n/);
      }
      const filtered = lines.filter((l) => l.trim().length > 0 && !/^\s*cmake\.dir\s*=/.test(l));
      filtered.push(cmakeLine);
      fs.writeFileSync(localProps, filtered.join('\n') + '\n', 'utf8');

      return config;
    },
  ]);
};
