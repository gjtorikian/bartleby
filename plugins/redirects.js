let path = require("path");

module.exports = {
  createRedirectFrom: async function (metalsmith, files, file, redirects) {
    try {
      for (let redirect of redirects) {
        await generateRedirectFrom(metalsmith, files, file, redirect);
      }
    }
    catch (e) {
      console.error(`Error generating redirect_from: ${e}`);
      reject(e);
    }

    return new Promise(function(resolve) { return resolve(); });

    function generateRedirectFrom(metalsmith, files, file, redirect) {
      let splitPath = metalsmith._destination.split(path.sep);
      let paths = splitPath.splice(0, 1);
      paths.push(splitPath.join(path.sep));

      let basename = path.basename(file, ".md");
      let dest = `${path.sep}${paths[1]}${path.sep}${basename}/`;

      files[`.${path.sep}${redirect}/index.html`] = { contents: redirectPage(dest) };
    }

    function redirectPage(url) {
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
  },

  createRedirectTo: async function (metalsmith, files, file, redirect) {
    try {
      let splitPath = metalsmith._destination.split(path.sep);
      let paths = splitPath.splice(0, 1);
      paths.push(splitPath.join(path.sep));

      let basename = path.basename(file, ".md");
      let dest = `${path.sep}${paths[1]}${path.sep}${basename}/`;

      files[`${dest}/index.html`] = { contents: redirectPage(redirect) };
    }
    catch (e) {
      console.error(`Error generating redirect_to: ${e}`);
      reject(e);
    }

    return new Promise(function(resolve) { return resolve(); });

    function redirectPage(url) {
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
}
