let utf8 = require("is-utf8"),
    Liquid = require("liquid-node"),
    engine = new Liquid.Engine();

module.exports = {
  /**
   * Continues to create an object with keys. Used for generating the
   * data file paths.
  */
  createNestedObject: function (base, names, final_value) {
    for (var i = 0; i < names.length; i++) {
      base = base[names[i]] = i == names.length - 1 ? final_value : (base[names[i]] || {});
    }
  },

  applyLiquid: function(content, dataVars) {
    return engine
      .parse(content)
      .then(function (template) {
        return template.render(dataVars);
      });
  },

  check: function(files, file) {
    var data = files[file];

    // Only process utf8 encoded files (so no binary)
    if (!utf8(data.contents)) {
      return false;
    }

    return true;
  }
};
