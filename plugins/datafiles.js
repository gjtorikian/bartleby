var fs = require("mz/fs"),
  path = require("path"),

  renderer = require("./renderer"),
  conrefifier = require("./conrefifier"),
  helpers = require("./helpers"),

  yaml = require("js-yaml"),
  _ = require("lodash");

var data = {};
var files = {};
module.exports = {
  data: data,

  /**
   * Given a data file, this method reads it. It also converts any conditionals
   * encountered, based on the site.config.data_variables value.
  */
  process: async function(config, dataFile) {
    if (".yml" != path.extname(dataFile.name)) return new Promise(function(resolve) { return resolve(); });

    let location = path.join(dataFile.root, dataFile.name);

    try {
      let yml = await fs.readFile(location, "utf8");

      let key = location.slice(location.indexOf("/data/") + 1);
      files[key] = yml;

      // Iterate over each found file
      for (let dataPath of Object.keys(files)) {
        // Before parsing the yaml, convert any conditionals
        let contents = files[dataPath]
        let dataVars = conrefifier.setupPageVars(config.data_variables, dataPath);
        let yml = await helpers.applyLiquid(contents, dataVars);

        var doc = yaml.safeLoad(yml);
        let dataKey = `${dataPath}`
          .replace(/^data\//g, "").replace(/\//g, ".").replace(/\.yml/, "");

        let nestedData = {};
        // This can be undefined if the applyLiquid step eradicated the contents, based
        // on a conditional
        if (!_.isUndefined(doc)) {
          Object.keys(doc).forEach(function (docKey) {
            let keys = `${dataKey}.${docKey}`;
            helpers.createNestedObject(nestedData, keys.split("."), doc[docKey]);
            data = _.merge(data, nestedData);
          });
        }
      }

      return new Promise(function(resolve) { return resolve(); });
    } catch (e) {
      console.error(`Error processing data file: ${e}`);
      throw e;
    }
  }
};
