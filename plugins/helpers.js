let utf8 = require("is-utf8"),
    _ = require("lodash");

let self = module.exports = {
  /**
   * Continues to create an object with keys. Used for generating the
   * data file paths.
  */
  createNestedObject: function (base, names, final_value) {
    for (let i = 0; i < names.length; i++) {
      base = base[names[i]] = i == names.length - 1 ? final_value : (base[names[i]] || {});
    }
  },

  /**
   * Retrieve nested item from object
   */
  fetchNestedObject: function(obj, path) {
      let i, len;

      for (i = 0,path = path.split("."), len = path.length; i < len; i++){
          if(!obj || typeof obj !== "object") return undefined;
          obj = obj[path[i]];
      }

      if(obj === undefined) return undefined;
      return obj;
  },

  check: function(files, file) {
    let data = files[file];

    // Only process utf8 encoded files (so no binary)
    if (!utf8(data.contents)) {
      return false;
    }

    return true;
  }
};
