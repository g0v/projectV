'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('NewsCtrl', function ($scope, FeedService, Countdown, FINALDATE) {
    FeedService.parseFeed('http://yurenju.tumblr.com/rss').then(function(res) {
      $scope.feeds=res.data.responseData.feed.entries;
    });

    $scope.time = Countdown.getTime(new Date(FINALDATE), new Date());
  });
