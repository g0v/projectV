'use strict';

/**
 * @ngdoc overview
 * @name mlymapApp
 * @description
 * # mlymapApp
 *
 * Main module of the application.
 */
angular
  .module('mlymapApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'leaflet-directive'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/:county', {
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      }).otherwise({
        redirectTo: '/TPE-4'
      });
  });

