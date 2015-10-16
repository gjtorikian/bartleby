let path = require("path"),
    fs = require("mz/fs"),

    debug = require("debug"),
    debugLayout = debug("graffito-layout"),
    _ = require("lodash"),

    Liquid = require("liquid-node"),
    engine = new Liquid.Engine(),

    site = require("./site"),
    helpers = require("./helpers");

module.exports = layout;

let template = "";
/**
 * Custom class that helps determine locations for partials
 */
class GraffitoFileSystem extends Liquid.BlankFileSystem {
  constructor(base) {
    super();
    this.base = base;
  }

  async readTemplateFile(file) {
    let contents = await fs.readFile(path.join(this.base, `${file}.html`), "utf8");
    return new Promise(function(resolve) {
      return resolve(contents);
    });
  }
}

engine.registerFilters({
  slugify: function(input) {
    if (_.isUndefined(input) || !_.isString(input)) {
      return input;
    }
    let str = input.toLowerCase();
    return str.replace(/[^a-z0-9]+/ig, "-")
              .replace(/^\-|\-$/ig, "");
  }
});

/**
 * Responsible for applying the layout to each piece of content.
 */
function layout(options) {
  return async function(files, metalsmith, done) {
    debugLayout("Start layout");
    try {
      engine.fileSystem = new GraffitoFileSystem(options.directory);
      template = await fs.readFile(path.join(options.directory, options.template), "utf8");

      for (let file of Object.keys(files)) {
        await processFile(files, file);
      }
    } catch (e) {
      console.error(`Error processing layout: ${e}`);
      throw e;
    }
    debugLayout("End layout");

    done();
  }

  /**
   * Read the contents of a file and applies the Liquid template to it.
   */
  async function processFile(files, file) {
    if (!helpers.check(files, file)) return new Promise(function(resolve) { return resolve(); });

    let data = files[file];
    let contents = data.contents.toString();
    let vars = _.merge({ contents: contents, page: data.page }, site.vars());
    let body = await applyLiquid(template, vars);

    data.contents = new Buffer(body);
    return new Promise(function(resolve) { return resolve(); });
  }

  function applyLiquid(content, dataVars) {
   return engine
     .parse(content)
     .then(function (template) {
       return template.render(dataVars);
     });
   }
}
