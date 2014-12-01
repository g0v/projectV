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
    if($location.url().indexOf('minimap') == -1){
      $scope.showNav = true;
      $scope.pages = [
        { id: 'news', name: '戰略消息',
          img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-03.svg', class: 'nav-title', cssid: 'nav2'
        },
        { id: 'petition', name: '連署書資訊',
          img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-09.svg', class: 'nav-title', cssid: 'nav5'
        },
        { id: 'plan', name: '連署書代收點',
          img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-05.svg', class: 'nav-title', cssid: 'nav3'
        },
        { id: 'demo', name: '自由罷免示範區',
          img: 'https://s3-ap-southeast-1.amazonaws.com/1129vday.tw/img/1129-07.svg', class: 'nav-title', cssid: 'nav4'
        },
        { id: 'faq', name: 'FAQ'},
        { name: '贊助我們', href: 'http://tshirt.appy.tw/', target:'_blank'}
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
    }
  });
