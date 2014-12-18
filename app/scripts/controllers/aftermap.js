'use strict';

/* global $ */

var DEFAULT_COUNTY = 'TPE-4';
var MAP_RELOAD_TIME = 10000;



var MAP_DEFAULT_BOUND = {
  'TPE-4':[{lat: 25.1151655, lng:121.6659156}, {lat: 25.0122295, lng:121.5521896}],
  'TPQ-1':[{lat: 25.3011330, lng:121.6195265}, {lat: 25.0287778, lng:121.2826487}],
  'TPQ-6':[{lat: 25.0398178, lng:121.4895901}, {lat: 25.0034634, lng:121.4451953}],
};


var MAP_MIN_ZOOM = {
  'TPE-4':13,
  'TPQ-1':11,
  'TPQ-6':14,
};


/**
 * @ngdoc function
 * @name projectVApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('AftermapCtrl',
  ['$scope', '$route', '$routeParams','$http', '$q', '$filter', '$modal', '$window', '$location', 'leafletData', 'voteInfoService',
  function ($scope, $route, $routeParams, $http, $q, $filter, $modal, $window, $location, leafletData, voteInfoService ) {
    $scope.parseInt = parseInt;
    $scope.myscope = {};
    $scope.myscope.mapLoadingComplete = false;
    $scope.myscope.mapLoadingStatus = false;
    var county = $routeParams.county;
    var lastClickLayer = null;
    var lastClickMarker = null;
    var currentClickMarkerIndex = 0;
    var geojsonBuffer = [];
    var lastLoadTime = new Date().getTime();
    $scope.myscope.county = county;
    //$scope.myscope.voteStatData = null;
    $scope.myscope.showVS = null;
    $scope.myscope.currentVsTab = {}; //local
    $scope.myscope.currentTownTab = ''; //local
    $scope.myscope.currentVillTab = ''; //local

    $scope.myscope.afterStat = [];
    $scope.myscope.afterStatInfo = {};
    $scope.myscope.afterCount = {};
    $scope.myscope.townList = [];

    //$scope.myscope.vsInfo = {};
    //$scope.myscope.supplementItem = voteInfoService.supplementItem;
    //$scope.myscope.volCount = voteInfoService.volCount;
    //$scope.myscope.villList = [];

    //$scope.myscope.spPeopleMore = false;
    //$scope.myscope.hpPeopleMore = false;

    //$scope.myscope.spPeopleClick = function(){
    //  $scope.myscope.spPeopleMore = !$scope.myscope.spPeopleMore;
    //}

    //$scope.myscope.hpPeopleClick = function(){
    //  $scope.myscope.hpPeopleMore = !$scope.myscope.hpPeopleMore;
    //}

    $scope.leafletData = leafletData;


    var myiconArray = (function genIcon(){
      var iconSize = [60, 100];
      var shadowSize = [30, 10];
      var iconAnchor = [iconSize[0]/2, iconSize[1]];
      var shadowAnchor = [shadowSize[0]/2, shadowSize[1]/2];
      var icon_count = ['1','2','3'];
      var icon_type = ['x','c','d'];
      var icon_result_temp = {};
      angular.forEach(icon_count, function(count){
        icon_result_temp[count] = {};
        angular.forEach(icon_type, function(type){
          icon_result_temp[count][type] = {
            iconSize: iconSize,
            iconAnchor: iconAnchor ,
            iconUrl: 'images/map'+type+count+'.svg',
            shadowSize: shadowSize,
            shadowAnchor: shadowAnchor,
            shadowUrl: 'images/map_icon_shadow.svg',
          };
        });
      });
      //console.log('icon_result_temp',icon_result_temp);
      return icon_result_temp;
    })();

    if(!(county in MAP_DEFAULT_BOUND)) {
      county = DEFAULT_COUNTY;
    }

    function applyGeojsonAll(){
      applyGeojson(geojsonBuffer);
    }

    function applyGeojson(jsonArray) {
      var json = jsonArray[0];
      //console.log(geojsonBuffer.length);
      //console.log(jsonArray.length);
      $scope.myscope.mapLoadingStatus = 0.2 + ((geojsonBuffer.length - jsonArray.length)/geojsonBuffer.length) * 0.8
      if(!json){
        $scope.myscope.mapLoadingStatus = 1.0;
        $( ".myLoading" ).fadeOut( "slow", function() {
          $(".myLoading").remove();
          if(county!= 'TPE-4'){
            $("#mroute-TPE-4").css({visibility:'visible'});
          }
          if(county!= 'TPQ-6'){
            $("#mroute-TPQ-6").css({visibility:'visible'});
          }
          if(county!= 'TPQ-1'){
            $("#mroute-TPQ-1").css({visibility:'visible'});
          }
        });
        $scope.myscope.mapLoadingComplete = true;

        //$scope.$emit('mapLoadingComplete');
        return;
      }
      if (!$scope.geojson) {
        //console.log('scope geojson create');
        $scope.geojson = {
          data: json,
          style: style,
          resetStyleOnMouseout: false
        };
        setTimeout(function(){
          applyGeojson(jsonArray.slice(1));
        },voteInfoService.MAP_BUFFER_TIME);
      }
      else {
        //console.log('scope geojson add');
        $scope.leafletData.getGeoJSON().then(function(localGeojson) {
          //console.log('scope geojson add json',
          //  json.features[0].properties.town,
          //  json.features[0].properties.village,
          //  json
          //);
          localGeojson.addData(json);
          setTimeout(function(){
            applyGeojson(jsonArray.slice(1));
          },voteInfoService.MAP_BUFFER_TIME);
        });
      }
    }


    var mycolor = function(villsum){
      //console.log('villsum',villsum);
      if(villsum == null){
          return '#333333';
      }
      else{
        if( villsum >= 1){
          return '#770000';
        }
        else if(villsum > 0.75){
          return '#882222';
        }
        else if(villsum > 0.5){
          return '#994444';
        }
        else if(villsum > 0.25){
          return '#aa6666';
        }
        else if(villsum > 0){
          return '#bb8888';
        }
        else{
          return '#bbbbbb';
        }
      }
    };

    var mycount = function(vscount){
      if( vscount > 0.66){
        return 3;
      }
      else if(vscount > 0.33){
        return 2;
      }
      else{
        return 1;
      }
    };

    $scope.myscope.getVoteStatImg = function(vscount){
      if( ! $scope.myscope.showVS ){
        return 1;
      }
      else {
        return 2;
      }
      //else if( $scope.myscope.showVS ){
      //  return mycount(($scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].volunteer+
      //    $scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].supplement)*0.5);
      //}
      //else{
      //  return 1;
      //}
    }





    function style(feature) {
      return {
        opacity: 1,
        weight: 2,
        color: 'black',
        dashArray: '6',
        fillOpacity: 0.5,
        fillColor: feature.properties.mycolor,
        className: 'county transparent'
      };
    }


    var mouse_over_style = {
        weight: 6,
        color: 'white',
    };

    var mouse_leave_style = {
        weight: 2,
        color: 'black',
    };

    function gen_area_color(color){
        return { fillColor: color };//getColor(feature),
    }

    function set_area_color(layer){
      var mycolor = layer.feature.properties.mycolor;
       return {
         fillColor: mycolor,
       };
    }

    function set_unclick_style(){
        return {
          weight: 2,
          color: 'black',
          dashArray: '6',
        };
    }

    function set_click_style(){
       //return gen_area_color("#ffff00");
        return {
          weight: 6,
          color: 'yellow',
          dashArray: '0',
        };
    }


    // Mouse over function, called from the Leaflet Map Events
    function areaMouseover(ev, leafletEvent) {
      var layer = leafletEvent.target;
      if(layer != lastClickLayer){
        layer.setStyle(mouse_over_style);
        layer.bringToFront();
        if(lastClickLayer){
          lastClickLayer.bringToFront();
        }
      }
      //layer.setStyle(mouse_over_style);
    }

    function areaMouseout(ev, leafletEvent) {
      var layer = leafletEvent.target;
      if(layer != lastClickLayer){
        layer.setStyle(mouse_leave_style);
        layer.bringToFront();
        if(lastClickLayer){
          lastClickLayer.bringToFront();
        }
      }
    }


    function areaClick(ev, featureSelected, leafletEvent) {
      //$scope.$emit('dataReload');
      var townName = leafletEvent.target.feature.properties.town;
      var villageName = leafletEvent.target.feature.properties.village;
      var layer = leafletEvent.target;
      areaClickSub(townName,villageName,layer);
      setTimeout(function(){$("#map_sidebar_village").scrollTo('#count_'+townName+'_'+villageName);},0);
      //showCurrentVillageVotestat(townName,villageName,0);
    }

    function areaClickSub(townName,villageName,layer){
      $scope.myscope.setVillTab(townName, villageName);
      if(lastClickLayer){
        lastClickLayer.setStyle(set_unclick_style());
      }
      layer.setStyle(set_click_style());
      layer.bringToFront();
      lastClickLayer = layer;
    }

    $scope.myscope.setCurrentAreaClick = function(townName, villageName){
      //$scope.$emit('dataReload');
      $scope.leafletData.getGeoJSON().then(function(localGeojson) {
        var geoLayers = localGeojson.getLayers();
        angular.forEach(geoLayers,function(layer) {
          var lTownName = layer.feature.properties.town;
          var lVillageName = layer.feature.properties.village;
          if(townName == lTownName  && villageName == lVillageName){
            areaClickSub(townName,villageName,layer);
          }
        });
      });
      //showCurrentVillageVotestat(townName,villageName,0)
    };

    function showStation(){
      $scope.markers = {};
      var markerArray = [];
      var currentVsId = 0;
      //console.log('afterStat',$scope.myscope.afterStat);
     
      angular.forEach($scope.myscope.afterStat,function(vsid) {
          //console.log('vsid',vsid);
          //console.log('afterStatInfo',$scope.myscope.afterStatInfo[vsid]);
          markerArray.push({
            'vsid':vsid,
            'vspos': markerArray.length,
            //'vscount': mycount(($scope.myscope.vsInfo[votestat.id].volunteer+$scope.myscope.vsInfo[votestat.id].supplement)*0.5),
            'vsobj': {
              lat: $scope.myscope.afterStatInfo[vsid].latlng.latitude,
              lng: $scope.myscope.afterStatInfo[vsid].latlng.longitude,
            },
          });
      });
      if(markerArray.length > 0){
        //console.log('drawStation');
        drawStation(markerArray);
      //  $scope.myscope.setCurrentMarkerClick(currentVsId, false, false);
      }

    }


    $scope.myscope.setCurrentMarkerClick = function(markerName, tomarker){

      //$scope.myscope.showVS = true;
      //$scope.myscope.spPeopleMore = false;
      //$scope.myscope.hpPeopleMore = false;

      var thisMarker = $scope.markers[markerName];
      currentClickMarkerIndex = thisMarker.mypos;
      setVotestatTab(markerName);

      if(lastClickMarker){
         lastClickMarker.icon = lastClickMarker.myicons['x']
      }
      thisMarker.icon = thisMarker.myicons['c'];
      lastClickMarker = thisMarker;
      if(tomarker){
        $scope.leafletData.getMap().then(function(map){
          //console.log('thisMarker',thisMarker);
          if(map.getZoom() < 16){
            map.setView({lat:thisMarker.lat,lng:thisMarker.lng},16);
          }
          else{
            map.setView({lat:thisMarker.lat,lng:thisMarker.lng});
          }

        });
      }
    };

    $scope.myscope.setTownTab = function(townName){
      $scope.myscope.currentTownTab = townName;
      $scope.myscope.currentVillTab = '';
      if(lastClickLayer){
        lastClickLayer.setStyle(set_unclick_style());
        lastClickLayer = null;
      }
    };


    $scope.myscope.setVillTab = function(townName, villName){
      //console.log('setVillTab',townName,villName);
      $scope.myscope.currentTownTab = townName;
      $scope.myscope.currentVillTab = villName;
    };


    $scope.myscope.isCurrentTownTab = function(townName){
      if($scope.myscope.currentTownTab == townName){
        return "bg-primary";
      }
      else{
        return "";
      }
    };

    $scope.myscope.isCurrentVillTab= function(townName,villName){
      if($scope.myscope.currentTownTab == townName && $scope.myscope.currentVillTab == villName){
        return "map_sidebar_villlclick";
      }
      else{
        return "";
      }
    };





    function setVotestatTab(vsId){
      $scope.myscope.showVS = true;
      $scope.myscope.currentVsTab.vsId = vsId;
    }

    $scope.debug = function() {
      // debugger;
    };

    $scope.myscope.back = function() {
      //$scope.$emit('dataReload');
      $scope.myscope.showVS = null;
      if(lastClickMarker){
         lastClickMarker.icon = lastClickMarker.myicons['x']
      }
      lastClickMarker = null;
      currentClickMarkerIndex = 0;
      if(lastClickLayer){
        lastClickLayer.setStyle(set_unclick_style());
        lastClickLayer = null;
      }
      $scope.leafletData.getMap().then(function(map){
        map.fitBounds(MAP_DEFAULT_BOUND[county]);
      });
    };

    function drawStation(markerArray) {
      var mymarkers = {};
      lastClickMarker = null;
      angular.forEach(markerArray, function(marker) {
        //var mcount = marker.vscount;
        mymarkers[marker.vsid] = {
          draggable: false, //TODO
          lat: marker.vsobj.lat,
          lng: marker.vsobj.lng,
          icon: myiconArray[2]['x'],
          myicons: myiconArray[2],
          mypos: marker.vspos,
          //myloc: marker.townName + '-' + marker.villageName,
          myid: marker.vsid
        };
      });
      angular.extend($scope, {
        markers: mymarkers,
      });

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        $scope.myscope.setCurrentMarkerClick(args.markerName,true);
      });
      $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
        var thisMarker = $scope.markers[args.markerName];
        thisMarker.icon = thisMarker.myicons['d'];
      });

      $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
        var thisName = args.markerName;
        var thisMarker = $scope.markers[args.markerName];
        if(thisMarker != lastClickMarker){
          thisMarker.icon = thisMarker.myicons['x'];
        }
        else{
          thisMarker.icon = thisMarker.myicons['c'];
        }
      });
    }

    $scope.$on('leafletDirectiveMap.geojsonMouseover', areaMouseover);
    $scope.$on('leafletDirectiveMap.geojsonMouseout', areaMouseout);
    $scope.$on('leafletDirectiveMap.geojsonClick', areaClick);

    $scope.myscope.registerDialog = function() {
      var modalInstance = $modal.open({
        templateUrl:'views/afterreg.html',
        controller: 'AfterregCtrl',
        size: 'md',
        resolve: {
          data: function() {
            return {
              county: county,
              //type: 'volunteer',
              nonArea: false,
              vsId: $scope.myscope.currentVsTab.vsId,
              vsName: $scope.myscope.afterStatInfo[$scope.myscope.currentVsTab.vsId].name,
            };
          }
        }
      });
      modalInstance.result.then(function(result){
        $location.path('/');
      });
    };

    $scope.myscope.reportDialog = function() {
      var modalInstance = $modal.open({
        templateUrl:'views/report.html',
        controller: 'ReportCtrl',
        size: 'md',
        resolve: {
          data: function() {
            return {
              county: county,
              vsId: $scope.myscope.currentVsTab.vsId,
              vsName: '',
            };
          }
        }
      });
      modalInstance.result.then(function(result){
      });
    };





    function loadData(firsttime){
      voteInfoService.resetDynamics(county);
      voteInfoService.getAfterStatVillageData(county).then(
        function(data){
          $scope.myscope.afterCount = data.afterCount;
          $scope.myscope.townList = Object.keys($scope.myscope.afterCount);
          $scope.myscope.setTownTab($scope.myscope.townList[0]);
          //console.log('afterCount',$scope.myscope.afterCount);
          if(data.county = county){
            applyGeojsonAll();
          }
        },
        function() {},
        function(data){
          if(data.county = county){
            //console.log('county',county);
            $scope.myscope.mapLoadingStatus = data.loadingStatus*0.2;
            if(!jQuery.isEmptyObject(data.villageArea) ){
              data.villageArea.features[0].properties.mycolor = mycolor(data.villageSum.count/(data.villageSum.maxCount));
              geojsonBuffer.push(data.villageArea);
            }
          }
          else{
          }
        });

      $q.all([
        voteInfoService.getAfterStatData(county)
        ]).then(function(data){
          //console.log(data[0]);
          $scope.myscope.afterStat = data[0]['statList'];
          $scope.myscope.afterStatInfo = data[0]['statInfo'];
          //console.log('statInfo',$scope.myscope.afterStatInfo);
          showStation();
      });
    };





    $scope.defaults = {
      zoomControlPosition: 'bottomright',
      scrollWheelZoom: false,
      minZoom: MAP_MIN_ZOOM[county],
    };

    $scope.maxbounds = {
     // northEast: MAP_DEFAULT_BOUND[county][0],
     // southWest: MAP_DEFAULT_BOUND[county][1],
    };
    $scope.leafletData.getMap().then(function(map){
        map.fitBounds(MAP_DEFAULT_BOUND[county]);
    });



    loadData(true);
    $scope.$on('dataReload',function(){
      var curTime = new Date().getTime();
      if( curTime - lastLoadTime > MAP_RELOAD_TIME){
        lastLoadTime = curTime;
        $scope.$emit('missionDataReload');
        //console.log('dataReload');
        loadData(false);
      }
    });



    angular.extend($scope, {
        layers: {
            baselayers: {
                googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                }
            }
        }
    });

}]);

