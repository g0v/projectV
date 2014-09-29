'use strict';

/* global $ */

var DEFAULT_COUNTY = 'TPE-4';

var MAP_DEFAULT_VIEW = {
  'TPE-4':{lat: 25.0666313, lng: 121.5943403, zoom: 13},
  'TPQ-1':{lat: 25.1752044, lng: 121.4813232, zoom: 12},
  'TPQ-6':{lat: 25.0260396, lng: 121.4654445, zoom: 14},
};


/**
 * @ngdoc function
 * @name projectVApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MapCtrl',
  ['$scope', '$routeParams','$http', '$q', '$filter', '$modal', 'leafletData', 'voteInfoService',
  function ($scope, $routeParams, $http, $q, $filter, $modal, leafletData, voteInfoService ) {
    $scope.myscope = {};
    $scope.voteInfos = {};
    var county = $routeParams.county;
    var voteStatData = null;
    var lastClickLayer = null; 
    var lastClickMarker = null;
    $scope.myscope.showVS = null;
    $scope.myscope.currentVsTab = {}; //local
    $scope.myscope.currentTownTab = ''; //local
    $scope.myscope.vsInfo = {
      volunteer:0,
      vlist:[],
      supplement:0,
      slist:[],
    };


    $scope.leafletData = leafletData;
    $scope.taiwan = MAP_DEFAULT_VIEW[county];

    $scope.defaults = {
      zoomControlPosition: 'bottomright',
      minZoom: 11,
      //maxZoom: 10,
    };


     var myicon = {
              iconSize:     [40, 45],
              iconUrl: 'images/mapx1.png',
              iconAnchor:   [20, 45]
               };

     var myiconOver = {
              //iconUrl: 'http://fakeimg.pl/20x50/dddd00/?text=X',
              iconSize:     [40, 45],
              iconUrl: 'images/mapd1.png',
              iconAnchor:   [20, 45]
               };

     var myiconClick = {
              iconSize:     [40, 45],
              iconUrl: 'images/mapc1.png',
              iconAnchor:   [20, 45]
              };


    if(!(county in MAP_DEFAULT_VIEW)) {
      county = DEFAULT_COUNTY;
    }

    function getColor(feature) {
      var area = [];

      if (feature.properties.TOWNNAME) {
        area.push(feature.properties.TOWNNAME);
      }
      if (feature.properties.VILLAGENAM) {
        area.push(feature.properties.VILLAGENAM);
      }
      var defaultColor = '#aaaaaa';
          return defaultColor;
    }

    function animate() {
      setTimeout(function() {
        $('.county').each(function(i, el) {
          if (el.classList) {
            el.classList.remove('transparent');
          } else if (el.getAttribute && el.getAttribute('class')) {
            // workaround for IE 10
            el.setAttribute('class',
              el.getAttribute('class').replace('transparent', ''));
          }
        });
      }, 100);
    }


    function applyGeojson(json) {
      if (!$scope.geojson) {
        $scope.geojson = {
          data: json,
          style: style,
          resetStyleOnMouseout: false 
        };
      } else {
        $scope.leafletData.getGeoJSON().then(function(localGeojson) {
          localGeojson.addData(json);
        });
      }
      //animate();
    }

    function drawCounty(county){
        var jsonPath = 'json/twVote1982/' + county + '.json';
        $http.get(jsonPath).then(function(res) {
          if (!$scope.districts) {
            $scope.districts = res.data;
          } else {
           $scope.districts.features.push(res.data.features[0]);
          }
          var name = county;
          drawDistrict($scope.voteInfos[name], name);
        });
    }

    function drawDistrict(voteInfo, name) {
    //console.log('voteInfo',voteInfo['投票狀況']);
      var query0 = 'json/votestat/8/' + county + '.json';
      $http.get(query0).then(function(res0) {
        voteStatData = res0.data;
        angular.forEach(voteInfo['投票狀況'], function(town, townName) {
          angular.forEach(town, function(village, villageName) {
            var query = 'json/twVillage1982/' + name + '/' + voteInfo['選區'][0] +
              '/' + townName + '/' + villageName + '.json';
            $http.get(query).then(function(res) {
              applyGeojson(res.data);
            },
            function() {

            });
          });
        });
      },
      function(err) {
        console.log('err',err);
      });
    }

    function style() {
      return {
        opacity: 1,
        weight: 2,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: "#aaaaaa",//getColor(feature),
        className: 'county transparent'
      };
    }

    var mouse_over_style = {
        weight: 5,
        color: '#666',
        dashArray: '',
    };

    var mouse_leave_style = {
        weight: 2,
        color: 'white',
        dashArray: '3',
    };

    var mouse_click_style = {
        fillColor: "#aaaa00",//getColor(feature),
    };

    var mouse_unclick_style = {
        fillColor: "#aaaaaa",//getColor(feature),
    };
    
    // Mouse over function, called from the Leaflet Map Events
    function areaMouseover(ev, leafletEvent) {
      var layer = leafletEvent.target;
      layer.setStyle(mouse_over_style);
      layer.bringToFront();
    }

    function areaMouseout(ev, leafletEvent) {
      var layer = leafletEvent.target;
      layer.setStyle(mouse_leave_style);
      layer.bringToFront();
    }

    function areaClickStyle(leafletEvent){
      var layer = leafletEvent.target;
      layer.setStyle(mouse_click_style);
      layer.bringToFront();
      if(lastClickLayer){
        lastClickLayer.setStyle(mouse_unclick_style);
      }
      lastClickLayer = layer; 
    }

    function areaClick(ev, featureSelected, leafletEvent) {
      areaClickStyle(leafletEvent);
      var townName = leafletEvent.target.feature.properties.TOWNNAME;
      var villageName = leafletEvent.target.feature.properties.VILLAGENAM;
      setCurrentVotestat(townName,villageName);
    }

    $scope.myscope.areaSelect = function(townName, villageName){
      setCurrentVotestat(townName,villageName)
    };

    function setCurrentVotestat(townName, villageName){
      $scope.myscope.showVS = {};
      $scope.myscope.showVS.townName = townName;
      $scope.myscope.showVS.villageName = villageName;
      $scope.myscope.showVS.vsArray = [];
      $scope.markers = {};
      var markerArray = [];
      var currentVsId = 0;
      angular.forEach(voteStatData[townName],function(votestat) {
        var vsIndex = votestat.neighborhood.indexOf(villageName);
        if(vsIndex != -1){
          $scope.myscope.showVS.vsArray.push({
            'name':votestat.name,
            'id':votestat.id,
          });
          if(markerArray.length ==0){
            currentVsId = votestat.id;
          }
          markerArray.push({
            'vsid':votestat.id,
            'townName': townName,
            'villageName': villageName,
            'vspos': markerArray.length,
            'vsobj': {
              lat: votestat.location.lat,
              lng: votestat.location.lng,
            },
          });
        }
      });
      drawVoteStation(markerArray);
      $scope.myscope.setVotestatTab(currentVsId);
    }
  

    $scope.myscope.setTownTab = function(townName){
      $scope.myscope.currentTownTab = townName;
    };


    $scope.myscope.isCurrentTownTab = function(townName){
      if($scope.myscope.currentTownTab == townName){
        return "bg-primary";
      }
      else{
        return "";
      }
    };

    $scope.myscope.isCurrentVsTab = function(vsId){
      if($scope.myscope.currentVsTab.vsId == vsId){
        return "bg-primary";
      }
      else{
        return "";
      }
    };

    $scope.myscope.setVotestatTab = function(vsId){
      $scope.myscope.currentVsTab.vsId = vsId;
      $scope.myscope.currentVsTab.vsName = (function(){ 
        for( var i =0; i < $scope.myscope.showVS.vsArray.length; i++){
          var vsobj = $scope.myscope.showVS.vsArray[i];
          if(vsobj.id == vsId){
            return vsobj.name;
          }};
      })();
      var query0 = 'json/votestatInfo/' + county + '.json';
      $http.get(query0).then(function(res0) {
        $scope.myscope.vsInfo = res0.data[vsId];
      },
      function(err) {
        console.log('err',err);
      });
    };

    $scope.debug = function() {
      // debugger;
    };

    $scope.myscope.back = function() {
      $scope.myscope.showVS = null;
      $scope.markers = {};

      if(lastClickLayer){
        lastClickLayer.setStyle(mouse_unclick_style);
        lastClickLayer = null;
      }
      //delete $scope.selectedDistrictName;
      //delete $scope.geojson;
      //applyGeojson($scope.districts);
      //$scope.taiwan = MAP_DEFAULT_VIEW[county];
    };



    console.log('onload1');

    voteInfoService.getAllVoteInfo(county).then(
      function() {},
      function() {},
      function(voteInfo) {
       console.log('onload2');
        $scope.voteInfos[voteInfo.id] = voteInfo.content;
        drawCounty(voteInfo.id);
    });

    voteInfoService.getAllVillageSum(county).then(
      function() {}, 
      function() {}, 
      function(villageSum){ 
        $scope.myscope.villageSum = villageSum['content'];
        $scope.myscope.currentTownTab = Object.keys(villageSum['content'])[0];
        //console.log(villageSum);
    }); 
    

    function drawVoteStation(markerArray) {
      var mymarkers = {};
      lastClickMarker = null;
      angular.forEach(markerArray, function(marker) {
        mymarkers[marker.vsid] = {
          lat: marker.vsobj.lat,
          lng: marker.vsobj.lng,
          icon: myicon,
          myloc: marker.townName + '-' + marker.villageName,
          myid: marker.vsid
        };
      });
      angular.extend($scope, {
        markers: mymarkers,
      });
      //$scope.markerNs = {};
      //$scope.markerNs.click = false;

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        var thisName = args.markerName;
        var thisMarker = $scope.markers[thisName];
        console.log(thisName);
        $scope.myscope.setVotestatTab(thisMarker.myid);
        if(lastClickMarker){
           lastClickMarker.icon = myicon
        }
        thisMarker.icon = myiconClick;
        lastClickMarker = thisMarker;
        //console.log("Leaflet Click",thisMarker.myid);
      });

      $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
        var thisMarker = $scope.markers[args.markerName];
        thisMarker.icon = myiconOver;
        //console.log("Leaflet Click",args);
      });
      $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
         //$scope.markerNs.click = false;
        var thisName = args.markerName;
        var thisMarker = $scope.markers[args.markerName];
        if(thisMarker != lastClickMarker){
          thisMarker.icon = myicon;
        }
      });
    }

    $scope.$on('leafletDirectiveMap.geojsonMouseover', areaMouseover);
    $scope.$on('leafletDirectiveMap.geojsonMouseout', areaMouseout);
    $scope.$on('leafletDirectiveMap.geojsonClick', areaClick);

    
    $scope.myscope.registerDialog = function(type) {
      var modalInstance = $modal.open({
        templateUrl:'views/register.html',
        controller: 'registerDialogController',
        size: 'md',
        resolve: {
          data: function() {
            return {
              type: type,
              vsId: $scope.myscope.currentVsTab.vsId,
              vsName: $scope.myscope.currentVsTab.vsName, 
            };
          }   
        }   
      }); 
      modalInstance.result.then(function(result){
        console.log('send',result);
        //$http.post('/account/edit_user', { _id: chid, permission:perm }).success( function(err){ 
        //  if (err) {
        //    console.log(err);
        //  }        
        //  else {
        //    $route.reload();
        //  }   
        //});  
      }); 
    };  

}])

.controller('registerDialogController',
  ['$scope', '$modalInstance','data', function($scope, $modalInstance, data) {
  $scope.title = 'title';
  $scope.type = data.type;
  $scope.errors = '';
  //console.log(data);
  $scope.content = {
    type: data.type,
    votestat: data.vsName, 
    vsid: data.vsId,
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
    'name':'名字',
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
    //console.log('scope.content',$scope.content);
    var errors = []; 

    if($scope.content.register.$invalid){
      var register = $scope.content.register;
      for(var item in textItem){
        if(register[item].$error.required){
          errors.push('請填寫您的'+textItem[item]);
          //$scope.content.register 
        }
        if(register[item].$error.email){
          errors.push('您的'+textItem[item]+'格式不符');
          //$scope.content.register 
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
//.directive("supplementVerify", function() {
//  return {
//    require: "ngModel",
//    scope: { supplementVerify: '=' },
//    link: function(scope, element, attrs, ctrl) {
//      scope.$watch(function() {
//          return scope.supplementVerify;
//      }, function(data) {
//        console.log(data[1]);
//        ctrl.$parsers.unshift(function(viewValue) {
//          if (data[0] != 'supplement' ) {
//            ctrl.$setValidity("supplementVerify", true);
//            return undefined;
//          }
//          else if(!$.isEmptyObject(data[1])){
//            ctrl.$setValidity("supplementVerify", true);
//            console.log('valid');
//            return data[1];
//          }
//          else{
//            ctrl.$setValidity("supplementVerify", false);
//            return undefined;
//          }
//        });                                                                                            
//      });
//    }
//  };
//});



