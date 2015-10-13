let fs = require("fs"),

  debug = require("debug"),
  debugBuild = debug("build"),
  debugData = debug("data"),
  datafiles = require("./plugins/datafiles"),
  renderer = require("./plugins/renderer"),
  permalinks = require("./plugins/permalinks"),

  Metalsmith = require("metalsmith"),
  ignore = require("metalsmith-ignore"),
  layouts = require("metalsmith-layouts"),
  yaml = require("js-yaml"),
  walk = require("walk"),
  _ = require("lodash");

module.exports = function(options, buildOptions) {
  if (_.isEmpty(buildOptions)) {
    console.error("Your argument is empty!");
  }
  if (!_.isArray(buildOptions)) {
    console.error("Your argument is not an array!");
  }

  // First, parse the main site config data
  let config = yaml.safeLoad(fs.readFileSync("config.yml", "utf8"));

  // Next, iterate on the data folder, pickin up YML files
  let datawalker = walk.walk(options.data);

  debugData("Start data");
  datawalker.on("file", datafiles.fileHandler);
  datawalker.on("errors", datafiles.errorsHandler);
  datawalker.on("end", endHandler);

  return new Promise(async function (resolve) {
    let original_data = await endHandler();
    await runBuild(original_data);
    return resolve();
  });

  // Once the data files are collected, it's time to process each directory
  async function endHandler() {
    debugData("End data");
    return _.cloneDeep(datafiles.data);
  }

  async function runBuild(original_data) {
    let filtered_data = await datafiles.filter(original_data, "dotcom");
    let metadata = {
      data: original_data,
      config: config
    };

    debugBuild("Start build");
    for (let build of buildOptions) {
      await processBuild(build, metadata);
    }
    debugBuild("End build");
  }

  function processBuild(build, metadata) {
    return new Promise(function (resolve) {
      if (_.isEmpty(build)) {
        return resolve();
      }

      Metalsmith(__dirname)
        .source(build.source)
        .destination(build.destination)
        .metadata(metadata)
        .frontmatter(false) // disabling for frontmatter manipulation later
        .use(ignore(metadata.config.exclude))
        .use(renderer.markdown)
        .use(layouts({
          "engine": "liquid",
          "directory": build.directory,
          "partials": build.partials,
          "default": "default.html"
        }))
        .build(function (err) {
          if (err) throw err;
          resolve();
        });
    });
  }
};
