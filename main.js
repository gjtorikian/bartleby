let fs = require("fs"),
    path = require("path"),

    debug = require("debug"),
    debugBuild = debug("graffito-build"),
    debugData = debug("graffito-data"),
    site = require("./plugins/site"),
    datafiles = require("./plugins/datafiles"),
    renderer = require("./plugins/renderer"),
    layout = require("./plugins/layout"),

    Metalsmith = require("metalsmith"),
    ignore = require("metalsmith-ignore"),
    yaml = require("js-yaml"),
    walk = require("walk-promise"),
    _ = require("lodash");

module.exports = async function(options, buildOptions) {
  if (!_.isObject(options)) {
    return new Promise(function(resolve, reject) {
      return reject(new TypeError("Your initial options are not an object!"));
    });
  }
  if (_.isEmpty(options)) {
    return new Promise(function(resolve, reject) {
      return reject(new TypeError("Your initial options are empty!"));
    });
  }
  if (_.isUndefined(options.base)) {
    return new Promise(function(resolve, reject) {
      return reject(new TypeError("You're missing the `base` key in the initial options!"));
    });
  }
  if (!_.isArray(buildOptions)) {
    return new Promise(function(resolve, reject) {
      return reject(new TypeError("Your build options are not an array!"));
    });
  }
  if (_.isEmpty(buildOptions)) {
    return new Promise(function(resolve, reject) {
      return reject(new TypeError("Your build options are empty!"));
    });
  }

  const CONFIG_PATH = path.join(options.base, "_graffito.yml");
  site.config = {};
  // First, parse the main site config data
  try {
    if (fs.lstatSync(CONFIG_PATH)) {
      site.config = yaml.safeLoad(fs.readFileSync(CONFIG_PATH, "utf8"));
    }
  } catch(e) { /* file doesn't exist */ }

  // Next, iterate on the data folder, picking up YML files
  const DATA_PATH = path.join(options.base, "data");
  debugData("Start data");
  try {
    if (fs.lstatSync(DATA_PATH)) {
      let dataFiles = await walk(DATA_PATH);
      for (let dataFile of dataFiles) {
        await datafiles.process(site.config, dataFile);
      }
    }
  } catch(e) { /* directory doesn't exist */ }
  debugData("End data");

  // Store data files at the site level
  site.data = datafiles.data;

  // process each build!
  debugBuild("Start build");
  for (let build of buildOptions) {
    await processBuild(build);
  }
  debugBuild("End build");

  return new Promise(async function (resolve) {
    return resolve();
  });

  function processBuild(build) {
    return new Promise(function (resolve) {
      // someone is being a jerk
      if (!_.isObject(build) || _.isEmpty(build)) {
        return resolve();
      }

      try {
        Metalsmith(__dirname)
          .source(path.join(options.base, build.source))
          .destination(build.destination)
          .frontmatter(false) // disabling for frontmatter manipulation in renderer
          .use(ignore(site.config.exclude))
          .use(renderer({
            type: 'markdown'
          }))
          .use(layout({
            "directory": path.join(options.base, "layouts"),
            "template": build.template
          }))
          .build(function (err) {
            if (err) throw err;
            return resolve();
          });
      } catch(e) {
        console.error(`Error processing build: ${e}`);
        throw e;
      }
    });
  }
}
