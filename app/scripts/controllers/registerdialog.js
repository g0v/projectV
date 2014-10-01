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
  ['$scope', '$timeout', '$modalInstance', 'Facebook', 'data', function($scope, $timeout, $modalInstance, Facebook, data) {


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
   * IntentLogin
   */

  $scope.IntentLogin = function() {
    if(!userIsConnected) {
      $scope.login();
    }
  };
  
  /**
   * Login
   */
   $scope.login = function() {
     Facebook.login(function(response) {
      if (response.status == 'connected') {
        $scope.logged = true;
        $scope.me();
      }
    
    });
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
          console.log('scope.user',$scope.user);
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
        userIsConnected = false;
      });
    });
  }
  
  /**
   * Taking approach of Events :D
   */

  function fbStatusUpdate(data){
    if (data.status == 'connected') {
      $scope.$apply(function() {
        $scope.logged = true;  
        $scope.me()
      });
    } else {
      $scope.$apply(function() {
        $scope.logged = false;  
        $scope.user   = {};
      });
    }
  }

  $scope.$on('Facebook:statusChange', function(ev, data) {
    //console.log('Status: ', data);
    fbStatusUpdate(data);
  });


  Facebook.getLoginStatus(function(response) {
    console.log('fbGetLoginStatus');
    fbStatusUpdate(response);
    if (response.status == 'connected') {
      userIsConnected = true;
    }
  });


  /**
   * IntentLogin
   */
  /********************************form*****************************/

  $scope.$watch(
    'user',
    function(fbuser) {
      if(Object.getOwnPropertyNames(fbuser).length > 0 ){ 
        console.log('fbuser',fbuser);
        console.log('fbuser id',fbuser.id);
        console.log('fbuser name',fbuser.name);
        $scope.content.fbid = fbuser.id; 
        $scope.content.name = fbuser.name; 
      }
    },true);

  $scope.type = data.type;
  $scope.errors = '';
  $scope.content = {
    type: data.type,
    votestat: data.vsName, 
    vsid: data.vsId,
    fbid: '',
    name: '',
    phone: '',
    email: '',
    supplement: {},
  };

  var selectItems = { 
    'chair1':'椅子#1', 
    'chair2':'椅子#2', 
    'desk':'桌子', 
    'umbrella':'大傘', 
    'pens':'筆（若干）', 
    'board':'連署板',
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
      $modalInstance.close($scope.content);
    }
    else{
      console.log('errors',errors);
      $scope.errors = errors.join('，');
    }
  };

  $scope.cancel = function () {
     $modalInstance.dismiss('cancel');
  };

}]);
