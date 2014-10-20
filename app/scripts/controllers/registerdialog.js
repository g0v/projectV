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
  //['$scope', '$timeout', '$modalInstance', 'Facebook', 'data', function($scope, $timeout, $modalInstance, Facebook, data) {
  ['$scope', '$timeout', '$modalInstance', 'Facebook', 'voteInfoService', 'data', 
  function($scope, $timeout, $modalInstance, Facebook, voteInfoService, data) {
    
  $scope.myscope = {};

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
        $scope.myscope.errors = '';
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


  $scope.myscope.fbshare = true;
  $scope.myscope.type = data.type;
  $scope.myscope.errors = '';
  $scope.myscope.newuser = true;
  $scope.content = {
    type: data.type,
    votestat: data.vsName, 
    vsid: data.vsId,
    userid: '',
    name: '',
    phone: '0953679220',
    email: 'mark23456@hotmail.com',
    supplement: {},
  };


  $scope.$watch(
    'user',
    function(fbuser) {
      if(fbuser){ 
        //console.log('fbuser',fbuser);
        //$scope.myfirebase = sync.$asArray();
        $scope.content.userid = fbuser.id; 
        $scope.content.name = fbuser.name; 
      }
    },true);


  var selectItems = { 
    'chair':'椅子', 
    'desk':'桌子', 
    'umbrella':'大傘', 
    'pen':'筆', 
    'board':'連署板',
    'water':'水',
  };

  var textItem = {
    //'name':'名字',
    'phone':'手機',
    'email':'E-Mail',
  };

  var verifySupplement = function(){
    var supplement = $scope.content.supplement;
    for(var item in selectItems){
      if(supplement[item]){
        return true;
      }
    }
    if(supplement["others_select"] && supplement["others"] && supplement["others"].length > 0 ){
      return true;
    }
    return false;
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
    if($scope.content.type == 'supplement' && !verifySupplement() ){
      errors.push('請勾選您要提供的物資');
    }
    if(errors.length == 0){
      //console.log('fbshare',$scope.myscope.fbshare);
      if($scope.myscope.fbshare == true){
        postToFb();
      }
      saveToParseCom();
    }
    else{
      //console.log('errors',errors);
      $scope.myscope.errors = errors.join('，');
    }
  };

  $scope.cancel = function () {
     $modalInstance.dismiss('cancel');
  };

  function saveToParseCom(){
    //console.log('content',$scope.content);
    //console.log('user',$scope.auth);
    //$scope.myfirebase.participants[$scope.auth.user.uid] = {
    //  type: $scope.content.type,
    //  votestat: $scope.content.votestat, 
    //  vsid: $scope.content.vsid,
    //  name: $scope.content.name,
    //  phone: $scope.content.phone,
    //  email: $scope.content.email,
    //  supplement: $scope.content.supplement,
    //};

    var temp_obj = {
      fid: $scope.content.userid,
      volunteer: $scope.content.type == 'volunteer',
      poll: data.vsId,
      name: $scope.content.name,
      mobile: $scope.content.phone,
      email: $scope.content.email,
      county: data.county,
      resource: [],//$scope.content.supplement,
    };
    voteInfoService.saveCitizen(temp_obj,function(){
      $modalInstance.close($scope.content);
    });
    //$scope.myfirebase.$add(temp_obj);
  }
  
  function postToFb(){
    var message = '割闌尾V計劃網站測試中\n http://g0v.github.io/projectV/#/';
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
