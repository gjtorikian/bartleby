let path = require("path");

/**
 * Responsible for generating new pages that represent redirecting from an article,
 * and redirecting to a new site.
*/
var self = module.exports = {
  createRedirectFrom: async function (metalsmith, files, file, redirects) {
    try {
      for (let redirect of redirects) {
        await generateRedirectFrom(metalsmith, files, file, redirect);
      }
    } catch (e) {
      console.error(`Error generating redirect_from: ${e}`);
      reject(e);
    }

    return new Promise(function(resolve) { return resolve(); });

    // Iterates over redirect_from values and generates new pages
    function generateRedirectFrom(metalsmith, files, file, redirect) {
      let splitPath = metalsmith._destination.split(path.sep);
      let paths = splitPath.splice(0, 1);
      paths.push(splitPath.join(path.sep));

      let basename = path.basename(file, ".md");
      let dest = `${path.sep}${paths[1]}${path.sep}${basename}/`;

      files[`.${path.sep}${redirect}/index.html`] = { contents: self.redirectPage(dest) };
    }
  },

  createRedirectTo: async function (metalsmith, files, file, redirect) {
    try {
      let splitPath = metalsmith._destination.split(path.sep);
      let paths = splitPath.splice(0, 1);
      paths.push(splitPath.join(path.sep));

      let basename = path.basename(file, ".md");
      let dest = `${path.sep}${paths[1]}${path.sep}${basename}/`;

      files[`${dest}/index.html`] = { contents: self.redirectPage(redirect) };
    } catch (e) {
      console.error(`Error generating redirect_to: ${e}`);
      reject(e);
    }

    return new Promise(function(resolve) { return resolve(); });
  },

  redirectPage: function (url) {
    return `<!DOCTYPE html>
<meta charset=utf-8>
<title>Redirecting...</title>
<link rel=canonical href="${url}">
<meta http-equiv=refresh content="0; url=${url}">
<h1>Redirecting...</h1>
<a href="${url}">Click here if you are not redirected.</a>
<script>location='${url}'</script>
`;
  }
}
