'use strict';

import React, { Component } from 'react';
import { InteractionManager } from 'react-native';

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
import moment from 'moment';

import Config from '../config';
const ACCESS_TOKEN = Config.ACCESS_TOKEN;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: '今期のアニメ'
  };
  constructor(props) {
    super(props);
    // const SEASONS = [
    //   { title: '2017 Spring', value: '2017-spring' },
    //   { title: '2016 Spring', value: '2016-spring' },
    //   { title: '2016 Summer', value: '2016-summer' },
    //   { title: '2016 Autumn', value: '2016-autumn' },
    //   { title: '2016 Winter', value: '2016-winter' }
    // ];
    const SEASONS = this.getSeasons();

    this.state = {
      works: [],
      seasons: SEASONS,
      selectedSeason: SEASONS[1],
      page: 1,
      isLoading: false
    };
    this.works = [];
  }
  convertSeasonObject(year, month){
    console.log(year,month);
    let seasonNum;
    const SEASON_ARRAY = [
      "Spring",
      "Summer",
      "Autumn",
      "Winter"
    ];
    year = parseInt(year, 10);
    month = parseInt(month, 10);
    if (month > 9) {
      seasonNum = 2;
    } else if (month > 6) {
      seasonNum = 1;
    } else if (month > 3) {
      seasonNum = 0;
    } else {
      seasonNum = 3;
    }
    return {
      title: `${year} ${SEASON_ARRAY[seasonNum]}`,
      value: `${year}-${SEASON_ARRAY[seasonNum].toLowerCase()}`
    };
  }
  getSeasons() {
    let seasons = [];
    // Next Season
    seasons.push(this.convertSeasonObject(...moment().add(3, 'months').format('YYYY/MM').split('/')));
    // This Season
    seasons.push(this.convertSeasonObject(...moment().format('YYYY/MM').split('/')));
    // Past Season
    [1,2,3,4].forEach((i) => {
      seasons.push(this.convertSeasonObject(...moment().subtract(3*i, 'months').format('YYYY/MM').split('/')));
    });
    return seasons;
  }
  componentDidMount() {
    this.fetchWorks(this.state.selectedSeason, 1, true);
  }
  updateWorks() {
    this.setState({ works: this.works.slice() });
  }
  renderRow(work) {
    const { navigate } = this.props.navigation;
    const image = work.images && work.images.facebook.og_image_url
      ? { uri: work.images.facebook.og_image_url }
      : { uri: work.images.recommended_url };
    return (
      <TouchableOpacity
        onPress={(() => {
          navigate('Web', { uri: work.official_site_url, title: work.title });
        }).bind(this)}
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
    console.log(this.state.selectedSeason);
    return (
      <Screen>
        <NavigationBar
          centerComponent={
            <DropDownMenu
              options={this.state.seasons}
              selectedOption={
                this.state.selectedSeason
                  ? this.state.selectedSeason
                  : this.state.seasons[1]
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
