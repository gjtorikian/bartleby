let _ = require("lodash");

/**
 * Methods used to help process conditionals found in data files.
*/
module.exports = {
  dataFileVariables: function (config, location) {
    // There is no config.yml
    if (_.isUndefined(config)) {
      return {};
    }

    let dataVars = {};
    let scopes = _.filter(config.data_variables, function (v) {
      return (_.isEmpty(v.scope.path) || new RegExp(v.scope.path).test(location));
    });

    _.forEach(scopes, function (scope) {
      dataVars = _.merge(dataVars, scope.values);
    });

    return dataVars;
  },

  setupConfigVars: function (config, location) {
    let pageVars = this.dataFileVariables(config, location);
    let configVars = {
      page: pageVars
    };

    return configVars;
  }
};
