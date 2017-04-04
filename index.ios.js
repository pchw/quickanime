/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';

import { StackNavigator } from 'react-navigation';
const AnimeTheThisSeason = StackNavigator({
  Home: { screen: require('./js/HomeScreen').default },
  Web: { screen: require('./js/WebScreen').default }
});

AppRegistry.registerComponent('AnimeTheThisSeason', () => AnimeTheThisSeason);
