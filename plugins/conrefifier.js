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

    return pageVars;
  },

  convertVariables: function(config) {
    if (_.isUndefined(config.config_variables)) {
      return config;
    }
    let variables = config.config_variables;
    let configString = JSON.stringify(config);
    _.forEach(variables, function(val, key) {
      configString = configString.replace(new RegExp(`%{${key}}`, "g"), val);
    });

    return JSON.parse(configString);
  }
};
