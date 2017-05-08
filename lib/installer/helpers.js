/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../config';
import * as utils from '../utils';

import fs from 'fs-plus';
import path from 'path';
import request from 'request';
import tar from 'tar';
import zlib from 'zlib';


export function getCacheDir() {
  if (!fs.isDirectorySync(config.CACHE_DIR)) {
    fs.makeTreeSync(config.CACHE_DIR);
  }
  return config.CACHE_DIR;
}

export async function download(source, target, retries = 3) {
  // check if file is already downloaded
  const contentLength = await getContentLength(source);
  if (fs.isFileSync(target)) {
    if (contentLength > 0 && contentLength == fs.getSizeSync(target)) {
      return target;
    }
    try {
      fs.removeSync(target);
    } catch (err) {
      console.error(err);
    }
  }

  return new Promise((resolve, reject) => {
    utils.runAPMCommand(
      ['config', 'get', 'https-proxy'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          return reject(`Could not get proxy from APM: ${stderr}`);
        }
        const proxy = stdout.trim();
        const file = fs.createWriteStream(target);
        const options = {
          url: source
        };
        if (proxy !== 'null') {
          options.proxy = proxy;
        }
        request.get(options)
          .on('error', err => reject(err))
          .pipe(file);
        file.on('error', err => reject(err));
        file.on('finish', () => resolve(target));
      },
      {
        cacheValid: '1h'
      }
    );
  }).then(function() {
    const fileSize = fs.getSizeSync(target);
    if (contentLength > 0 && contentLength == fileSize) {
      return arguments;
    } else if (retries > 1) {
      return download(source, target, retries - 1);
    } else {
      const msg = `Failed to download ${path.basename(target)}: Content-Length` +
        `(${contentLength}) does not match the file size (${fileSize})`;
      return Promise.reject(msg);
    }
  }).catch(error => {
    if (retries > 1) {
      console.error(error);
      return download(source, target, retries - 1);
    } else {
      return Promise.reject(error);
    }
  });
}

export function getContentLength(url) {
  return new Promise(resolve => {
    request.head({
      url
    }, (err, response) => {
      if (err || response.statusCode !== 200 || !response.headers.hasOwnProperty('content-length')) {
        resolve(-1);
      }
      resolve(parseInt(response.headers['content-length']));
    });
  });
}

export function extractTarGz(source, destination) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(zlib.createGunzip())
      .on('error', err => reject(err))
      .pipe(tar.Extract({
        path: destination
      }))
      .on('error', err => reject(err))
      .on('end', () => resolve(destination));
  });
}

export async function getPythonExecutable(customDirs = null) {
  const candidates = new Set();
  const defaultName = config.IS_WINDOWS ? 'python.exe' : 'python';

  if (customDirs) {
    customDirs.forEach(dir => candidates.add(path.join(dir, defaultName)));
  }

  if (atom.config.get('platformio-ide.useBuiltinPIOCore')) {
    candidates.add(path.join(config.ENV_BIN_DIR, defaultName));
  }

  if (config.IS_WINDOWS) {
    candidates.add(defaultName);
    candidates.add('C:\\Python27\\' + defaultName);
  } else {
    candidates.add('python2.7');
    candidates.add(defaultName);
  }

  for (const item of process.env.PATH.split(path.delimiter)) {
    if (fs.isFileSync(path.join(item, defaultName))) {
      candidates.add(path.join(item, defaultName));
    }
  }

  for (const executable of candidates.values()) {
    if ( (await isPython2(executable)) ) {
      return executable;
    }
  }

  return null;
}

function isPython2(executable) {
  const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
  return new Promise(resolve => {
    utils.runCommand(
      executable,
      args,
      (code, stdout) => {
        resolve(code === 0 && stdout.startsWith('2.7'));
      }
    );
  });
}

export function PEPverToSemver(pepver) {
  return pepver.replace(/(\.\d+)\.?(dev|a|b|rc|post)/, '$1-$2.');
}

export function reinstallPIOCore() {
  if (fs.isDirectorySync(config.ENV_DIR)) {
    try {
      fs.removeSync(config.ENV_DIR);
    } catch (err) {
      console.error(err);
    }
  }
  atom.notifications.addWarning(
    'PlatformIO Core has been uninstalled!',
    {
      detail: 'Please restart Atom to install appropriate version',
      buttons: [
        {
          text: 'Restart',
          onDidClick: () => atom.restartApplication()
        }
      ],
      dismissable: true
    }
  );
}
