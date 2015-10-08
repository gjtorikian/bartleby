var fs = require('fs'),
  path = require('path'),

  helpers = require('./helpers'),

  yaml = require('js-yaml'),
  _ = require('lodash');

var data = {};
module.exports = {
  data: data,

  fileHandler: function (root, fileStat, next) {
    if (".yml" != path.extname(fileStat.name)) return next();

    fs.readFile(path.resolve(root, fileStat.name), 'utf8', function (err, str) {
      if (err) throw err;
      var parsed_str = str.replace(/\{%.+?%\}/g, '');
      var doc = yaml.safeLoad(parsed_str);

      var dataPath = `${root}/${fileStat.name}`
        .replace(/^data\//g, '').replace(/\//g, '.').replace(/\.yml/, '');

      Object.keys(doc).forEach(function (doc_key) {
        var data_key = dataPath,
          nested_data = {};
        data_key = `${data_key}.${doc_key}`;

        helpers.createNestedObject(nested_data, data_key.split('.'), doc[doc_key]);
        data = _.merge(data, nested_data);
      });

      next();
    });
  },

  errorsHandler: function (root, nodeStatsArray, next) {
    nodeStatsArray.forEach(function (n) {
      console.error("[ERROR] " + n.name);
      console.error(n.error.message || (n.error.code + ": " + n.error.path));
    });

    next();
  },

  filter: async function (data, version) {
    return data;
  }
};
