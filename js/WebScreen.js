'use strict';

import React from 'react';
import { WebView } from 'react-native';

import {
  TouchableOpacity,
  NavigationBar,
  Screen,
  View,
  Button,
  Icon,
  Text
} from '@shoutem/ui';

const WEBVIEW_REF = 'WEBVIEW';

export default class WebScreen extends React.Component {
  static navigationOptions = {
    title: ({ state }) => state.params.title
  };
  constructor(props) {
    super(props);
    this.state = {
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      loading: false
    };
  }
  goBack() {
    this.refs[WEBVIEW_REF].goBack();
  }
  goForward() {
    this.refs[WEBVIEW_REF].goForward();
  }
  onNavigationStateChange(navState) {
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      loading: navState.loading
    });
  }
  render() {
    const { params } = this.props.navigation.state;
    const backStyle = this.state.backButtonEnabled
      ? 'full-width tight clear'
      : 'full-width tight clear muted';
    const forwardStyle = this.state.forwardButtonEnabled
      ? 'full-width tight clear'
      : 'full-width tight clear muted';
    return (
      <Screen>
        <View styleName="horizontal">
          <Button styleName={backStyle} onPress={this.goBack.bind(this)}>
            <Icon name="left-arrow" />
            <Text>Back</Text>
          </Button>
          <Button styleName={forwardStyle} onPress={this.goForward.bind(this)}>
            <Icon name="right-arrow" />
            <Text>Forward</Text>
          </Button>
        </View>

        <WebView
          ref={WEBVIEW_REF}
          source={{ uri: params.uri }}
          onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          scalesPageToFit={true}
        />
      </Screen>
    );
  }
}
