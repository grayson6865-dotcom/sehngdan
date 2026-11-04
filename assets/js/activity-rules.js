/* Rules for the local Christmas activity prototype. */
(function (root, factory) {
  var rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  if (root) root.XMASActivityRules = rules;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  return {
    makeupAvailable: function (day, completedToday) {
      if (day < '2026-12-18' || day > '2026-12-31') return false;
      return day >= '2026-12-26' || completedToday < 3;
    },
    energyForDay: function (amount, earnedDay, currentDay) {
      return earnedDay === currentDay ? Math.max(0, amount || 0) : 0;
    }
  };
});
