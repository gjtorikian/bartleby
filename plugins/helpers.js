module.exports = {
  createNestedObject: function (base, names, final_value) {
    for (var i = 0; i < names.length; i++) {
      base = base[names[i]] = i == names.length - 1 ? final_value : (base[names[i]] || {});
    }
  }
};
