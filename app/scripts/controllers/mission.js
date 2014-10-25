'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MissionCtrl
 * @description
 * # MissionCtrl
 * Controller of the projectVApp
 */


var BOSS_DESCRIPTION = {
  'TPE-4':{name:'祭止兀',img:'images/head-tsai.png'},
  'TPQ-6':{name:'林鴻池',img:'images/head-lin.png'},
  'TPQ-1':{name:'WEGO昇',img:'images/head-wu.png'},
};


angular.module('projectVApp')
  .controller('MissionCtrl',
  function ($scope, $route, $routeParams, voteInfoService, FeedService) {

    var county = $routeParams.county;
    var effectPrefix = 'effect:';
    var areaPrefix = 'area:';
    var typePrefix = 'type:';
    var targetPrefix = 'target:';

    $scope.miscope = {};

    $scope.miscope.county = county;

    $scope.miscope.vCount = 0;
    $scope.miscope.vTotal = 0;
    $scope.miscope.sCount = 0;
    $scope.miscope.sTotal = 0;
    $scope.miscope.boss = BOSS_DESCRIPTION[county];

    FeedService.parseFeed('http://yurenju.tumblr.com/rss').then(function(res) {
      var rawFeeds = res.data.responseData.feed.entries;
      var feeds = [];
      var bossFeeds = [];
      var citizenFeeds = [];
      angular.forEach(rawFeeds, function(feed) {
        angular.forEach(feed.categories, function(c) {
          if (c.indexOf(areaPrefix + county) === 0) {
            feeds.push(feed);
          } else if (c.indexOf(effectPrefix) === 0) {
            feed.effect = c.substr(effectPrefix.length).replace('-', ' ');
          } else if (c.indexOf(typePrefix) === 0) {
            feed.type = c.substr(typePrefix.length);
          } else if (c.indexOf(targetPrefix) === 0) {
            feed.target = c.substr(targetPrefix.length);
          }
        });
        if (!feed.type) {
          var fakeTypes = ['boss', 'fighting'];
          feed.type = fakeTypes[Math.floor(Math.random() * fakeTypes.length)];
        }
      });

      angular.forEach(feeds, function(f) {
        if (f.target !== 'citizen') {
          bossFeeds.push(f);
        } else {
          citizenFeeds.push(f);
        }
      });

      console.log(rawFeeds);

      $scope.bossFeeds = angular.copy(bossFeeds);
      $scope.citizenFeeds = angular.copy(citizenFeeds);
    });

    function loadData(){
      voteInfoService.getAllVoteStatInfo(county).then(function(data){
        console.log('--data--',data);
        var vCount = 0;
        var vTotal = 0;
        var sCount = 0;
        var sTotal = 0;
        for(var key in data){
          var vtempTotal = voteInfoService.volCount * data[key].vweight;
          vTotal += vtempTotal;
          vCount += data[key].vlist.length >= vtempTotal ?  vtempTotal : data[key].vlist.length;
          for(var item in voteInfoService.supplementItem ){
            var stempTotal = voteInfoService.supplementItem[item][0] * data[key].vweight;
            sTotal += stempTotal;
            sCount += data[key].sItemCount[item] >= stempTotal ? stempTotal : data[key].sItemCount[item];
          }
        }
        $scope.miscope.vCount = vCount;
        $scope.miscope.vTotal = vTotal;
        $scope.miscope.sCount = sCount;
        $scope.miscope.sTotal = sTotal;
      });
    }
    loadData();

    $scope.$on('dataReload',function(){
        console.log('mission load data');
        loadData();
    });
  });
