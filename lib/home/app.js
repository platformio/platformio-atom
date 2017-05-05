/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Route, Switch } from 'react-router';
import { getActiveRoute, goTo } from './helpers';

import React from 'react';
import UserStatusContainer from '../account/containers/user-status';
import routes from './routes';


export default class HomeApp extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  render() {
    const router = this.context.router;
    return (
      <div className='pane-item home-app'>
        <div className='menu'>
          <ul className='nav nav-pills nav-stacked'>
            { routes.map(item => item.label && (
                <li onClick={ () => goTo(router.history, item.path) } key={ item.path } className={ getActiveRoute(routes, router.route.location) === item ? 'selected' : '' }>
                  <a className={ item.hasOwnProperty('icon') ? 'icon icon-' + item.icon : 'no-icon' }>
                    { item.label }
                  </a>
                </li>
              )) }
          </ul>
        </div>
        <div className='containers'>
          <div className='topbar-container'>
            <div className='row'>
              <div className='nav-control col-xs'>
                { router.history.length > 1 && router.history.index > 0 ? (
                  <a onClick={ () => router.history.goBack() } title='Go Back'><span className='inline-block icon icon-chevron-left'></span></a>
                  ) : (
                  <span className='inline-block text-subtle icon icon-chevron-left'></span>
                  ) }
                { router.history.length > 1 && router.history.index < (router.history.length - 1) ? (
                  <a onClick={ () => router.history.goForward() } title='Go Forward'><span className='inline-block icon icon-chevron-right'></span></a>
                  ) : (
                  <span className='inline-block text-subtle icon icon-chevron-right'></span>
                  ) }
              </div>
              <div className='col-xs text-right'>
                <UserStatusContainer onUsernameClick={ () => goTo(router.history, '/account') } />
              </div>
            </div>
          </div>
          <div className='main-container'>
            <Switch>
              { routes.slice(0).reverse().map(item => (
                  <Route path={ item.path }
                    key={ item.path }
                    exact={ item.exact }
                    component={ item.component } />
                )) }
            </Switch>
          </div>
        </div>
      </div>
    );
  }

}
