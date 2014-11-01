'use strict';

//var MAP_BUFFER_TIME = 10;
var USE_CITIZEN_DB = true;

var MY_HTTP_DELAY = 200;
var MY_HTTP_RETRY = 3000;

var MY_REQUERY_TIME = 10000;

/**
 * @ngdoc service
 * @name projectVApp.voteInfoService
 * @description
 * # voteInfoService
 * Service in the projectVApp.
 */
angular.module('projectVApp')
  .service('voteInfoService', function voteInfoService($q, $http) {
    this.MAP_BUFFER_TIME = 10;
   
    Parse.initialize(
      "QDCw1Ntq4E9PmPpcuwKbO2H0B1H0y77Vj1ScO9Zx",
      "6jaJvf46pYub6Ej9IjhhIXNtZjTqRY0P4IqAJFhH"
    );

    var citizenParse = Parse.Object.extend("citizen");
  
    var pollParse = Parse.Object.extend("poll");

    var volunteerParse = Parse.Object.extend("volunteer");


    var supplementParse = Parse.Object.extend("resource");
    //var county = 'TPE-4';

    var citizenDataAry = {}; //dynamic

    var villageSumAry = {}; //dynamic

    var voteStatInfoAry = {}; //dynamic

    var countyVillageAry = {}; //dynamic

    var voteDataAry = {};

    var villageAreaAry = {}; 

    var villageVotestatAry = {};

    var countyBoundAry = {};

    var my_this = this;

    this.supplementItem = { 
      'pen':     [5,'筆'], 
      'board':   [5,'連署板'],
      'water':   [5,'水'],
      'chair':   [2,'椅子'], 
      'desk':    [1,'桌子'], 
      'umbrella':[1,'五百萬傘'], 
    };
    
    this.volCount = 5;
     
    var votestatHttp = 0;
    var twCountyVillageHttp = 0;
    var villageVotestatHttp = 0;
    var villageSumHttp = 0;
    var citizenDataHttp = 0;
    var allVoteStatInfoHttp = 0;

    var queryHistory = {};

    var jsonStorage ={
        votestat: {},
        villageVotestat:{},
        twCountyVillage: {},
      }; 

    var jsonHttpCount = {
        votestat: 0,
        villageVotestat: 0,
        twCountyVillage: 0,
      };

    function queryJsonData(name,county){
      var deferred = $q.defer();
      jsonHttpCount[name] += 1;
      function postProcess(county) {
        jsonHttpCount[name] = 0;
        deferred.resolve(jsonStorage[name][county]);
      }
      if(jsonHttpCount[name] > 1){
        var repeat = setInterval(function(){
          console.log('repeat '+ name);
          if(jsonStorage[name][county]){
            clearInterval(repeat);
            postProcess(county);
          }
        },MY_HTTP_DELAY);
      }
      else{
        if(jsonStorage[name][county]){
          postProcess(county);
        }
        else{
          var queryExecute = function(){
            var query = 'json/'+ name +'/' + county + '.json';
            console.log('query' + name);
            $http.get(query).success(function(data) {
              jsonStorage[name][county] = data;
              postProcess(county);
            }).error(function(data){
              setTimeout(function(){queryExecute();},MY_HTTP_RETRY);
            });
          }
          queryExecute();
        }
      }
      return deferred.promise;
    }

    this.getAllVoteStatData = function(county) {
      return queryJsonData('votestat',county);
    };

    this.getAllVillageVotestatData = function(county) {
      return queryJsonData('villageVotestat',county);
    };


    this.getCountyVillage = function(county) { //dynamic
      return queryJsonData('twCountyVillage',county);
    };


    this.getParsedQuery = function(query,key,val,limit){
      var deferred = $q.defer();
      //console.log('query');
      var qhkey = query+'_'+key+'_'+val+'_'+limit;

      function postProcess(qhkey) {
        queryHistory[qhkey]['count'] = 0;
        deferred.resolve(queryHistory[qhkey]['results']);
      }

      if(!queryHistory[qhkey]){
        queryHistory[qhkey] = {count:0};
      }
      queryHistory[qhkey]['count'] += 1;

      var curTime = new Date().getTime();
      if(!limit){
        limit = 1000
      }
      if(queryHistory[qhkey]['time'] && ( (curTime - queryHistory[qhkey]['time']) < MY_REQUERY_TIME) ){
          postProcess(qhkey);
      }
      else{ 
        if(queryHistory[qhkey]['count'] > 1){
          var repeat = setInterval(function(){
            console.log('repeat query');
            if(queryHistory[qhkey]['results']){
              clearInterval(repeat);
              postProcess(qhkey);
            }
          },MY_HTTP_DELAY);
        }
        else{
          var queryExecute = function(){ 
            console.log('repeat 2 query interval');
            query.descending("createdAt");
            query.equalTo(key, val);
            query.limit(limit);
            query.find({
              success: function(results) {
                //clearInterval(repeat2);
                queryHistory[qhkey] = {time:curTime, results:results, count:0};
                deferred.resolve(results);
              },
              error: function(object, error) {
                setTimeout(function(){queryExecute();},MY_HTTP_RETRY);
              }
            });
          };
          queryExecute(); 
        }
      }
      //},MY_HTTP_DELAY*Math.random());

      return deferred.promise;
    };

    this.getCitizenData = function(county) { //dynamic
      var deferred = $q.defer();
      citizenDataHttp += 1;
      //console.log('citizenDataHttp',citizenDataHttp);
      function postProcess(county) {
        citizenDataHttp = 0;
        deferred.resolve(citizenDataAry[county]);
      }
      function convertObject(obj_in, type){
        if(USE_CITIZEN_DB){
          var rBody = [];
          var vBody = [];
          if(obj_in.get('resourceBody')){
            for(var i = obj_in.get('resourceBody').length-1; i >=0; i--){
              rBody.push(obj_in.get('resourceBody')[i]);
            }
          }
          if(obj_in.get('volunteerBody')){
            for(var i = obj_in.get('volunteerBody').length-1; i >=0; i--){
              vBody.push(obj_in.get('volunteerBody')[i]);
            }
          }
          return {
            'county': obj_in.get('county'),
            'poll': obj_in.get('poll'),
            'resource': obj_in.get('resource'),
            'volunteer': obj_in.get('volunteer'),
            'resourceBody': rBody,//obj_in.get('resourceBody'),
            'volunteerBody': vBody,//obj_in.get('volunteerBody'),
          }; 
        }
        else{
          var obj_out = { 
            'email': obj_in.get('email'),
            'fid': obj_in.get('fid'),
            'mobile': obj_in.get('mobile'),
            'name': obj_in.get('name'),
            'poll': obj_in.get('poll'),
            'county': obj_in.get('county')
          };
          if(type == 'volunteer'){
            obj_out['resource'] = {};
            for(var item in my_this.supplementItem){
              obj_out['resource'][item] = 0;
            }
            obj_out['volunteer'] = true;
          }
          else if(type == 'supplement'){
            obj_out['resource'] = obj_in.get('resource'); 
            obj_out['volunteer'] = false;
          }
          return obj_out;
        }
      }
      //setTimeout(function(){
        if(citizenDataAry[county]){
          postProcess(county);
        }
        else{
          if(citizenDataHttp > 1){
            var repeat = setInterval(function(){
              console.log('repeat citizen data');
              if(citizenDataAry[county]){
                clearInterval(repeat);
                postProcess(county);
              }
            },MY_HTTP_DELAY);
          }
          else{
            console.log('run citizen data');
            if(USE_CITIZEN_DB){
              var query = new Parse.Query(pollParse);
              my_this.getParsedQuery(query,"county",county).then(function(citizenData){
                var results = [];
                for (var i = 0; i < citizenData.length; i++) { 
                  results.push( convertObject(citizenData[i]));
                } 
                citizenDataAry[county] = results;
                postProcess(county);
              });
            }
            else{
              var volQuery = new Parse.Query(volunteerParse);
              var supQuery = new Parse.Query(supplementParse);
              $q.all([my_this.getParsedQuery(volQuery,"county",county), my_this.getParsedQuery(supQuery,"county",county)]).then(function(data){
                //console.log('query_data',data[0],data[1]);
                var volunteerData = data[0];
                var supplementData = data[1];
                var results = [];
                for (var i = 0; i < volunteerData.length; i++) { 
                  results.push( convertObject(volunteerData[i],'volunteer'));
                } 
                for (var i = 0; i < supplementData.length; i++) { 
                  results.push( convertObject(supplementData[i],'supplement'));
                } 
                citizenDataAry[county] = results;
                postProcess(county);
              });
            }
          }
        }
      //},MY_HTTP_DELAY*citizenDataHttp);
      return deferred.promise;
    };


    this.getTopkCitizen = function(county,k){ //TODO
      var deferred = $q.defer();
      function sortByKey(array, key) {
          return array.sort(function(a, b) {
              var x = a[key]; var y = b[key];
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          }).reverse();
      }
      var volQuery = new Parse.Query(volunteerParse);
      var supQuery = new Parse.Query(supplementParse);
      $q.all([my_this.getParsedQuery(volQuery,"county",county,k), my_this.getParsedQuery(supQuery,"county",county,k)]).then(function(data){
        var dataAll = [];
        //console.log('data',data);
        for(var i=0; i<data[0].length; i++){
          var objTemp = data[0][i];
          dataAll.push({fid: objTemp.get('fid'), createdAt:objTemp['createdAt'].getTime(), name: objTemp.get('name'), type:'志工'});
        }
        for(var i=0; i<data[1].length; i++){
          var objTemp = data[1][i];
          dataAll.push({fid: objTemp.get('fid'), createdAt:objTemp['createdAt'].getTime(), name: objTemp.get('name'), type:'物資'});
        }
        deferred.resolve(dataAll.slice(0,k));
      });
      
      return deferred.promise;
    }

    this.getAllVillageSum = function(county){  //dynamic
      var deferred = $q.defer();
      villageSumHttp += 1;

      function postProcess(county) {
        villageSumHttp = 0;
        deferred.resolve(villageSumAry[county]);
      }
      
      //setTimeout(function(){
      if(villageSumAry[county]){
        postProcess(county); 
      }
      else{
        if(villageSumHttp > 1){
          var repeat = setInterval(function(){
            console.log('repeat villageSumHttp');
            if(villageSumAry[county]){
              clearInterval(repeat);
              postProcess(county); 
            }
          },MY_HTTP_DELAY*3);
        }
        else{
            console.log('run villageSumHttp');
            $q.all([ my_this.getAllVoteStatData(county), my_this.getCitizenData(county) , my_this.getAllVillageVotestatData(county)])
            .then(function(data){
              var voteStatData = data[0];
              var citizenData = data[1];
              var villageVotestatData = data[2];
              var voteStatSum = {};
              var voteStatWeight = {};

              for(var ct in voteStatData){
                for(var i=0 ; i< voteStatData[ct].length; i++){
                  voteStatWeight[voteStatData[ct][i].id] = voteStatData[ct][i].power;
                }
              } 

              if(USE_CITIZEN_DB){
                for (var i = 0; i < citizenData.length; i++) { 
                  var object = citizenData[i];
                  var vsid = object['poll'];
                  voteStatSum[vsid] = 0;
                  var vsum = (object['volunteer'] > voteStatWeight[vsid]*my_this.volCount) ? 1  : object['volunteer']/(voteStatWeight[vsid]*my_this.volCount);
                  var ssum = 0;
                  var slength = 0;
                  for(var item in my_this.supplementItem){
                    var itemNum =  object['resource'][item] ? object['resource'][item] : 0;
                    ssum += (itemNum > voteStatWeight[vsid]*my_this.supplementItem[item][0]) ? 1  : itemNum / (voteStatWeight[vsid]*my_this.supplementItem[item][0]);
                    slength += 1;
                  }
                  voteStatSum[vsid] = ( vsum + (ssum / slength) ) / 2;
                }
              }
              else{
                for (var i = 0; i < citizenData.length; i++) { 
                  var object = citizenData[i];
                  var vsid = object['poll'];
                  voteStatSum[vsid] = voteStatSum[vsid] ? voteStatSum[vsid]+1 : 1;
                }
                for(var id in voteStatSum){
                  voteStatSum[id] = (voteStatSum[id] > voteStatWeight[id]*my_this.volCount) ? 1 : voteStatSum[id] / (voteStatWeight[id]*my_this.volCount);
                }
              }
              var villageSum = {}; 
              for(var townName in  villageVotestatData){
                villageSum[townName] = {};
                for(var villageName in villageVotestatData[townName]){
                  var voteStatAry = villageVotestatData[townName][villageName];
                  var sum = 0;
                  for(var i=0; i< voteStatAry.length; i++){
                    if(voteStatSum[voteStatAry[i]]){
                      sum += voteStatSum[voteStatAry[i]];
                    }
                  }
                  villageSum[townName][villageName] = voteStatAry.length == 0 ? 1 : sum/voteStatAry.length;
                }
              }
              villageSumAry[county] = villageSum;
              postProcess(county);
            }); 
        }
      }
      return deferred.promise;
    };

    this.getAllVoteStatInfo = function(county){ //dynamic
      var deferred = $q.defer();
      allVoteStatInfoHttp += 1;

      function postProcess(county) {
        allVoteStatInfoHttp = 0;
        deferred.resolve(voteStatInfoAry[county]);
      }
      if(voteStatInfoAry[county]){
        postProcess(county);
      }
      else{
        if(allVoteStatInfoHttp > 1){
          var repeat = setInterval(function(){
            console.log('repeat allVoteStatInfoHttp');
            if(voteStatInfoAry[county]){
              clearInterval(repeat);
              postProcess(county); 
            }
          },MY_HTTP_DELAY*3);
        }
        else{
          $q.all([my_this.getCitizenData(county), my_this.getAllVoteStatData(county)]).then(
            function(data){
              var citizenData = data[0];
              var votestatData = data[1];
              var voteStatInfo = {};
              
              for(var townName in votestatData){ 
                for(var i=0; i<votestatData[townName].length; i++){
                  var voteStat = votestatData[townName][i];
                  voteStatInfo[voteStat.id] = {
                    vlist: [],
                    //vlistTotal: 0,
                    vCount:0,
                    volunteer: 0,
                    slist: [], 
                    sItemCount: {},
                    //sItemTotal: {}, 
                    sItemSum: 0,
                    sTotalSum: 0,
                    supplement: 0, 
                    address:voteStat.address,
                    vweight:voteStat.power
                  };
                } 
              }
              if(USE_CITIZEN_DB){ 
                for(var i=0; i<citizenData.length; i++){
                  var object = citizenData[i];
                  var vsid = object['poll'];
                  var resource = object['resource'];
                  voteStatInfo[vsid].vCount = object['volunteer'];
                  voteStatInfo[vsid].vlist = object['volunteerBody'];//.reverse();
                  voteStatInfo[vsid].slist = object['resourceBody'];//.reverse();

                  for(var item in my_this.supplementItem){
                    if(!voteStatInfo[vsid].sItemCount[item]){
                      voteStatInfo[vsid].sItemCount[item] = 0;
                    }
                    if(resource[item] && parseInt(resource[item]) > 0 ){
                      voteStatInfo[vsid].sItemCount[item] = parseInt(resource[item]);
                      hasitem = true;
                    }
                  }
                }

                for(var id in voteStatInfo){
                  var factor = voteStatInfo[id].vweight*my_this.volCount;

                  voteStatInfo[id].volunteer = voteStatInfo[id].vCount > factor ? 1 : voteStatInfo[id].vCount/factor;

                  var totalSum = 0;
                  var itemSum = 0;
                  for(var item in my_this.supplementItem){
                    var itemTotal =  my_this.supplementItem[item][0] * voteStatInfo[id].vweight
                    totalSum += itemTotal;
                    if(!voteStatInfo[id].sItemCount[item]){
                      voteStatInfo[id].sItemCount[item] = 0;
                    }
                    itemSum += ( voteStatInfo[id].sItemCount[item] >= itemTotal ? itemTotal : voteStatInfo[id].sItemCount[item] );
                  }
                  voteStatInfo[id].sItemSum = itemSum;
                  voteStatInfo[id].sTotalSum = totalSum;
                  voteStatInfo[id].supplement = itemSum > totalSum ? 1 : itemSum/totalSum;
                }
              }
              else{
                //console.log('voteStatInfo',voteStatInfo);
                for(var i=0; i<citizenData.length; i++){
                  var object = citizenData[i];
                  var vsid = object['poll'];
                  //console.log('vsid',vsid);
                  if(voteStatInfo[vsid]){
                    if(object['volunteer']){
                      voteStatInfo[vsid].vlist.push([object['fid'],object['name']]);
                    }
                    var hasitem = false;
                    var resource = object['resource'];
                    for(var item in my_this.supplementItem){
                      if(!voteStatInfo[vsid].sItemCount[item]){
                        voteStatInfo[vsid].sItemCount[item] = 0;
                      }
                      if(resource[item] && parseInt(resource[item]) > 0 ){
                        voteStatInfo[vsid].sItemCount[item] += parseInt(resource[item]);
                        hasitem = true;
                      }
                    }
                    if(hasitem){
                      voteStatInfo[vsid].slist.push([object['fid'],object['name']]);
                    }
                  }
                }
                for(var id in voteStatInfo){
                  var factor = voteStatInfo[id].vweight*my_this.volCount;
                  voteStatInfo[id].volunteer = voteStatInfo[id].vlist.length > factor ? 1 : voteStatInfo[id].vlist.length/factor;

                  var totalSum = 0;
                  var itemSum = 0;
                  for(var item in my_this.supplementItem){
                    var itemTotal =  my_this.supplementItem[item][0] * voteStatInfo[id].vweight
                    totalSum += itemTotal;
                    if(!voteStatInfo[id].sItemCount[item]){
                      voteStatInfo[id].sItemCount[item] = 0;
                    }
                    itemSum += ( voteStatInfo[id].sItemCount[item] >= itemTotal ? itemTotal : voteStatInfo[id].sItemCount[item] );
                  }

                  voteStatInfo[id].sItemSum = itemSum;
                  voteStatInfo[id].sTotalSum = totalSum;
                  voteStatInfo[id].supplement = itemSum > totalSum ? 1 : itemSum/totalSum;
                }
              }

              voteStatInfoAry[county] = voteStatInfo;
              postProcess(county);
          });
        }
      }
      return deferred.promise;
    };
    



    this.getStaticVillageData = function(county){
      var deferred = $q.defer();
      var countAll = 0;
      var countTemp = 0;
      var count = 0;

      $q.all([my_this.getCountyVillage(county), my_this.getAllVillageSum(county)]).then(function(data){
        var countVill = data[0]; 
        var villSum = data[1];
        villageAreaAry[county] = villageAreaAry[county] ? villageAreaAry[county] : {};
        var villageArea = villageAreaAry[county];
        //console.log('villSum',villSum);

        function postProcess(vakey, townName, villageName){
          countTemp += 1;
          setTimeout(function(){ 
            count +=1 ;
            var mvillsum = 0;
            if(villSum[townName] && villSum[townName][villageName]){
              mvillsum = villSum[townName][villageName];
            }
            deferred.notify({villageArea: villageArea[vakey], villageSum:mvillsum, loadingStatus:count/countAll, county:county});
            //console.log('postProcess',townName,villageName);
            if(count == countAll){
              deferred.resolve( { complete:true , loadingStatus:count/countAll, county:county});
              //console.log("complete");
            }
          },my_this.MAP_BUFFER_TIME*countTemp);
        } 

        angular.forEach(countVill, function(villages, townName) {
          angular.forEach(villages, function(villageName) {
            countAll += 1;
            var vakey = county+'_'+townName+'_'+villageName;

            if(villageArea[vakey]){
              postProcess(vakey, townName, villageName);
            }

            else{
              var query = 'json/twVillage2010/' + county + '/' + townName + '/' + villageName + '.json';

              $http.get(query).success(function(data) {
                villageArea[vakey] = data;
                postProcess(vakey, townName, villageName);
              }).error( function(err) {
                villageArea[vakey] = {};
                //console.log('loading failed',townName,villageName);        
                postProcess(vakey, townName, villageName);
              });

            }

          });
        });
      });
      return deferred.promise;
    };
    
    this.saveCitizen = function(data, cb){
      //console.log('data',JSON.stringify(data));
      if(USE_CITIZEN_DB){
        var czparse = new citizenParse();
        czparse
          .save(data)
          .then(function(object) {
            cb()
          });
      }
      else{
        if(data.volunteer){
          delete data.volunteer;
          delete data.resource;
          var mparse = new volunteerParse();
          mparse.save(data)
            .then(function(object) {
              cb()
            });
        }
        else{
          delete data.volunteer;
          var mparse = new supplementParse();
          mparse.save(data)
            .then(function(object) {
              cb()
            });
        }
      }
    };

    this.queryCitizen = function(fid,type){
      var deferred = $q.defer();
      if(USE_CITIZEN_DB){
        deferred.resolve(false);
      }
      else{
        var query = null;
        if(type == 'volunteer'){ 
          query = new Parse.Query(volunteerParse);
        }
        else if(type == 'supplement'){
          query = new Parse.Query(supplementParse);
        }
        my_this.getParsedQuery(query,"fid",fid).then(function(result){
          if(result.length > 0){
            deferred.resolve(true);
          }
          else{
            deferred.resolve(false);
          }
        });
      }
      return deferred.promise;
    };


    this.resetDynamics = function(county){
      if(citizenDataAry[county]){
        delete citizenDataAry[county];
      }
      if(villageSumAry[county]){
        delete villageSumAry[county];
      }
      if(voteStatInfoAry[county]){
        delete voteStatInfoAry[county];
      }
      if(countyVillageAry[county]){
        delete countyVillageAry[county];
      }
    };

  });
