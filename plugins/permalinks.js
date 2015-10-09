let path = require('path');

let basename = path.basename;
let dirname = path.dirname;
let extname = path.extname;
let join = path.join;

module.exports = permalinks;

function permalinks(options) {
  let prefix = options.prefix;

  return async function (files, metalsmith, done) {
    setImmediate(done);

    for (let file of Object.keys(files)) {
      await processPermalink(prefix, files, file);
    }

    return new Promise(function (resolve) {
      resolve()
    });
  };
};

function processPermalink(prefix, files, file) {
  return new Promise(function (resolve) {
    if (!html(file)) resolve();
    let data = files[file];
    if (data['permalink'] === false) resolve();
    let path = join(prefix, resolvePath(file));

    // add to path data for use in links in templates
    // data.path = '.' == path ? '' : path;

    let out = join(path, 'index.html');

    delete files[file];
    files[out] = data;

    resolve();
  });
}

/**
 * Resolve a permalink path string from an existing file `path`.
 *
 * @param {String} path
 * @return {String}
 */

function resolvePath(path) {
  let ret = dirname(path);
  let base = basename(path, extname(path));
  if (base != 'index') ret = join(ret, base).replace('\\', '/');
  return ret;
}

/**
 * Check whether a file is an HTML file.
 *
 * @param {String} path
 * @return {Boolean}
 */

function html(path) {
  return /.html/.test(extname(path));
}
