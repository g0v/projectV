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
        var days = parseInt(hours/24);
        hours = hours - (days * 24);
        var minutes = parseInt((ms / (1000 * 60)) - 60 * hours);

        var seconds = parseInt((ms / 1000) % 60);
        var ratio = parseInt(seconds * 5 /3);

        return {
          days: days,
          hours: hours,
          minutes: minutes,
          seconds: seconds,
          ratio: ratio
        };
      }
    };
  });
