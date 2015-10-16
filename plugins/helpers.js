let utf8 = require("is-utf8");

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

  check: function(files, file) {
    var data = files[file];

    // Only process utf8 encoded files (so no binary)
    if (!utf8(data.contents)) {
      return false;
    }

    return true;
  }
};
