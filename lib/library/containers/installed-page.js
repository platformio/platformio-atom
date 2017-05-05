/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { INSTALLED_INPUT_FILTER_KEY, getInstalledFilter, getVisibleInstalledLibs } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../config';
import { LibraryStorage } from '../storage';
import LibraryStoragesList from '../components/storages-list';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../home/helpers';
import { lazyUpdateInputValue } from '../../home/actions';


class LibraryInstalledPage extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(
      React.PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: React.PropTypes.string,
    setFilter: React.PropTypes.func.isRequired,
    loadInstalledLibs: React.PropTypes.func.isRequired,
    searchLibrary: React.PropTypes.func.isRequired,
    showLibrary: React.PropTypes.func.isRequired,
    uninstallLibrary: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadInstalledLibs();
  }

  render() {
    return (
      <LibraryStoragesList {...this.props} />
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisibleInstalledLibs(state),
    filterValue: getInstalledFilter(state),
    searchLibrary: (query, page) => goTo(ownProps.history, '/lib/registry/search', { query, page }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/lib/installed/show', { idOrManifest })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(INSTALLED_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LibraryInstalledPage);
