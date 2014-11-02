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
  function ($scope, $route, $routeParams, voteInfoService, FeedService, $anchorScroll) {
    $anchorScroll();
    var county = $routeParams.county;
    var effectPrefix = 'effect:';
    var areaPrefix = 'area:';
    var typePrefix = 'type:';
    var RE_SPEECHV = /「(.+)」.*by(.*)。/i;

    $scope.miscope = {};

    $scope.miscope.county = county;

    $scope.miscope.vCount = 0;
    $scope.miscope.vTotal = 0;
    $scope.miscope.sCount = 0;
    $scope.miscope.sTotal = 0;
    $scope.miscope.boss = BOSS_DESCRIPTION[county];
    $scope.miscope.newCitizen = [];
    $scope.miscope.mapLoadingComplete = false;

    FeedService.parseFeed('http://appyv.tumblr.com/rss').then(function(res) {
      var entries = res.data.responseData.feed.entries;
      var item = entries[Math.floor(Math.random() * entries.length)];
      var matched = item.content.match(RE_SPEECHV);
      var parser = new DOMParser();
      var doc = parser.parseFromString(item.content, 'text/html');
      if (matched) {
        $scope.speech = matched[1];
        $scope.citizen = matched[2];
        var avatar = doc.querySelector('img');
        if (avatar) {
          $scope.citizenAvatar = {
            'background-image': 'url(' + avatar.src + ')'
          };
        }
      }
    });

    FeedService.parseFeed('http://appytw.tumblr.com/rss').then(function(res) {
      var rawFeeds = res.data.responseData.feed.entries;
      var feeds = [];
      var bossFeeds = [];
      var citizenFeeds = [];
      var maxCount = 6;
      angular.forEach(rawFeeds, function(feed) {
        angular.forEach(feed.categories, function(c) {
          if (c.indexOf(areaPrefix) === 0) {
            feed.area = c.substr(areaPrefix.length);
          } else if (c.indexOf(effectPrefix) === 0) {
            feed.effect = c.substr(effectPrefix.length).replace('-', ' ');
          } else if (c.indexOf(typePrefix) === 0) {
            feed.type = c.substr(typePrefix.length);
          }
        });
        if (!feed.area) {
          feed.area = 'all';
        }
        if (feed.area === 'all' || feed.area === county) {
          feeds.push(feed);
        }
      });

      angular.forEach(feeds, function(f) {
        if (f.type === 'boss') {
          if (bossFeeds.length < maxCount) {
            bossFeeds.push(f);
          }
        } else if (f.type && f.type !== 'v') {
          if (citizenFeeds.length < maxCount) {
            citizenFeeds.push(f);
          }
        }
      });

      console.log(rawFeeds);

      $scope.bossFeeds = angular.copy(bossFeeds);
      $scope.citizenFeeds = angular.copy(citizenFeeds);

    });

    function loadData(){
      voteInfoService.getAllVoteStatInfo(county).then(function(data){
        //console.log('--data--',data);
        var vCount = 0;
        var vTotal = 0;
        var sCount = 0;
        var sTotal = 0;
        for(var key in data){
          var vtempTotal = voteInfoService.volCount * data[key].vweight;
          vTotal += vtempTotal;
          vCount += data[key].vCount >= vtempTotal ?  vtempTotal : data[key].vCount;
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
      //voteInfoService.getTopkCitizen(county,4).then(function(data){
      //  $scope.miscope.newCitizen = data;
      //});
    }
    loadData();

    $scope.$on('missionDataReload',function(){
        console.log('mission load data');
        loadData();
    });

    $scope.miscope.missionAdd = function(){
      $('html, body').animate({scrollTop: $('#mission_map_title').offset().top}, 500);
    };

    //$scope.$on('mapLoadingComplete',function(){
    //  $scope.miscope.mapLoadingComplete = true;
    //});


  });
