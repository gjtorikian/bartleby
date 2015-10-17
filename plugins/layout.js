let path = require("path"),
    fs = require("mz/fs"),

    debug = require("debug"),
    debugLayout = debug("bartleby-layout"),
    _ = require("lodash"),

    Liquid = require("liquid-node"),
    Engine = new Liquid.Engine(),

    site = require("./site"),
    helpers = require("./helpers");

let template = "";

/**
 * Custom class that helps determine locations for partials
 */
class BartlebyFileSystem extends Liquid.BlankFileSystem {
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

Engine.registerFilters({
  slugify: function(input) {
    if (_.isUndefined(input) || !_.isString(input)) {
      return input;
    }
    let str = input.toLowerCase();
    return str.replace(/[^a-z0-9]+/ig, "-")
              .replace(/^\-|\-$/ig, "");
  }
});

var self = module.exports = {
  engine: Engine,

  /**
   * Responsible for applying the layout to each piece of content.
   */
  layout: function(options) {
    return async function(files, metalsmith, done) {
      debugLayout("Start layout");
      self.engine.fileSystem = new BartlebyFileSystem(options.directory);
      try {
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
      let vars = { contents: contents, page: data.page, site: site.vars() };
      let body = await self.applyLiquid(template, vars);

      data.contents = new Buffer(body);
      return new Promise(function(resolve) { return resolve(); });
    }
  },

  applyLiquid: function(content, dataVars) {
    return self.engine
      .parse(content)
      .then(function (template) {
        return template.render(dataVars);
      });
  }
};
