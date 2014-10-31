'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('NewsCtrl', function ($scope, FeedService, Countdown, FINALDATE, $interval) {
    FeedService.parseFeed('http://appytw.tumblr.com/rss').then(function(res) {
      var feeds = [];
      angular.forEach(res.data.responseData.feed.entries, function(f) {
        feeds.push(f);
        angular.forEach(f.categories, function(c) {
          if (c.indexOf('tag:') === 0) {
            f.tag = c.substr('tag:'.length);
          }
        });
        if (!f.tag) {
          f.tag = '最新消息';
        }
      });
      $scope.feeds = feeds;
    });

    $scope.time = Countdown.getTime(new Date(FINALDATE), new Date());
    $interval(function() {
      $scope.time = Countdown.getTime(new Date(FINALDATE), new Date());
    }, 1000);
  });
