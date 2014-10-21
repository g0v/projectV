'use strict';

/* global $ */

var DEFAULT_COUNTY = 'TPE-4';

//var MAP_DEFAULT_VIEW = {
//  'TPE-4':{lat: 25.0666313, lng: 121.5943403, zoom: 13},
//  'TPQ-1':{lat: 25.1752044, lng: 121.4813232, zoom: 12},
//  'TPQ-6':{lat: 25.0260396, lng: 121.4654445, zoom: 14},
//};


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
  .controller('MapCtrl',
  ['$scope', '$route', '$routeParams','$http', '$q', '$filter', '$modal', 'leafletData', 'voteInfoService',
  function ($scope, $route, $routeParams, $http, $q, $filter, $modal, leafletData, voteInfoService ) {
    $scope.myscope = {};
    //$scope.voteInfos = {};
    //$scope.myscope.mapLoadingComplete = false;
    $scope.myscope.mapLoadingStatus = false;
    var county = $routeParams.county;
    var lastClickLayer = null; 
    var lastClickMarker = null;
    var currentClickMarkerIndex = 0;
    $scope.myscope.voteStatData = null;
    $scope.myscope.showVS = null;
    $scope.myscope.currentVsTab = {}; //local
    $scope.myscope.currentTownTab = ''; //local
    $scope.myscope.vsInfo = {};
    $scope.myscope.supplementItem = voteInfoService.supplementItem;
    $scope.myscope.volCount = voteInfoService.volCount;

    $scope.leafletData = leafletData;
    //$scope.taiwan = MAP_DEFAULT_VIEW[county];

    $scope.defaults = {
      zoomControlPosition: 'bottomright',
      minZoom: MAP_MIN_ZOOM[county],
    };
    $scope.maxbounds = {
      northEast: MAP_DEFAULT_BOUND[county][0],
      southWest: MAP_DEFAULT_BOUND[county][1],
    }; 
    console.log('maxbounds',$scope.maxbounds);


    var myiconArray = (function genIcon(){
      var iconSize = [90, 150];
      var iconAnchor = [iconSize[0]/2, iconSize[1]];
      var icon_count = ['1','2','3'];
      var icon_type = ['x','c','d'];
      var icon_result_temp = {};
      angular.forEach(icon_count, function(count){
        icon_result_temp[count] = {};
        angular.forEach(icon_type, function(type){
          icon_result_temp[count][type] = {
            iconSize: iconSize,
            iconUrl: 'images/map'+type+count+'.svg',
            iconAnchor: iconAnchor 
          };
        }); 
      });
      //console.log('icon_result_temp',icon_result_temp);
      return icon_result_temp;
    })();

    if(!(county in MAP_DEFAULT_BOUND)) {
      county = DEFAULT_COUNTY;
    }

    function applyGeojson(json) {
      if (!$scope.geojson) {
        console.log('scope geojson create');
        $scope.geojson = {
          data: json,
          style: style,
          resetStyleOnMouseout: false 
        };
      } else {
        console.log('scope geojson add');
        $scope.leafletData.getGeoJSON().then(function(localGeojson) {
          console.log('scope geojson add json',
            json.features[0].properties.TOWNNAME, 
            json.features[0].properties.VILLAGENAM, 
            json
          );
          localGeojson.addData(json);
        });
      }
    }


    var mycolor = function(villsum){
      if( villsum >= 1){
        return '#990000';
      }
      else if(villsum > 0.5){
        return '#993333';
      }
      else if(villsum > 0){
        return '#aa6666';
      }
      else{
        return '#aaaaaa';
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
      else if( $scope.myscope.showVS.vsArray.length == 0){
        return 3;
      }
      else if( $scope.myscope.showVS ){
        return mycount(($scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].volunteer+
          $scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].supplement)*0.5);
      }
      else{
        return 1;
      }
    }



    function style(feature) {
      return {
        opacity: 1,
        weight: 2,
        color: 'black',
        dashArray: '6',
        fillOpacity: 0.7,
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
      var townName = leafletEvent.target.feature.properties.TOWNNAME;
      var villageName = leafletEvent.target.feature.properties.VILLAGENAM;
      var layer = leafletEvent.target;
      areaClickSub(townName,villageName,layer);
      showCurrentVillageVotestat(townName,villageName,0);
    }

    function areaClickSub(townName,villageName,layer){
      if(lastClickLayer){
        lastClickLayer.setStyle(set_unclick_style());
      }
      layer.setStyle(set_click_style());
      layer.bringToFront();
      //console.log('layer',layer);//TODO
      lastClickLayer = layer; 
      $scope.leafletData.getMap().then(function(map){
        //console.log(layer.getBounds());
        map.fitBounds(layer.getBounds());
      });
      //var max_of_array = Math.max.apply(Math, array);
      //setMapScale(layer);
    }
    
    $scope.myscope.setCurrentAreaClick = function(townName, villageName){
      $scope.leafletData.getGeoJSON().then(function(localGeojson) {
        var geoLayers = localGeojson.getLayers(); 
        angular.forEach(geoLayers,function(layer) {
          var lTownName = layer.feature.properties.TOWNNAME;
          var lVillageName = layer.feature.properties.VILLAGENAM;
          if(townName == lTownName  && villageName == lVillageName){
            areaClickSub(townName,villageName,layer);
          }
        });
      });
      showCurrentVillageVotestat(townName,villageName,0)
    };

    function showCurrentVillageVotestat(townName, villageName, currentPos){
      $scope.myscope.showVS = {};
      $scope.myscope.showVS.townName = townName;
      $scope.myscope.showVS.villageName = villageName;
      $scope.myscope.showVS.vsArray = [];
      $scope.markers = {};
      var markerArray = [];
      var currentVsId = 0;

      //var query0 = 'json/votestatInfo/' + county + '.json';
      //$scope.myscope.vsInfo = res0.data; //TODO need to optimize
      angular.forEach($scope.myscope.voteStatData[townName],function(votestat) {
        var vsIndex = votestat.neighborhood.indexOf(villageName);
        if(vsIndex != -1){
          $scope.myscope.showVS.vsArray.push({
            'name':votestat.name,
            'id':votestat.id,
          });
          if(markerArray.length == currentPos){
            currentVsId = votestat.id;
          }
          markerArray.push({
            'vsid':votestat.id,
            'townName': townName,
            'villageName': villageName,
            'vspos': markerArray.length,
            'vscount': mycount(($scope.myscope.vsInfo[votestat.id].volunteer+$scope.myscope.vsInfo[votestat.id].supplement)*0.5),
            'vsobj': {
              lat: votestat.location.lat,
              lng: votestat.location.lng,
            },
          });
        }
      });
      if(markerArray.length > 0){
        drawVoteStation(markerArray);
        $scope.myscope.setCurrentMarkerClick(currentVsId);
      }
    }
  

    $scope.myscope.setCurrentMarkerClick = function(markerName, tomarker){
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
          console.log('thisMarker',thisMarker);
          map.setView({lat:thisMarker.lat,lng:thisMarker.lng}); 
        });
      }
    };

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

    function setVotestatTab(vsId){
      $scope.myscope.currentVsTab.vsId = vsId;
      $scope.myscope.currentVsTab.vsName = (function(){ 
        for( var i =0; i < $scope.myscope.showVS.vsArray.length; i++){
          var vsobj = $scope.myscope.showVS.vsArray[i];
          if(vsobj.id == vsId){
            return vsobj.name;
          }};
      })();
    }

    $scope.debug = function() {
      // debugger;
    };

    $scope.myscope.back = function() {
      $scope.myscope.showVS = null;
      currentClickMarkerIndex = 0;
      $scope.markers = {};
      if(lastClickLayer){
        lastClickLayer.setStyle(set_unclick_style());
        lastClickLayer = null;
      }
      $scope.leafletData.getMap().then(function(map){
        map.fitBounds(MAP_DEFAULT_BOUND[county]);
      });
    };

    function drawVoteStation(markerArray) {
      console.log('drawVoteStation');
      var mymarkers = {};
      lastClickMarker = null;
      angular.forEach(markerArray, function(marker) {
        var mcount = marker.vscount;  
        mymarkers[marker.vsid] = {
          lat: marker.vsobj.lat,
          lng: marker.vsobj.lng,
          icon: myiconArray[mcount]['x'],
          myicons: myiconArray[mcount],    
          mycount: mcount,
          mypos: marker.vspos,
          myloc: marker.townName + '-' + marker.villageName,
          myid: marker.vsid
        };
      });
      angular.extend($scope, {
        markers: mymarkers,
      });

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        console.log('marker mouse click');
        $scope.myscope.setCurrentMarkerClick(args.markerName);
      });

      $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
        console.log('marker mouse over');
        var thisMarker = $scope.markers[args.markerName];
        console.log('thisMarker',thisMarker);
        thisMarker.icon = thisMarker.myicons['d'];
      });

      $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
        console.log('marker mouse out');
         //$scope.markerNs.click = false;
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
    
    $scope.myscope.registerDialog = function(type) {
      var modalInstance = $modal.open({
        templateUrl:'views/register.html',
        controller: 'registerDialogController',
        size: 'md',
        resolve: {
          data: function() {
            return {
              county: county,
              type: type,
              vsId: $scope.myscope.currentVsTab.vsId,
              vsName: $scope.myscope.currentVsTab.vsName, 
              supCount: $scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].sItemCount,
              supWeight: $scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].vweight
            };
          }   
        }   
      }); 
      modalInstance.result.then(function(result){
        console.log('send',result);
        loadData(false);
      }); 
    };  



    function loadData(firsttime){
      voteInfoService.resetDynamics(county);

      if(firsttime){
        voteInfoService.getStaticVillageData(county).then(
          function(data){
            console.log('mapLoadingComplete');
            $( ".myLoading" ).fadeOut( "slow", function() {
              // Animation complete.
              $(".myLoading").remove();
            });
          
            console.log('mapLoadingStatus',$scope.myscope.mapLoadingStatus);
          },
          function() {}, 
          function(data){ 

            $scope.myscope.mapLoadingStatus = data.loadingStatus;
            if(!jQuery.isEmptyObject(data.villageArea) ){
              data.villageArea.features[0].properties.mycolor = mycolor(data.villageSum);
              applyGeojson(data.villageArea);
              console.log('areaDraw',data.villageArea,
                data.villageArea.features[0].properties.TOWNNAME,
                data.villageArea.features[0].properties.VILLAGENAM
              );
            }
            console.log('mapLoadingStatus',$scope.myscope.mapLoadingStatus);

          });
      }

      $q.all([voteInfoService.getAllVoteStatInfo(county), 
        voteInfoService.getAllVoteStatData(county), 
        voteInfoService.getAllVillageSum(county)]).then(function(data){

          $scope.myscope.vsInfo = data[0];
          $scope.myscope.voteStatData = data[1];
          $scope.myscope.villageSum = data[2];

          if(firsttime){
            $scope.myscope.currentTownTab = Object.keys($scope.myscope.villageSum)[0];
          }
          else{
            if($scope.myscope.showVS){
              console.log('voteStatData Change 2');
              showCurrentVillageVotestat(  
                $scope.myscope.showVS.townName, 
                $scope.myscope.showVS.villageName, 
                currentClickMarkerIndex
              ); 
            }

            $scope.leafletData.getGeoJSON().then(function(localGeojson) {
              var geoLayers = localGeojson.getLayers(); 
              angular.forEach(geoLayers,function(layer) {
                //console.log('setArea');

                var lTownName = layer.feature.properties.TOWNNAME;
                var lVillageName = layer.feature.properties.VILLAGENAM;
                layer.feature.properties.mycolor = mycolor($scope.myscope.villageSum[lTownName][lVillageName]);
                layer.setStyle(set_area_color(layer));
                if(lastClickLayer){
                  lastClickLayer.setStyle(set_click_style());
                }
              });
            });
          }
      });
    };
    

    $scope.myscope.reload = function(){
      loadData(false);
    };

    $scope.leafletData.getMap().then(function(map){
      map.fitBounds(MAP_DEFAULT_BOUND[county]);
      console.log('map',map);
    });
    
    
    loadData(true);
}]);

