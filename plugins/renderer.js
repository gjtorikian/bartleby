let path = require('path'),

  debug = require('debug'),
  debugMarkdown = debug('markdown'),
  conrefifier = require('./conrefifier'),

  Remarkable = require('remarkable'),
  md = new Remarkable(),
  Liquid = require("liquid-node"),
  engine = new Liquid.Engine(),
  toc = require('toc'),

  _ = require('lodash');

const LIQUID_CONTENT = /\{\{.+?\}\}/g;

const OPEN_INTRO = /<p>\{\{#intro\}\}<\/p>/g;
const CLOSE_INTRO = /<p>\{\{\/intro\}\}<\/p>/g;

module.exports = {
  markdown: async function (files, metalsmith, done) {
    debugMarkdown("Markdown");
    for (let file of Object.keys(files)) {
      await processFile(metalsmith, file);
    }
    debugMarkdown("Markdown");
    done();

    /*
       This function converts a Markdown file into HTML. It does not
       apply the layout.
    */
    async function processFile(metalsmith, file) {
      if (".md" != path.extname(file)) return;

      var fileData = files[file];
      let modifiedFileData = [];
      let dir = path.dirname(file);
      let html = path.basename(file, path.extname(file)) + '.html';
      if ('.' != dir) html = dir + '/' + html;

      files[file].page = {}
      for (let fileKey of Object.keys(fileData)) {
        await processFrontmatter(metalsmith, files[file], fileKey);
      }

      return new Promise(function (resolve) {
        let contents = fileData.contents.toString();
        let parsed = md.render(contents);

        parsed = applyCustomizations(parsed);
        parsed = applyTOC(parsed);

        fileData.contents = new Buffer(parsed);

        delete files[file];
        files[html] = fileData;
        delete files[html].page.page; // TODO: erroneous circular reference here

        return resolve();
      });
    }

    /* This function goes through a file's frontmatter and converts Liquid variables
       in Strings and Arrays
    */
    function processFrontmatter(metalsmith, fileData, fileKey) {
      return new Promise(function (resolve) {
        if (fileKey == "contents" || fileKey == "mode" || fileKey == "stats") {
          return resolve(fileData);
        }

        let value = fileData[fileKey];
        var modifiedFileData = fileData;
        modifiedFileData.page[fileKey] = value;

        if (LIQUID_CONTENT.test(value)) {
          if (_.isArray(value)) {
            value = _.map(value, function (el) {
              if (LIQUID_CONTENT.test(el)) {
                el.replace(LIQUID_CONTENT, function (match) {
                  let data_vars = conrefifier.setup_config(datafiles.data, metalsmith);
                  conrefifier.convert(match, data_vars, function (result) {
                    modifiedFileData.page[fileKey] = result;
                  });
                });
              } else {
                return el;
              }
            });
            return resolve(modifiedFileData);
          } else if (_.isString(value)) {
            let data_vars = conrefifier.setupConfig(metalsmith);
            conrefifier.convert(value, data_vars, function (result) {
              modifiedFileData.page[fileKey] = result;
              return resolve(modifiedFileData);
            });
          }
        } else {
          return resolve(fileData);
        }
      });
    };

    function applyCustomizations(html) {
      return html.replace(OPEN_INTRO, '<div class="intro">')
                     .replace(CLOSE_INTRO,  '</div>');
    }

    function applyTOC(html) {
      return toc.process(html, {
        header: '<h<%= level %>><a name="<%= anchor %>" class="anchor" href="#<%= anchor %>"><span class="octicon octicon-link"></span></a><%= header %></h<%= level %>>'
      });
    }
  }
};
