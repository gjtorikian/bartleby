var _ = require('lodash');
var datafiles = require('./datafiles');

module.exports = {
  dataFileVariables: function (config, path) {
    let dataVars = {};
    let scopes = _.filter(config.data_file_variables, function (v) {
      return (_.isEmpty(v.scope.path) || new RegExp(v.scope.path).test(path));
    });

    _.forEach(scopes, function (scope) {
      dataVars = _.merge(dataVars, scope.values);
    });

    return dataVars;
  },

  setupConfig: function (source, metadata) {
    let pageVars = _.isEmpty(source) ? {} : this.dataFileVariables(metadata.config, source)
    let config = {
      page: pageVars
    };

    return _.merge({
      'data': datafiles.data,
      'config': metadata.config
    }, config);
  }

};
