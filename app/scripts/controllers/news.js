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
      var feeds = [];
      angular.forEach(res.data.responseData.feed.entries, function(f) {
        angular.forEach(f.categories, function(c) {
          if (c === 'target:boss') {
            feeds.push(f);
          }
        });
      });
      $scope.feeds = feeds;
    });

    $scope.time = Countdown.getTime(new Date(FINALDATE), new Date());
  });
