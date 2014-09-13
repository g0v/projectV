'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:PagesCtrl
 * @description
 * # PagesCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('PagesCtrl', function ($scope, $location) {
    $scope.pages = [
      { id: 'news', name: '戰略消息'},
      { id: 'plan', name: '罷免日計劃'},
      { id: 'demo', name: '自由罷免示範區'},
      { id: 'join', name: '加入公民 v 與物資支援'},
      { id: 'facebook', name: 'Facebook',
        href: 'https://www.facebook.com/Appendectomy'},
      { id: 'email', name: 'Email',
        href: 'mailto:appy.service@gmail.com'}
    ];

    $scope.getActive = function(id) {
      return ($location.url().substr(1) === id) ? 'active' : '';
    };

    $scope.getHref = function(page) {
      return (page.href) ? page.href : '#/' + page.id;
    };
  });
