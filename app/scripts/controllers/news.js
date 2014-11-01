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
    var mapping = {
      street: '掃街活動',
      speech: '宣講活動',
      music: '音樂活動',
      multiple: '綜合活動',
      hide: '隱藏活動',
      boss: '魔王消息'
    };

    FeedService.parseFeed('http://appytw.tumblr.com/rss').then(function(res) {
      var feeds = [];
      angular.forEach(res.data.responseData.feed.entries, function(f) {
        feeds.push(f);
        angular.forEach(f.categories, function(c) {
          if (c.indexOf('type:') === 0) {
            f.tag = mapping[c.substr('type:'.length)];
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
