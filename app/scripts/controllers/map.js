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
    var county = $routeParams.county;
    var voteStatData = null;
    $scope.myscope.showVS = null;
    $scope.myscope.currentVsTab = ''; //local
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
              iconUrl: 'http://fakeimg.pl/20x50/00dd00/?text=X',
              iconAnchor:   [10, 50]
               };

     var myiconOver = {
              iconUrl: 'http://fakeimg.pl/20x50/dddd00/?text=X',
              iconAnchor:   [10, 50]
               };

     var myiconClick = {
              iconUrl: 'http://fakeimg.pl/20x50/00dddd/?text=X',
              iconAnchor:   [10, 50]
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

    function style(feature) {
      return {
        fillColor: getColor(feature),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        className: 'county transparent'
      };
    }

    function applyGeojson(json) {
      if (!$scope.geojson) {
        $scope.geojson = {
          data: json,
          style: style,
          resetStyleOnMouseout: true
        };
      } else {
        $scope.leafletData.getGeoJSON().then(function(localGeojson) {
          localGeojson.addData(json);
        });
      }
      animate();
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

    // Mouse over function, called from the Leaflet Map Events
    function areaMouseover(ev, leafletEvent) {
      var layer = leafletEvent.target;
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });
      layer.bringToFront();
    }

    function areaClick(ev, featureSelected, leafletEvent) {
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
      if($scope.myscope.currentVsTab == vsId){
        return "bg-primary";
      }
      else{
        return "";
      }
    };

    $scope.myscope.setVotestatTab = function(vsId){
      $scope.myscope.currentVsTab = vsId;
      var query0 = 'json/votestatInfo/' + county + '.json';
      $http.get(query0).then(function(res0) {
        $scope.myscope.vsInfo = res0.data[vsId];
        //angular.forEach(voteInfo['投票狀況'], function(town, townName) {
        //  angular.forEach(town, function(village, villageName) {
        //    var query = 'json/twVillage1982/' + name + '/' + voteInfo['選區'][0] +
        //      '/' + townName + '/' + villageName + '.json';
        //    $http.get(query).then(function(res) {
        //      applyGeojson(res.data);
        //    },
        //    function() {
        //    });
        //  });
        //});
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
      //delete $scope.selectedDistrictName;
      //delete $scope.geojson;
      //applyGeojson($scope.districts);
      //$scope.taiwan = MAP_DEFAULT_VIEW[county];
    };


    voteInfoService.getAllVoteInfo(county).then(
      function() {},
      function() {},
      function(voteInfo) {
      //console.log('onload');
       if (!$scope.voteInfos) {
          $scope.voteInfos = {};
        }
        $scope.voteInfos[voteInfo.id] = voteInfo.content;
        var jsonPath = 'json/twVote1982/' + voteInfo.id + '.json';
        //console.log('get3',jsonPath);
        $http.get(jsonPath).then(function(res) {
          if (!$scope.districts) {
            $scope.districts = res.data;
          } else {
           $scope.districts.features.push(res.data.features[0]);
          }
         var name = voteInfo.id;
        drawDistrict($scope.voteInfos[name], name);
        });
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
       angular.forEach(markerArray, function(marker) {
          mymarkers[marker.vspos] = {
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
       $scope.markerNs = {};
       $scope.markerNs.click = false;

       $scope.$on('leafletDirectiveMarker.click', function(e, args) {
         var thisName = args.markerName;
         var thisMarker = $scope.markers[thisName];
         //thisMarker.icon = myiconOver;
         $scope.myscope.setVotestatTab(thisMarker.myid);
         //console.log("Leaflet Click",thisMarker.myid);
       });

       $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
         var thisName = args.markerName;
         var thisMarker = $scope.markers[thisName];
         thisMarker.icon = myiconOver;
         //console.log("Leaflet Click",args);
       });
       $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
          $scope.markerNs.click = false;
          $scope.markers[args.markerName].icon = myicon;
       });
    }

    $scope.$on('leafletDirectiveMap.geojsonMouseover', areaMouseover);
    $scope.$on('leafletDirectiveMap.geojsonClick', areaClick);

    
    $scope.myscope.registerDialog = function(type) {
      var modalInstance = $modal.open({
        templateUrl:'views/register.html',
        controller: 'registerDialogController',
        size: 'md',
        resolve: {
          type: function() {
            return type;//deleteBtn.closest('header').find('h2').html();
          }   
        }   
      }); 
      modalInstance.result.then(function(result){
        console.log('send');
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

}]);

var registerDialogController = function($scope, $modalInstance, type){
   // Define scope variales here, or ng-model in dialog won't work
   $scope.title = 'title';
   $scope.type = type;

   $scope.send = function () {
      $modalInstance.close(true);
   };

   $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
   };
};


