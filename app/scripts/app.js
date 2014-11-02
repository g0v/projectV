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
      .when('/petition', {
        templateUrl: 'views/petition.html',
        controller: 'PetitionCtrl'
      })
      .when('/mission/:county', {
        templateUrl: 'views/mission.html',
        controller: 'MissionCtrl'
      })
      .when('/mroute/:county', {
        templateUrl: 'views/blank.html',
        controller: 'MrouteCtrl'
      })
      .when('/map/:county', {
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      })
      .when('/minimap/:county', {
        templateUrl: 'views/minimap.html',
        controller: 'MapCtrl'
      })
      .when('/faq', {
        templateUrl: 'views/faq.html',
        controller: 'FaqCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config([
    'FacebookProvider',
    function(FacebookProvider) {
     //var myAppId = '500181739999677';
     var myAppId = '244089402325240'; //release

     // You can set appId with setApp method
     // FacebookProvider.setAppId('myAppId');

     /**
      * After setting appId you need to initialize the module.
      * You can pass the appId on the init method as a shortcut too.
      */
     FacebookProvider.init(myAppId);
    }
  ]).filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
      return $filter('number')(input * 100, decimals) + '%';
    };
  }]);

