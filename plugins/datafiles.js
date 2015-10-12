var fs = require("fs"),
  path = require("path"),

  helpers = require("./helpers"),

  yaml = require("js-yaml"),
  _ = require("lodash");

var data = {};
module.exports = {
  data: data,

  fileHandler: function (root, fileStat, next) {
    if (".yml" != path.extname(fileStat.name)) return next();

    fs.readFile(path.resolve(root, fileStat.name), "utf8", function (err, yml) {
      if (err) throw err;

      var doc = yaml.safeLoad(yml);

      let dataPath = root.slice(root.indexOf("/data/") + 1);

      dataPath = `${dataPath}/${fileStat.name}`
        .replace(/^data\//g, "").replace(/\//g, ".").replace(/\.yml/, "");

      Object.keys(doc).forEach(function (docKey) {
        var dataKey = dataPath,
            nestedData = {};
        dataKey = `${dataKey}.${docKey}`;

        helpers.createNestedObject(nestedData, dataKey.split("."), doc[docKey]);
        data = _.merge(data, nestedData);
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
