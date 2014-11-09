'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:FaqCtrl
 * @description
 * # FaqCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('FaqCtrl', function ($scope, $analytics) {
    $analytics.eventTrack('faq');
    $scope.items = [
      {
        q: '因為不知道志工要作什麼，所以不太敢答應',
        a: '我們 V 計畫一日志工，主要是希望您可以在投完票後，能夠去您所在的投開票所，或是你所' +
           '想要佔領的投開票所，同我們一起當「割友」現場收取連署書！'
      }, {
        q: '網站要求張貼到 facebook 的權限，但沒有說明會貼什麼，請問會張貼哪些資訊到' +
           ' Facebook？',
        a: '我們在臉書上僅會貼出「你已報名當志工！」等宣傳網站資訊，希望可以分享給您臉書社群的' +
           '好朋友一起共襄盛舉！而割闌尾團隊有法律團隊把關著，個資資料僅會作於聯繫您使用，絕對' +
           '不會將個資外洩！！'
      }, {
        q: '我提供的資料有需要修改的地方，要在哪邊修改呢？',
        a: '若您有任何需要修改的地方，請寄信到 <a href="mailto:appy.service@gmail.com">appy.service@gmail.com</a>'
      },{
        q: '物資表裡面有個項目我不懂，什麼是水果攤用大傘（俗稱五百萬傘）阿？',
        a: '讓我們一起看笨版長知識 XDDDD <a target="_blank" href="https://www.ptt.cc/bbs/StupidClown/M.1401775870.A.305.html">[無言] 500萬的傘</a>'
      }, {
        q: '我的問題沒有列在 FAQ 裡面',
        a: '請寄信至 <a href="mailto:appy.service@gmail.com">appy.service@gmail.com</a>，我們將會盡快回覆您'
      }, {
        q: '我發現網站有 bug!',
        a: '請到 <a target="_blank" href="https://github.com/g0v/projectV/issues">github</a> 回報網站錯誤'
      }
    ];
  });
