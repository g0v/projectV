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
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-02.svg', class: 'nav-major', cssid: "nav1"},
      { id: 'news', name: '戰略消息'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-03.svg', class: 'nav-title', cssid: "nav2"},
      { id: 'plan', name: '罷免日計劃'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-05.svg', class: 'nav-title', cssid: "nav3"},
      { id: 'demo', name: '自由罷免示範區'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-07.svg', class: 'nav-title', cssid: "nav4"},
      { id: 'join', name: '加入公民 v 與物資支援'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-09.svg', class: 'nav-title', cssid: "nav5"},
      { id: 'facebook', name: 'Facebook', target: '_blank'
          , img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-11.svg', href: 'https://www.facebook.com/Appendectomy', class: 'nav-title', cssid: "nav6"}
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
