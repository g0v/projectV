'use strict';

/**
 * @ngdoc overview
 * @name projectVApp
 * @description
 * # projectVApp
 *
 * Main module of the application.
 */
angular
  .module('projectVApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'leaflet-directive',
    'ui.bootstrap',
    'facebook',
    'firebase',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/news', {
        templateUrl: 'views/news.html',
        controller: 'NewsCtrl'
      })
      .when('/plan', {
        templateUrl: 'views/plan.html'
      })
      .when('/demo', {
        templateUrl: 'views/demo.html'
      })
      .when('/join', {
        templateUrl: 'views/join.html',
        controller: 'JoinCtrl'
      })
      .when('/mission/:county', {
        templateUrl: 'views/mission.html',
        controller: 'MissionCtrl'
      })
      .when('/map/:county', {
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config([
    'FacebookProvider',
    function(FacebookProvider) {
     //var myAppId = '276159409125032';
     //var myAppId = '295218290681475';
     var myAppId = '696953930392705';

     // You can set appId with setApp method
     // FacebookProvider.setAppId('myAppId');

     /**
      * After setting appId you need to initialize the module.
      * You can pass the appId on the init method as a shortcut too.
      */
     FacebookProvider.init(myAppId);
    }
  ]);
