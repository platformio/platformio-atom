/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AccountInfo from '../components/info';
import React from 'react';
import { getAccountStatus } from '../helpers';


export default class InfoPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      info: '',
      error: '',
      loggedIn: false,
    };
  }

  async componentDidMount() {
    try {
      const info = await getAccountStatus();
      this.setState({
        info: info,
      });
    } catch (error) {
      this.setState({
        error: error.toString(),
      });
    }
  }

  render() {
    if (this.state.info) {
      return <AccountInfo data={ this.state.info } />;
    } else if (this.state.error) {
      return <pre>{ this.state.error }</pre>;
    } else {
      return <p>
               Loading...
             </p>;
    }
  }

}
