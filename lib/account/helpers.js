/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';
import AccountLoginModal from './containers/auth-modal';


export function runAccountCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    let args = ['account', cmd];
    if (options.extraArgs) {
      args = args.concat(options.extraArgs);
    }
    utils.runPIOCommand(
      args,
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          return reject(error);
        }
        resolve(args.includes('--json-output') ? JSON.parse(stdout) : stdout);
      }
    );
  });
}


export async function maybeAuthModal() {
  try {
    await runAccountCommand('show', {
      // extraArgs: ['--offline', '--json-output']
    });
  } catch (e) {
    const modal = new AccountLoginModal();
    await modal.open();
  }
}
