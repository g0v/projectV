'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:RegisterdialogcontrollerCtrl
 * @description
 * # RegisterdialogcontrollerCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
.controller('registerDialogController',
  ['$scope', '$timeout', '$modalInstance', 'Facebook', 'voteInfoService', 'data', 
  function($scope, $timeout, $modalInstance, Facebook, voteInfoService, data) {
    
  $scope.regscope = {};

  //var ref = new Firebase("https://torid-fire-6233.firebaseio.com/participants");

  //$scope.auth =  $firebaseSimpleLogin(ref,
  //  function(error, user) { 
  //    console.log('error',error);
  //    console.log('user',user);
  //});
  //var sync = $firebase(ref);

  //$scope.myfirebase = null; 

    
  /********************************facebook*****************************/
      
  // Define user empty data :/
  $scope.user = {};
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
    if(!userIsConnected) {
      $scope.login();
    }
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
      Facebook.api('/me', function(response) {
        /**
         * Using $scope.$apply since this happens outside angular framework.
         */
        $scope.$apply(function() {
          $scope.user = response;


          //console.log('scope.user',$scope.user);
        });
        
      });
    };
  
  /**
   * Logout
   */

  $scope.logout = function() {
    Facebook.logout(function() {
      $scope.$apply(function() {
        $scope.user   = {};
        $scope.logged = false;  
        $scope.fbname = '';
        $scope.unregster = 0;
        $scope.editState = 0;
        //$scope.content = {};
        $scope.regscope.errors = '';
        userIsConnected = false;
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
        $scope.logged = true;  
        $scope.me();
        //console.log('access_token',fbdata.authResponse.accessToken);
        //$scope.auth.$login('facebook', {access_token: fbdata.authResponse.accessToken});
        //$scope.auth.$login('facebook');
      });
    } else {
      $scope.$apply(function() {
        $scope.logged = false;  
        $scope.fbname = '';
        $scope.editState = 0;
        //$scope.content = {};
        $scope.unregster = 0;
        $scope.user   = {};
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
    if (response.status == 'connected') {
      userIsConnected = true;
    }
  });


  /**
   * intentLogin
   */
  /********************************form*****************************/
  $scope.regscope.selectItems = voteInfoService.supplementItem;
  var selectItems = $scope.regscope.selectItems;


  $scope.regscope.fbshare = true;
  $scope.regscope.type = data.type;
  $scope.regscope.nonArea = data.nonArea;
  $scope.regscope.supCount = data.supCount;
  $scope.regscope.supWeight = data.supWeight;
  //console.log('data',data);
  $scope.regscope.errors = '';
  $scope.regscope.newuser = true;
  //console.log('scope content supplement',$scope.content.supplement);
  $scope.content = {
    type: data.type,
    votestat: data.vsName, 
    vsid: data.vsId,
    userid: '',
    name: '',
    phone: '',
    email: '',
    supplement: {},
  };
  for(var item in selectItems){
    $scope.content.supplement[item] = 0;
  }
  


  $scope.$watch(
    'user',
    function(fbuser) {
      if(fbuser && fbuser.id){ 
        //$scope.myfirebase = sync.$asArray();
        $scope.content.userid = fbuser.id; 
        $scope.content.name = fbuser.name; 
        $scope.fbname = fbuser.name;
        $scope.content.phone = '';
        $scope.content.email = '';

        $scope.content.supplement = {} 
        for(var item in selectItems){
          $scope.content.supplement[item] = 0;
        }
        //resetContent();
        //$scope.unregster = false;
        //console.log('fbuser',fbuser.id, data.type);
        voteInfoService.queryCitizen(fbuser.id, data.type).then(function(result){
          //console.log('register result',result);
          if(!result){
            $scope.unregster = 2;
          }  
          else{
            $scope.unregster = 1;
          }
        });
      }
    },true);



  var textItem = {
    'name':'暱稱',
    'phone':'手機',
    'email':'E-Mail',
  };

  function isNormalInteger(str) {
      return /^\+?(0|[1-9]\d*)$/.test(str);
  }


  var verifySupplement = function(){
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
    if(supplement["others_select"] && supplement["others"] && supplement["others"].length > 0 ){
      return [true,''];
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
    var verifysup = verifySupplement();
    if($scope.content.type == 'supplement' && !verifysup[0] ){
      errors.push(verifysup[1]);
    }
    if(errors.length == 0){
      //console.log('fbshare',$scope.regscope.fbshare);
      if($scope.editState ==0){
        $scope.editState += 1;
      }
      else{
        if($scope.regscope.fbshare == true){
          postToFb();
        }
        saveToParseCom();
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
      volunteer: $scope.content.type == 'volunteer',
      poll: data.vsId,
      name: $scope.content.name,
      mobile: $scope.content.phone,
      email: $scope.content.email,
      county: data.county,
      resource: $scope.content.supplement,
    };
    voteInfoService.saveCitizen(temp_obj,function(){
      $modalInstance.close($scope.content);
    });
    //$scope.myfirebase.$add(temp_obj);
  }
  
  function postToFb(){
    var message = '割闌尾V計劃網站測試中\n http://1129vday.tw/';
    Facebook.api('/me/feed', 'post', { message: message }, function(response) {
      if (!response || response.error) {
        console.log('error', response.error);
        //alert('Error occured');
      } else {
        console.log('Post ID: ' + response.id);
      }
    });
  }

}]);
