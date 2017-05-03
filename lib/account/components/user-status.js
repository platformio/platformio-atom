/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import React from 'react';
import { runPioAccountLogout } from '../helpers';


export default class UserStatus extends React.Component {
  static propTypes = {
    username: React.PropTypes.string,
    onLogoutComplete: React.PropTypes.func,
  }

  async onLogoutClick() {
    try {
      await runPioAccountLogout();
      atom.notifications.addSuccess('Logged out from PlatformIO successfully!');
    } catch (error) {
      utils.notifyError('Failet to logout', error);
    }
    this.props.onLogoutComplete();
  }

  render() {
    return <div>
             <span className='icon icon-person'></span>
             <span className='username'>{ this.props.username }</span>
             <a className='logout-link' onClick={ ::this.onLogoutClick }>(logout)</a>
           </div>;
  }
}
