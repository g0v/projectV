'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:AfterregCtrl
 * @description
 * # AfterregCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('AfterregCtrl', 
  ['$scope', '$timeout', '$modalInstance', 'Facebook', 'voteInfoService', 'data', '$analytics',
  function($scope, $timeout, $modalInstance, Facebook, voteInfoService, data, $analytics) {

  $scope.regscope = {};
  var defaultMsg = '我已經報名「割闌尾V計劃」志工了！\n11/29 割闌尾計畫於三個選區的投票所外不妨害投票行為的地點，設立「罷免連署示範攤位」，並邀請所有公民V有物資出物資、有力出力，擔任一天志工或贊助當日擺攤一日物資所需。\n#1129一日志工 ＃我們一起讓罷免復活 ＃割闌尾V計劃';


  /********************************facebook*****************************/

  // Define user empty data :/
  //$scope.user = {};
  // Defining user logged status
  $scope.logged = false;
  $scope.fbname = '';
  $scope.unregster = 0;
  $scope.editState = 0;

  //$scope.unregsterLoad = false;
  // And some fancy flags to display messages upon user status change

  $scope.facebookReady = false;
  /**
   * Watch for Facebook to be ready.
   * There's also the event that could be used
   */
  $scope.$watch(
    function() {
      return Facebook.isReady();
    },
    function(newVal) {
      if (newVal)
        $scope.facebookReady = true;
    }
  );

  var userIsConnected = false;


  /**
   * intentLogin
   */

  $scope.intentLogin = function() {
    //console.log('click login',userIsConnected);
    //if(!userIsConnected) {
      $scope.login();
    //}
  };

  /**
   * Login
   */
   $scope.login = function() {
     Facebook.login(function(response) {
      fbStatusUpdate(response);
      //if (response.status == 'connected') {
      //  fbSetLogin();
      //}

    }, {scope: 'publish_stream,publish_actions'});
   };

   /**
    * me
    */

    $scope.me = function() {
      //console.log('scope.me');
      Facebook.api('/me', function(response) {
        /**
         * Using $scope.$apply since this happens outside angular framework.
         */
        $scope.$apply(function() {
          //console.log('scope.me apply',response);
          //$scope.user = response;
          if(!response.error){
            //console.log('scope.me success');
            changeFbuser(response);
            $scope.logged = true;
            userIsConnected = true;
          }
        });

      });
    };

  /**
   * Logout
   */

  $scope.logout = function() {
    Facebook.logout(function() {
      $scope.$apply(function() {
        //$scope.user   = {};
        $scope.logged = false;
        userIsConnected = false;
        $scope.fbname = '';
        $scope.unregster = 0;
        $scope.editState = 0;
        //$scope.content = {};
        $scope.regscope.errors = '';
      });
    });
  }

  /**
   * Taking approach of Events :D
   */

  function fbStatusUpdate(fbdata){
    if (fbdata.status == 'connected') {
      //console.log('response',fbdata);
      $scope.$apply(function() {
        //$scope.logged = true;
        $scope.me();
        //console.log('access_token',fbdata.authResponse.accessToken);
        //$scope.auth.$login('facebook', {access_token: fbdata.authResponse.accessToken});
        //$scope.auth.$login('facebook');
      });
    } else {
      $scope.$apply(function() {
        $scope.logged = false;
        userIsConnected = false;
        $scope.fbname = '';
        $scope.editState = 0;
        //$scope.content = {};
        $scope.unregster = 0;
        //$scope.user   = {};
      });
    }
  }

  $scope.$on('Facebook:statusChange', function(ev, fbdata) {
    //console.log('Status: ', data);
    fbStatusUpdate(fbdata);
  });


  Facebook.getLoginStatus(function(response) {
    //console.log('fbGetLoginStatus');
    fbStatusUpdate(response);
  });


  /**
   * intentLogin
   */
  /********************************form*****************************/
  $scope.regscope.selectItems = voteInfoService.supplementItem;
  var selectItems = $scope.regscope.selectItems;

  $scope.regscope.nonAreaSelect = [
    '台北市',
    '新北市',
    '台中市',
    '台南市',
    '高雄市',
  ];



  //$scope.regscope.type = data.type;
  $scope.regscope.nonArea = data.nonArea;
  //console.log('data',data);
  $scope.regscope.errors = '';
  $scope.regscope.newuser = true;
  $scope.regscope.fbshare = true;
  $scope.regscope.fbmessage = defaultMsg;
  //console.log('scope content supplement',$scope.content.supplement);
  $scope.content = {
    //type: data.type,
    votestat: data.vsName,
    vsid: data.vsId,
    userid: '',
    name: '',
    phone: '',
    email: '',
    areaOrder: [
      $scope.regscope.nonAreaSelect[0],
      $scope.regscope.nonAreaSelect[1],
      $scope.regscope.nonAreaSelect[2],
    ],
    //supplement: {},
  };
  //for(var item in selectItems){
  //  $scope.content.supplement[item] = 0;
  //}






  function changeFbuser(fbuser) {
    //console.log('fbuser',fbuser);
    if(fbuser && fbuser.id){
      //$scope.myfirebase = sync.$asArray();
      $scope.content.userid = fbuser.id;
      $scope.content.name = fbuser.name;
      $scope.fbname = fbuser.name;
      $scope.content.phone = '';
      $scope.content.email = '';
      $scope.content.volOuter = false;
      $scope.content.volInner = false;
      $scope.regscope.fbshare = true;
      $scope.regscope.fbmessage = defaultMsg;
      $scope.content.areaOrder = [
        $scope.regscope.nonAreaSelect[0],
        $scope.regscope.nonAreaSelect[1],
        $scope.regscope.nonAreaSelect[2],
      ];

      //$scope.content.supplement = {};
      //for(var item in selectItems){
      //  $scope.content.supplement[item] = 0;
      //}
      //resetContent();
      //$scope.unregster = false;
      //console.log('fbuser',fbuser.id, data.type);
      //voteInfoService.queryCitizen(fbuser.id, data.type).then(function(result){
      //  //console.log('register result',result);
      //  if(!result){
      //    $scope.unregster = 2;
      //  }
      //  else{
      //    $scope.unregster = 1;
      //  }
      //});
    }
    else{
      //console.log('retry');
      $scope.me();
    }
  }

  //$scope.$watch(changeFbuser
  //  'user',
  //  ,true);



  var textItem = {
    'name':'暱稱',
    'phone':'手機',
    'email':'E-Mail',
  };


  function isNormalInteger(str) {
      return /^\+?(0|[1-9]\d*)$/.test(str);
  }


  var verifyType = function(){
    var supplement = $scope.content.supplement;
    for(var item in selectItems){
      if(!isNormalInteger(supplement[item])){
        return [false,'物資數量填寫錯誤'];
      }
    }
    for(var item in selectItems){
      if(supplement[item] > 0){
        return [true,''];
      }
    }
    return [false,'請填選您要提供的物資'];
  };

  $scope.send = function () {
    var errors = [];
    if($scope.content.register.$invalid){
      var register = $scope.content.register;
      for(var item in textItem){
        if(register[item].$error.required){
          errors.push('請填寫您的'+textItem[item]);
        }
        if(register[item].$error.email){
          errors.push('您的'+textItem[item]+'格式不符');
        }
      }
    }

    var verifytype = verifyType();
    if($scope.content.type == 'supplement' && !verifytype[0] ){
      errors.push(verifytype[1]);
    }
    if(errors.length == 0){
      //console.log('fbshare',$scope.regscope.fbshare);
      if($scope.editState == 0){
        $scope.editState = 1;
      }
      else if($scope.editState == 1){
        $scope.editState = 2;
        if($scope.regscope.fbshare == true){
          postToFb();
        }
        saveToParseCom();
      }
      else if($scope.editState == 3){
        $modalInstance.close(true);
      }
    }
    else{
      //console.log('errors',errors);
      $scope.regscope.errors = errors.join('，');
    }
  };

  $scope.cancel = function () {
     $modalInstance.dismiss('cancel');
  };

  function saveToParseCom(){
    var temp_obj = {
      fid: parseInt($scope.content.userid),
      poll: data.vsId,
      name: $scope.content.name,
      mobile: $scope.content.phone,
      email: $scope.content.email,
      county: data.county,
    };
    if($scope.regscope.nonArea){
      temp_obj['areaOrder'] = $scope.content.areaOrder.join(",");
    }
    console.log('save',temp_obj);
    //voteInfoService.saveCitizen(temp_obj,function(){
    //  $analytics.eventTrack('join', {
    //    areaOrder: temp_obj.areaOrder,
    //    volunteer: temp_obj.volunteer,
    //    county: temp_obj.county,
    //    resource: temp_obj.resource
    //  });
    //  $scope.editState = 3;
    //  //$modalInstance.close(temp_obj);
    //});
  }

  function postToFb(){
    var message = $scope.regscope.fbmessage;
    Facebook.api('/me/feed', 'post',
      { message: message,
        link:'http://1129vday.tw/',
      }, function(response) {
      if (!response || response.error) {
        //console.log('error', response.error);
        //alert('Error occured');
      } else {
        $analytics.eventTrack('postToFacebook');
        //console.log('Post ID: ' + response.id);
      }
    });
  }

}]);
