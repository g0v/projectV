'use strict';

var DEFAULT_COUNTY = 'TPE-4';

var MAP_DEFAULT_VIEW = {
  'TPE-4':{lat: 25.0666313, lng: 121.5943403, zoom: 13},
  'TPQ-1':{lat: 25.1752044, lng: 121.4813232, zoom: 12},
  'TPQ-6':{lat: 25.0260396, lng: 121.4654445, zoom: 14},
};


/**
 * @ngdoc function
 * @name mlymapApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the mlymapApp
 */
angular.module('mlymapApp')
  .controller('MapCtrl',
  ['$scope', '$routeParams','$http', '$q', '$filter', 'leafletData', 'voteInfoService',
  function ($scope, $routeParams, $http, $q, $filter, leafletData, voteInfoService) {
    var county = $routeParams.county;
    console.log('county',county);
    if(!(county in MAP_DEFAULT_VIEW)){
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
		
		//console.log('area1',area);
      var winner = voteInfoService.getWinner(area,county);
      var defaultColor = '#dd1c77';
		if (winner != undefined){
        if (winner.party === '中國國民黨') {
          if (winner.ratio > 40) {
            return '#045a8d';
          } 
				else if(winner.ratio > 35)  {
            return '#2b8cbe';
          }
			else {
            return '#74a9cf';
          }
        } else if(winner.party === '民主進步黨') {
          if (winner.ratio > 40) {
            return '#006d2c';
          } 
			 else if (winner.ratio > 35) {
            return '#2ca25f';
          } 
			 else {
            return '#66c2a4';
          }
        } else {
          return defaultColor;
        }
		} else {
        return defaultColor;
		}
		
    }

    function animate() {
      //setTimeout(function() {
        $('.county').each(function(i, el) {
          if (el.classList) {
            el.classList.remove('transparent');
          } else if (el.getAttribute && el.getAttribute('class')) {
            // workaround for IE 10
            el.setAttribute('class',
              el.getAttribute('class').replace('transparent', ''));
          }
        });
      //}, 100);
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
        }
      } else {
        $scope.leafletData.getGeoJSON().then(function(localGeojson) {
          localGeojson.addData(json);
        });
      }
      animate();
    };

    function drawDistrict(voteInfo, name) {
		//console.log('voteInfo',voteInfo['投票狀況']);
      angular.forEach(voteInfo['投票狀況'], function(town, townName) {
        angular.forEach(town, function(village, villageName) {
			 //console.log('get1', villageName);
          var query = 'json/twVillage1982/' + name + '/' + voteInfo['選區'][0] +
            '/' + townName + '/' + villageName + '.json';
          $http.get(query).then(function(res) {
            applyGeojson(res.data);
          },
			 function(err) {
				 //console.log('get1', townName,villageName);
				 //console.log('get1', err);
			 });
        })
      })
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
	    console.log('scope',leafletEvent);
    }

    function getWinnerByProperty(property) {
      var path = [];
      if (!property) {
        return '--'
      }

      //if ($scope.selectedDistrictName) {
		//console.log('property',property);	
        path.push(property.TOWNNAME,
          property.VILLAGENAM);
      //} else {
      //  path.push(property.county + '-' + property.number);
      //}

		//console.log('path',path);
      return voteInfoService.getWinner(path,county);
    }

    $scope.getWinnerName = function (property, showParty) {
	   //console.log('property',property);	
      var winner = getWinnerByProperty(property);
      if (typeof winner === 'string') {
        return winner;
      }

      var res = winner.name;
      if (showParty) {
        res += '（' + winner.party + '）';
      }
      return res;
    };

    $scope.getWinnerRatio = function (property, showPercent) {
      var winner = getWinnerByProperty(property);
      if (typeof winner === 'string') {
        return winner;
      }
      return $filter('number')(winner.count) + ' 票（' +
        $filter('number')(winner.ratio, 2) +  '%）';
    };

    $scope.debug = function() {
      debugger;
    };

    $scope.back = function() {
      //delete $scope.selectedDistrictName;
      //delete $scope.geojson;
      //applyGeojson($scope.districts);
      //$scope.taiwan = MAP_DEFAULT_VIEW[county];
    };

    $scope.leafletData = leafletData;
    $scope.taiwan = MAP_DEFAULT_VIEW[county];
    $scope.defaults = {
      zoomControlPosition: 'bottomright'
    };


	
    voteInfoService.getAllVoteInfo(county).then(
      function(res) {},
      function (error) {},
      function (voteInfo) {
			
		//console.log('onload');
        if (!$scope.voteInfos) {
          $scope.voteInfos = {};
        }
        $scope.voteInfos[voteInfo.id] = voteInfo.content;
        var jsonPath = 'json/twVote1982/' + voteInfo.id + '.json';
		  console.log('get3',jsonPath);
        $http.get(jsonPath).then(function(res) {
          if (!$scope.districts) {
            $scope.districts = res.data;
          } else {
           $scope.districts.features.push(res.data.features[0]);
          }
			 // applyGeojson(res.data);
			   var name = voteInfo.id;
				//console.log('scope',$scope.voteInfos);
				//console.log($scope.voteInfo);
				drawDistrict($scope.voteInfos[name], name);
        });
        drawVoteStation();
      });
      

      function drawVoteStation(){
         var myicon = {
                  iconUrl: 'images/liberty.png',
                  iconAnchor:   [17, 97]
                   };
         
         var myicon_select = {
                  iconUrl: 'images/liberty_selected.png',
                  iconAnchor:   [17, 97]
                   };
         angular.extend($scope, {
             markers: {
                 m1: {
                     lat: 25.0666313,
                     lng: 121.5943403,
                     icon: myicon,
                 },

                 m2: {
                     lat: 25.0686313,
                     lng: 121.5843403,
                     icon: myicon,
                 },
             },
         });

         $scope.markerclick = false;
         $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
            $scope.markerclick = true;
            $scope.markers[args["markerName"]].icon = myicon_select;
            //console.log("Leaflet Click",args);
         });
         $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
            $scope.markerclick = false;
            $scope.markers[args["markerName"]].icon = myicon;
         });
      }

      $scope.$on("leafletDirectiveMap.geojsonMouseover", areaMouseover);
      $scope.$on("leafletDirectiveMap.geojsonClick", areaClick);

	
	

  }]);
