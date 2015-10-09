module.exports = {
  createRedirectFrom: async function (metalsmith, fileData, fileKey) {
    for (let value of fileData[fileKey]) {
      await generateRedirectFrom(metalsmith, fileData, value);
    }
    return new Promise(function(resolve) { return resolve(); });

    function generateRedirectFrom(metalsmith, fileData, value) {

    }
  }
};
