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
  ['$scope', '$route', '$routeParams','$http', '$q', '$filter', '$modal', '$window', 'leafletData', 'voteInfoService',
  function ($scope, $route, $routeParams, $http, $q, $filter, $modal, $window, leafletData, voteInfoService ) {
    $scope.myscope = {};
    //$scope.voteInfos = {};
    //$scope.myscope.mapLoadingComplete = false;
    $scope.myscope.mapLoadingStatus = false;
    var county = $routeParams.county;
    var lastClickLayer = null; 
    var lastClickMarker = null;
    var currentClickMarkerIndex = 0;
    var geojsonBuffer = [];
    $scope.myscope.voteStatData = null;
    $scope.myscope.showVS = null;
    $scope.myscope.currentVsTab = {}; //local
    $scope.myscope.currentTownTab = ''; //local
    $scope.myscope.vsInfo = {};
    $scope.myscope.supplementItem = voteInfoService.supplementItem;
    $scope.myscope.volCount = voteInfoService.volCount;

    $scope.myscope.spPeopleMore = false;
    $scope.myscope.hpPeopleMore = false;

    //$scope.myscope.mapclass = 'map_short';
    
    $scope.myscope.spPeopleClick = function(){
      $scope.myscope.spPeopleMore = !$scope.myscope.spPeopleMore;
    }

    $scope.myscope.hpPeopleClick = function(){
      $scope.myscope.hpPeopleMore = !$scope.myscope.hpPeopleMore;
    }

    $scope.leafletData = leafletData;
    //$scope.taiwan = MAP_DEFAULT_VIEW[county];

    //console.log('maxbounds',$scope.maxbounds);


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
      console.log(geojsonBuffer.length);
      console.log(jsonArray.length);
      $scope.myscope.mapLoadingStatus = 0.2 + ((geojsonBuffer.length - jsonArray.length)/geojsonBuffer.length) * 0.8
      if(!json){
        $scope.myscope.mapLoadingStatus = 1.0;
        $( ".myLoading" ).fadeOut( "slow", function() {
          $(".myLoading").remove();
        });
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
          console.log('scope geojson add json',
            json.features[0].properties.town, 
            json.features[0].properties.village, 
            json
          );
          localGeojson.addData(json);
          setTimeout(function(){
            applyGeojson(jsonArray.slice(1));
          },voteInfoService.MAP_BUFFER_TIME);
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
      var townName = leafletEvent.target.feature.properties.town;
      var villageName = leafletEvent.target.feature.properties.village;
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
      lastClickLayer = layer; 

//      $scope.leafletData.getMap().then(function(map){
//        console.log('layer boundary',layer.getBounds());
//        map.fitBounds(layer.getBounds());
//      });
      //var max_of_array = Math.max.apply(Math, array);
      //setMapScale(layer);
    }
    
    $scope.myscope.setCurrentAreaClick = function(townName, villageName){
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

      $scope.leafletData.getMap().then(function(map){
        var bound = [];
        if(lastClickLayer){
          var layerBound = lastClickLayer.getBounds();
          bound.push({lat: layerBound._northEast.lat, lng: layerBound._northEast.lng}); 
          bound.push({lat: layerBound._southWest.lat, lng: layerBound._southWest.lng});
        }
        for(var i=0; i< markerArray.length;i++){
          bound.push({
            lat: markerArray[i].vsobj.lat,
            lng: markerArray[i].vsobj.lng,
          });  
        }
        if(bound.length > 0){
          map.fitBounds(bound);
        }
      });
    }
  

    $scope.myscope.setCurrentMarkerClick = function(markerName, tomarker){

      $scope.myscope.spPeopleMore = false;
      $scope.myscope.hpPeopleMore = false;

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
      //console.log('drawVoteStation');
      var mymarkers = {};
      lastClickMarker = null;
      angular.forEach(markerArray, function(marker) {
        var mcount = marker.vscount;  
        mymarkers[marker.vsid] = {
          draggable: true, //TODO
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


      $scope.$on('leafletDirectiveMarker.dragend', function(e, args) { //TODO
        var thisName = args.markerName;
        var thisMarker = $scope.markers[args.markerName];
        $scope.myscope.markerlatlng = [thisMarker.lat.toFixed(9),thisMarker.lng.toFixed(9)].join(',');
        //console.log('marker drag',thisMarker.lat.toFixed(9),thisMarker.lng.toFixed(9));
        //$scope.myscope.setCurrentMarkerClick(args.markerName);
      });

      $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        //console.log('marker mouse click');
        $scope.myscope.setCurrentMarkerClick(args.markerName);
      });

      $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
        //console.log('marker mouse over');
        var thisMarker = $scope.markers[args.markerName];
        //console.log('thisMarker',thisMarker);
        thisMarker.icon = thisMarker.myicons['d'];
      });

      $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
        //console.log('marker mouse out');
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
        //loadData(false);
        $scope.$emit('dataReload');
      }); 

    };  




    function loadData(firsttime){
      voteInfoService.resetDynamics(county);

      if(firsttime){
        voteInfoService.getStaticVillageData(county).then(
          function(data){
            //console.log('mapLoadingComplete');
            //$( ".myLoading" ).fadeOut( "slow", function() {
            //  // Animation complete.
            //  $(".myLoading").remove();
            //});
            //checkHeight();
            //console.log('mapLoadingStatus',$scope.myscope.mapLoadingStatus);
            applyGeojsonAll();
          },
          function() {}, 
          function(data){ 

            $scope.myscope.mapLoadingStatus = data.loadingStatus*0.2;
            if(!jQuery.isEmptyObject(data.villageArea) ){
              data.villageArea.features[0].properties.mycolor = mycolor(data.villageSum);

              geojsonBuffer.push(data.villageArea);
              //applyGeojson(data.villageArea);
              //console.log('areaDraw',data.villageArea,
              //  data.villageArea.features[0].properties.town,
              //  data.villageArea.features[0].properties.village
              //);
            }
            //console.log('mapLoadingStatus',$scope.myscope.mapLoadingStatus);

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
              //console.log('voteStatData Change 2');
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

                var lTownName = layer.feature.properties.town;
                var lVillageName = layer.feature.properties.village;
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

    

    $scope.defaults = {
      zoomControlPosition: 'bottomright',
      minZoom: MAP_MIN_ZOOM[county],
    };

    $scope.maxbounds = {
      northEast: MAP_DEFAULT_BOUND[county][0],
      southWest: MAP_DEFAULT_BOUND[county][1],
    }; 
    $scope.leafletData.getMap().then(function(map){
        map.fitBounds(MAP_DEFAULT_BOUND[county]);
      //console.log('map',map);
    });



    loadData(true);
    $scope.$on('dataReload',function(){
       console.log('map load data');
       loadData(false);
    });



    //function checkHeight() {
    //    console.log('check height');
    //    if ($window.innerHeight <= 600) {

    //        angular.element('#map_main').removeClass('map_tall');
    //        angular.element('#map_main').addClass('map_short');
    //        angular.element('#map_sidebar').removeClass('map_tall')
    //        angular.element('#map_sidebar').addClass('map_short');

    //        //console.log('map_main',angular.element('#map_main').attr('class'))
    //    }
    //    else if ($window.innerHeight > 600) {
    //        //$scope.myscope.mapclass = 'map_tall';
    //        //console.log('large', $scope.myscope.mapclass);
    //        angular.element('#map_main').removeClass('map_short');
    //        angular.element('#map_main').addClass('map_tall');
    //        angular.element('#map_sidebar').removeClass('map_short');
    //        angular.element('#map_sidebar').addClass('map_tall');

    //        //console.log('map_main',angular.element('#map_main').attr('class'))
    //        //$('#map_main').removeClass('map_short');
    //        //$('#map_main').addClass('map_tall');
    //        //$('#map_sidebar').removeClass('map_short');
    //        //$('#map_sidebar').addClass('map_tall');
    //    }
    //}

    //angular.element(document).ready(function() {
    //  console.log("onload");
    //  angular.element($window).bind('resize',checkHeight);  
    //  checkHeight();
    //});
    angular.extend($scope, {
        layers: {
            baselayers: {
                //googleTerrain: {
                //    name: 'Google Terrain',
                //    layerType: 'TERRAIN',
                //    type: 'google'
                //},
                //googleHybrid: {
                //    name: 'Google Hybrid',
                //    layerType: 'HYBRID',
                //    type: 'google'
                //},
                googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                }
            }
        }
    });


}]);

