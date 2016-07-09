'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MissionCtrl
 * @description
 * # MissionCtrl
 * Controller of the projectVApp
 */



angular.module('projectVApp')
  .controller('MissionCtrl',
  function ($scope, Countdown, FINALDATE_DISTRICTS, $interval, $route, $routeParams, voteInfoService, FeedService, $anchorScroll) {
    $anchorScroll();
    var county = $routeParams.county;
    var effectPrefix = 'effect:';
    var areaPrefix = 'area:';
    var typePrefix = 'type:';
    var RE_SPEECHV = /「(.+)」.*by(.*)。/i;

    var BOSS_DESCRIPTION = {
      'TPE-4':{
        name:'祭止兀',
        img:'images/head-tsai.png',
        black_img:'images/head-tsai-ko.png',
        finaldate: FINALDATE_DISTRICTS.TPE4
      },
      'TPQ-6':{
        name:'林鴻池',
        img:'images/head-lin.png',
        black_img:'images/head-lin-black.png',
        finaldate: FINALDATE_DISTRICTS.TPQ6
      },
      'TPQ-1':{
        name:'WEGO昇',
        img:'images/head-wu.png',
        black_img:'images/head-wu-black.png',
        finaldate: FINALDATE_DISTRICTS.TPQ1
      },
    };

    $scope.miscope = {};

    $scope.miscope.county = county;

    $scope.miscope.vCount = 0;
    $scope.miscope.vTotal = 0;
    $scope.miscope.sCount = 0;
    $scope.miscope.sTotal = 0;
    $scope.miscope.boss = BOSS_DESCRIPTION[county];
    $scope.miscope.newCitizen = [];
    $scope.miscope.mapLoadingComplete = false;

    $scope.miscope.bossHP = {};
    $scope.miscope.bossHP.receive = 1;
    $scope.miscope.bossHP.total = 1;

    voteInfoService.getBossHp(county).then(function(data){
      $scope.miscope.bossHP = data;
    });
    //console.log('bossHp',$scope.miscope.bossHP);





    FeedService.parseFeed('http://appyv.tumblr.com/rss').then(function(res) {
      //var entries = res.data.responseData.feed.entries;
      //var item = entries[Math.floor(Math.random() * entries.length)];
      //var matched = item.content.match(RE_SPEECHV);
      //var parser = new DOMParser();
      //var doc = parser.parseFromString(item.content, 'text/html');
      //if (matched) {
      //  $scope.speech = matched[1];
      //  $scope.citizen = matched[2];
      //  var avatar = doc.querySelector('img');
      //  if (avatar) {
      //    $scope.citizenAvatar = {
      //      'background-image': 'url(' + avatar.src + ')'
      //    };
      //  }
      //}
    });

    FeedService.parseFeed('http://appytw.tumblr.com/rss').then(function(res) {
      //var rawFeeds = res.data.responseData.feed.entries;
      var feeds = [];
      var bossFeeds = [];
      var citizenFeeds = [];
      var maxCount = 6;
      //angular.forEach(rawFeeds, function(feed) {
      //  angular.forEach(feed.categories, function(c) {
      //    if (c.indexOf(areaPrefix) === 0) {
      //      feed.area = c.substr(areaPrefix.length);
      //    } else if (c.indexOf(effectPrefix) === 0) {
      //      feed.effect = c.substr(effectPrefix.length).replace('-', ' ');
      //    } else if (c.indexOf(typePrefix) === 0) {
      //      feed.type = c.substr(typePrefix.length);
      //    }
      //  });
      //  if (!feed.area) {
      //    feed.area = 'all';
      //  }
      //  if (feed.area === 'all' || feed.area === county) {
      //    feeds.push(feed);
      //  }
      //});

      //angular.forEach(feeds, function(f) {
      //  if (f.type === 'boss') {
      //    if (bossFeeds.length < maxCount) {
      //      bossFeeds.push(f);
      //    }
      //  } else if (f.type && f.type !== 'v') {
      //    if (citizenFeeds.length < maxCount) {
      //      citizenFeeds.push(f);
      //    }
      //  }
      //});

      //console.log(rawFeeds);

      $scope.bossFeeds = angular.copy(bossFeeds);
      $scope.citizenFeeds = angular.copy(citizenFeeds);

    });

    //function loadData(){
    //  voteInfoService.getAllVoteStatInfo(county).then(function(data){
    //    //console.log('--data--',data);
    //    var vCount = 0;
    //    var vTotal = 0;
    //    var sCount = 0;
    //    var sTotal = 0;
    //    for(var key in data){
    //      var vtempTotal = voteInfoService.volCount * data[key].vweight;
    //      vTotal += vtempTotal;
    //      vCount += data[key].vCount >= vtempTotal ?  vtempTotal : data[key].vCount;
    //      for(var item in voteInfoService.supplementItem ){
    //        var stempTotal = voteInfoService.supplementItem[item][0] * data[key].vweight;
    //        sTotal += stempTotal;
    //        sCount += data[key].sItemCount[item] >= stempTotal ? stempTotal : data[key].sItemCount[item];
    //      }
    //    }
    //    $scope.miscope.vCount = vCount;
    //    $scope.miscope.vTotal = vTotal;
    //    $scope.miscope.sCount = sCount;
    //    $scope.miscope.sTotal = sTotal;
    //  });
    //}
    //loadData();

    //$scope.$on('missionDataReload',function(){
    //    //console.log('mission load data');
    //    //loadData();
    //});

    $scope.miscope.gotoMap = function(){
      $('html, body').animate({scrollTop: $('#mission_map_container').offset().top}, 500);
    };
    //$scope.$on('mapLoadingComplete',function(){
    //  $scope.miscope.mapLoadingComplete = true;
    //});
    $scope.miscope.hp1 = function(){
      var hpvar = 1 - ($scope.miscope.bossHP.receive/ $scope.miscope.bossHP.total);
      return hpvar >= 0 ? hpvar : 0;
    };

    $scope.miscope.hp2 = function(){
      var hpvar = 1- (($scope.miscope.bossHP.receive - $scope.miscope.bossHP.total)/ $scope.miscope.hp2Total());
      return hpvar;
    };
    $scope.miscope.hp2Total = function(){
      return parseInt($scope.miscope.bossHP.total*0.25);
    }

    voteInfoService.getBossHp(county);

    $scope.miscope.bossframe = function(){
     if( $scope.miscope.hp1() > 0){
        return 'mission_frame_boss';
      }
     else{
        return 'mission_frame_boss_black';
      }
    };

    //console.log('finaldate',$scope.miscope.boss.finaldate);
    $scope.time = Countdown.getTime(new Date($scope.miscope.boss.finaldate), new Date());

    $interval(function() {
      $scope.time = Countdown.getTime(new Date($scope.miscope.boss.finaldate), new Date());
    }, 1000);



  });
