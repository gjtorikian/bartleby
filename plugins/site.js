/**
 * This file contains the overall site config values.
 * It's used by several plugins.
 */
var self = module.exports = {
  config: {},
  data: {},
  metadata: {},

  /* Conveniance method for wrapping the config and data files
   * within the `site` namespace
  */
  vars: function() {
    return { config: self.config, data: self.data, metadata: self.metadata };
  }
};
