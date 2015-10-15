let _ = require("lodash");

/**
 * Methods used to help process conditionals found in data files.
*/
module.exports = {
  fileVariables: function (vars, location) {
    // There is no config.yml
    if (_.isUndefined(vars)) {
      return {};
    }

    let dataVars = {};
    let scopes = _.filter(vars, function (v) {
      return (_.isEmpty(v.scope.path) || new RegExp(v.scope.path).test(location));
    });

    _.forEach(scopes, function (scope) {
      dataVars = _.merge(dataVars, scope.values);
    });

    return dataVars;
  },

  setupPageVars: function (vars, location) {
    let pageVars = this.fileVariables(vars, location);
    let configVars = {
      page: pageVars
    };

    return configVars;
  }
};
