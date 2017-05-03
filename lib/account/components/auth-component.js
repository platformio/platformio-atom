/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';
import { getUsername, runAccountCommand, runPioAccountForgotPassword, setUserLoggedInStatus } from '../helpers';

import PasswordInput from './password-input';
import React from 'react';
import UsernameInput from './username-input';


export class AuthComponent extends React.Component {

  static LOGIN = 'LOGIN';
  static REGISTER = 'REGISTER';
  static FORGOT = 'FORGOT';
  static COMPLETE_BUTTON_TEXT = {
    LOGIN: 'Log In',
    REGISTER: 'Register',
    FORGOT: 'Submit',
  }
  static HEADER_TEXT = {
    LOGIN: 'Log in to PlatformIO!',
    REGISTER: 'Register a PlatformIO account!',
    FORGOT: 'Forgot password',
  }

  static propTypes = {
    onResolve: React.PropTypes.func.isRequired,
    onReject: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      initialUsername: '',
      username: '',
      password: '',
      formType: this.constructor.LOGIN,
      disabled: false,
    };
  }

  componentDidMount() {
    this.setState({
      initialUsername: getUsername(),
    });
  }

  onSubmit() {
    this.setState({
      disabled: true
    });

    switch (this.state.formType) {
      case this.constructor.LOGIN:
        return this.doLogin();

      case this.constructor.REGISTER:
        return this.doRegister();

      case this.constructor.FORGOT:
        return this.doForgot();

      default:
        throw new Error(`Invalid form type: ${this.state.formType}`);
    }

  }

  doLogin() {
    const {username, password} = this.state;

    if (!username || !password) {
      return;
    }

    return runAccountCommand('login', {
      extraArgs: ['--username', username, '--password', password],
    })
      .then(() => {
        setUserLoggedInStatus(true);
        this.props.onResolve();
      })
      .catch((error) => {
        utils.notifyError('Login unsuccessfull.', error);
        this.setState({
          disabled: false
        });
      });
  }

  doRegister() {
    const {username} = this.state;

    if (!username) {
      return;
    }

    return runAccountCommand('register', {
      extraArgs: ['--username', username],
    })
      .then(() => {
        atom.notifications.addSuccess('You have been successfully registered.', {
          detail: 'Your password was sent to the email address you specified.',
        });
        this.setState({
          formType: this.constructor.LOGIN,
          disabled: false,
        });
      })
      .catch((error) => {
        utils.notifyError('Register unsuccessfull.', error);
        this.setState({
          disabled: false
        });
      });
  }

  doForgot() {
    const {username} = this.state;

    if (!username) {
      return;
    }

    return runPioAccountForgotPassword(username)
      .then(() => {
        atom.notifications.addSuccess('Password reset request has been sent successfully.', {
          detail: 'Please check your email for instructions.',
        });
        this.setState({
          formType: this.constructor.LOGIN,
          disabled: false,
        });
      })
      .catch((error) => {
        utils.notifyError('Failed to reset password.', error);
        this.setState({
          disabled: false
        });
      });
  }

  onDidClose() {
    this.props.onResolve();
  }

  handleUsernameChange(username) {
    this.setState({
      username: username,
    });
  }

  handlePasswordChange(password) {
    this.setState({
      password: password,
    });
  }

  handleCreateAccountLinkClick() {
    this.setState({
      formType: this.constructor.REGISTER,
    });
  }

  handleForgotPasswordLinkClick() {
    this.setState({
      formType: this.constructor.FORGOT,
    });
  }

  handleLoginLinkClick() {
    this.setState({
      formType: this.constructor.LOGIN,
    });
  }

  isLogin() {
    return this.state.formType == this.constructor.LOGIN;
  }

  isRegister() {
    return this.state.formType == this.constructor.REGISTER;
  }

  isNotRegister() {
    return this.state.formType != this.constructor.REGISTER;
  }

  render() {
    return (
      <div>
        <h1>{ this.constructor.HEADER_TEXT[this.state.formType] }</h1>
        <form onSubmit={ ::this.onSubmit } className='block native-key-bindings' tabIndex='-1'>
          <UsernameInput initial={ this.state.initialUsername } onChange={ ::this.handleUsernameChange } />
          <div style={ { display: this.isLogin() ? 'block' : 'none' } }>
            <PasswordInput onChange={ ::this.handlePasswordChange } />
          </div>
          <div className='block text-right'>
            <button onClick={ ::this.onDidClose } className='inline-block btn btn-lg'>
              Cancel
            </button>
            <button onClick={ ::this.onSubmit } disabled={ this.state.disabled ? 'disabled' : '' } className='inline-block btn btn-lg btn-primary'>
              { this.constructor.COMPLETE_BUTTON_TEXT[this.state.formType] }
            </button>
          </div>
          <a href="#" style={ { display: this.isLogin() ? 'block' : 'none' } } onClick={ ::this.handleForgotPasswordLinkClick }>Forgot password?</a>
          <hr/>
          <p style={ { display: this.isNotRegister() ? 'block' : 'none' } }>
            { "Don't" } have an account?
            <br/>
            <a href="#" onClick={ ::this.handleCreateAccountLinkClick }>Create one for FREE!</a>
          </p>
          <p style={ { display: this.isRegister() ? 'block' : 'none' } }>
            Already have an account? <a href="#" onClick={ ::this.handleLoginLinkClick }>Login now!</a>
          </p>
        </form>
      </div>);
  }

}
