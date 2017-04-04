'use strict';

import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, ScrollView } from 'react-native';

import {
  NavigationBar,
  Tile,
  Title,
  Image,
  Caption,
  ListView,
  Row,
  Subtitle,
  View,
  Screen,
  DropDownMenu,
  TouchableOpacity
} from '@shoutem/ui';

import axios from 'axios';
import _ from 'lodash';

import Config from 'react-native-config';
const ACCESS_TOKEN = Config.ACCESS_TOKEN;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Anime the This Season'
  };
  constructor(props) {
    super(props);
    const SEASONS = [
      { title: '2017 Spring', value: '2017-spring' },
      { title: '2016 Spring', value: '2016-spring' },
      { title: '2016 Summer', value: '2016-summer' },
      { title: '2016 Autumn', value: '2016-autumn' },
      { title: '2016 Winter', value: '2016-winter' }
    ];
    this.state = {
      works: [],
      seasons: SEASONS,
      selectedSeason: SEASONS[0],
      page: 1,
      isLoading: false
    };
    this.works = [];
  }
  componentDidMount() {
    this.fetchWorks(this.state.selectedSeason, 1, true);
  }
  updateWorks() {
    this.setState({ works: this.works.slice() });
  }
  renderRow(work) {
    const { navigate } = this.props.navigation;
    const image = work.image
      ? { uri: work.image }
      : require('../images/tv_sunaarashi.png');
    return (
      <TouchableOpacity
        onPress={() =>
          navigate('Web', { uri: work.official_site_url, title: work.title })}
      >
        <Row key={work.id}>
          <Image styleName="medium rounded-corners" source={image} />
          <View styleName="vertical stretch space-between">
            <Title styleName="multiline">{work.title}</Title>
            <View styleName="horizontal space-between">
              <Caption>Watchers: {work.watchers_count}</Caption>
              <Caption>{work.media_text}</Caption>
            </View>
          </View>
        </Row>
      </TouchableOpacity>
    );
  }
  fetchWorks(season, page, isRefresh) {
    this.setState({ isLoading: true });
    const url = `https://api.annict.com/v1/works?filter_season=${season.value}&sort_watchers_count=desc&page=${page}`;
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {
        const responseWorks = responseJson.works;
        if (isRefresh) {
          this.works = responseWorks;
          this.setState({
            works: this.works,
            isLoading: false
          });
        } else {
          this.works = this.works.concat(responseWorks);
          this.setState({
            works: this.works,
            isLoading: false
          });
        }
        responseWorks.forEach((work, index) => {
          if (work.official_site_url) {
            fetch(work.official_site_url, {
              method: 'GET',
              headers: {
                'User-Agent': 'facebookexternalhit/1.1'
              }
            })
              .then(response => {
                return response.text();
              })
              .then(responseText => {
                // <meta property="og:image" content="*******">
                // <meta property="og:image" content="http://eromanga-sensei.com/ogp2.png" />
                let ogImage = responseText.match(
                  /<meta[\s]*property=["']og:image["'][\s]*content=["']([^\'\"]+)["'][\s]*\/?>/
                );
                if (!ogImage) {
                  ogImage = responseText.match(
                    /<meta[\s]*content=["']([^\"\']+)["'][\s]*property=["']og:image["'][\s]*\/?>/
                  );
                }
                if (ogImage) {
                  let works = this.works;
                  for (const i in works) {
                    if (works[i].id === work.id) {
                      works[i].image = ogImage[1];
                    }
                  }
                  this.works = works;
                  _.debounce(this.updateWorks, 1000).bind(this)();
                }
              })
              .catch(err => {
                console.log(err);
              });
          }
        });
        return this.works;
      })
      .catch(error => {
        console.error(error);
      });
  }
  fetchNext() {
    let page = this.state.page + 1;
    this.setState({ page: page });
    this.fetchWorks(this.state.selectedSeason, page);
  }
  onSeasonChanged(selectedSeason) {
    this.setState({
      page: 1,
      selectedSeason: selectedSeason
    });
    this.fetchWorks.bind(this)(selectedSeason, 1, true);
  }
  render() {
    return (
      <Screen>
        <NavigationBar
          centerComponent={
            <DropDownMenu
              options={this.state.seasons}
              selectedOption={
                this.state.selectedSeason
                  ? this.state.selectedSeason
                  : this.state.seasons[0]
              }
              onOptionSelected={this.onSeasonChanged.bind(this)}
              titleProperty="title"
              valueProperty="value"
            />
          }
        />
        <View style={{ marginTop: 70 }}>
          <ListView
            data={this.state.works}
            renderRow={this.renderRow.bind(this)}
            onLoadMore={this.fetchNext.bind(this)}
            loading={this.state.isLoading}
          />
        </View>
      </Screen>
    );
  }
}
