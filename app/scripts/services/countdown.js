'use strict';

/**
 * @ngdoc service
 * @name projectVApp.Countdown
 * @description
 * # Countdown
 * Service in the projectVApp.
 */
angular.module('projectVApp')
  .service('Countdown', function Countdown() {
    return {
      getTime: function(future, current) {
        var ms = future - current;
        var hours = parseInt(ms / 1000 / 60 / 60);
        var minutes = parseInt((ms / (1000 * 60)) - 60 * hours);
        var countdown = parseInt(ms / 1000 / 60 / 60 / 24);

        return {
          hours: hours,
          minutes: minutes,
          countdown: countdown
        };
      }
    };
  });
