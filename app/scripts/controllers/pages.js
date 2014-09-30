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
      { id: ''    , name: '首頁'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/appy_v_web＿img-01.svg'},
      { id: 'news', name: '戰略消息'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/appy_v_web＿img-02.svg'},
      { id: 'plan', name: '罷免日計劃'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/appy_v_web＿img-04.svg'},
      { id: 'demo', name: '自由罷免示範區'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/appy_v_web＿img-06.svg'},
      { id: 'join', name: '加入公民 v 與物資支援'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/appy_v_web＿img-08.svg'},
      { id: 'facebook', name: 'Facebook', target: '_blank'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/appy_v_web＿img-10.svg', href: 'https://www.facebook.com/Appendectomy'},
      { id: 'email', name: 'Email', target: '_blank'
          , img: 'mailto:appy.service@gmail.com'}
    ];

    $scope.getActive = function(id) {
      return ($location.url().substr(1) === id) ? 'active' : '';
    };

    $scope.getHref = function(page) {
      return (page.href) ? page.href : '#/' + page.id;
    };

    $scope.getTarget = function(page) {
      return (page.target) ? page.target : '_self';
    };
  });
