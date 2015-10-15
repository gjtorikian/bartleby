/**
 * This file contains the overall site config values.
 * It's used by several plugins.
 */
var self = module.exports = {
  config: {},
  data: {},
  /* Conveniance method for wrapping the config and data files
   * within the `site` namespace
  */
  vars: function() {
    return { site: { config: self.config, data: self.data } };
  }
};
