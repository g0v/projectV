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
        q: '資料填錯了要怎麼辦呀？ 後悔想要換投開所怎麼辦？',
        a: '如果有資料想要更改或是想要更換投開票所，請洽詢 <a href="mailto:appy.volunteer@gmail.com">appy.volunteer@gmail.com</a> 會有專人跟你聯絡唷！'
      }, {
        q: '為什麼有些投開所的比例怪怪的啊？有些五個人有些甚至到65個人？',
        a: '通常會有很多人的需求的投開票所，通常因為在同一個地址內（例如：學校）有很多個投開票所（例如：很多教室）。因此為了因應兩倍甚至到五倍的選舉人會前往投票，攤位人員的需求也會隨之提升囉！'
      }, {
        q: '為什麼有些里顯示為沒有投開票所，但是點選旁邊的里時，又會有投開票所在該裡出現呢？',
        a: '我們投開票所資料是根據中選會官方的資料所標示。其中有些會是A里的投開票所在B里，或是有些里沒有設置投開票所。如有問題也麻煩請回報 <a href="mailto:appy.service@gmail.com">appy.service@gmail.com</a> 會有專人跟你聯絡唷！'
      }, {
        q: '為什麼我的瀏覽器顯示會有問題怪怪的呀？',
        a: '身為專業的工程師在此呼籲，請多用 Chrome及 Firefox！ (地方的工程師只有一個肝.... 沒有空再做其他瀏覽器相容啦XDDDD) '
      }, {
        q: '報名後怎麼毫無反應只是報名完成？為什麼我報名完後沒有收到信，隔天再報名的時候才收到阿 (而且還是在垃圾郵件信夾？) ',
        a: '關於出現毫無反應的結果請檢查一下您的垃圾郵件夾，誰知道現在的黨工.... 另外如果報名第二次才成功，可能是系統忙碌中，沒有收到你的請求喔！請多見諒了！'
      }, {
        q: '我要怎麼看到自己報名的投開票所阿？',
        a: '我們認為現在網站的體驗，要再弄這個功能比較沒有感受到使用者體驗 (其實是懶得做XDDD) 不過....嘿嘿.... There\'s one more thing coming!!! 敬請期待!!'
      }, {
        q: '我的問題沒有列在 FAQ 裡面',
        a: '請寄信至 <a href="mailto:appy.service@gmail.com">appy.service@gmail.com</a>，我們將會盡快回覆您'
      }, {
        q: '我發現網站有 bug!',
        a: '請到 <a target="_blank" href="https://github.com/g0v/projectV/issues">github</a> 回報網站錯誤'
      }
    ];
  });
