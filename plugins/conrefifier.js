var _ = require('lodash');
var Liquid = require("liquid-node");
var engine = new Liquid.Engine();
var datafiles = require('./datafiles');

module.exports = {
  dataFileVariables: function (config, path) {
    let data_vars = {};
    let scopes = _.filter(config.data_file_variables, function (v) {
      return (_.isEmpty(v.scope.path) || new RegExp(v.scope.path).test(path));
    });

    _.forEach(scopes, function (scope) {
      data_vars = _.merge(data_vars, scope.values);
    });

    return data_vars;
  },

  setupConfig: function (metalsmith) {
    let data_vars = _.isEmpty(metalsmith._source) ? {} : this.dataFileVariables(metalsmith._metadata.config, metalsmith._source)
    let config = {
      page: data_vars
    };
    return _.merge({
      'data': datafiles.data,
      'config': metalsmith._metadata.site
    }, config);
  },

  convert: function (content, data_vars, callback) {
    engine
      .parse(content)
      .then(function (template) {
        return template.render(data_vars);
      })
      .then(function (result) {
        callback(result);
      });
  }
};
