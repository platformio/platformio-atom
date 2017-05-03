/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';
import BaseModal from '../../base-modal';
import React from 'react';
import { runAccountCommand } from '../helpers';


export default class AccountLoginModal extends BaseModal {

  get component() {
    return ModalComponent;
  }

}

class ModalComponent extends React.Component {

  static propTypes = {
    onResolve: React.PropTypes.func.isRequired,
    onReject: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      disabled: false,
    };
  }

  onDidSubmit() {
    const {username, password} = this.state;

    if (!username || !password) {
      return;
    }

    this.setState({
      disabled: true
    });

    runAccountCommand('login', {
      extraArgs: ['--username', username, '--password', password]
    })
      .then(() => new Promise(resolve => setTimeout(resolve, 5000)))
      .then(() => {
        this.props.onResolve();
      })
      .catch((error) => {
        utils.notifyError('Login unsuccessfull.', error);
        this.setState({
          disabled: false
        });
      });
  }

  onDidClose() {
    this.props.onResolve();
  }

  handleUsernameChange(event) {
    this.setState({
      username: event.target.value
    });
  }

  handlePasswordChange(event) {
    this.setState({
      password: event.target.value
    });
  }

  render() {
    return (
      <div>
        <h1>PlatformIO Login</h1>
        <form onSubmit={ ::this.onDidSubmit } className='block native-key-bindings' tabIndex='-1'>
          <div className='form-group'>
            <label className='control-label'>
              Username
            </label>
            <input type='text'
              value={ this.state.username }
              onChange={ ::this.handleUsernameChange }
              className='form-control'
              title='Please enter you username'
              placeholder='example@gmail.com' />
          </div>
          <div className='form-group'>
            <label htmlFor='password' className='control-label'>
              Password
            </label>
            <input type='password'
              value={ this.state.password }
              onChange={ ::this.handlePasswordChange }
              className='form-control'
              title='Please enter your password' />
          </div>
        </form>
        <div className='block text-right'>
          <button onClick={ ::this.onDidClose } className='inline-block btn btn-lg'>
            Close
          </button>
          <button onClick={ ::this.onDidSubmit } disabled={ this.state.disabled ? 'disabled' : '' } className='inline-block btn btn-lg btn-primary'>
            Log In
          </button>
        </div>
      </div>);
  }

}
