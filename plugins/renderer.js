let path = require('path'),

  debug = require('debug'),
  debugMarkdown = debug('markdown'),
  conrefifier = require('./conrefifier'),
  redirects   = require('./redirects'),

  Remarkable = require('remarkable'),
  md = new Remarkable(),
  Liquid = require("liquid-node"),
  engine = new Liquid.Engine(),
  toc = require('toc'),
  emojis = require('emojis'),

  _ = require('lodash');

const LIQUID_CONTENT = /\{\{.+?\}\}/g;

const OPEN_INTRO = /<p>\{\{#intro\}\}<\/p>/g;
const CLOSE_INTRO = /<p>\{\{\/intro\}\}<\/p>/g;

module.exports = {
  markdown: async function(files, metalsmith, done) {
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
      let dataVars = conrefifier.setupConfig(metalsmith._source, metalsmith._metadata);

      for (let fileKey of Object.keys(fileData)) {
        await processFrontmatter(dataVars, files[file], fileKey);
      }

      return new Promise(function(resolve) {
        let contents = fileData.contents.toString();

        // TODO: gross. we need to apply Liquid twice: once
        // to apply the data, and a second to render the conditionals
        // within that data
        applyLiquid(contents, dataVars, function(firstResult) {
          applyLiquid(firstResult, dataVars, function(finalResult) {
            let parsed = md.render(finalResult);

            parsed = applyCustomizations(parsed);
            parsed = applyTOC(parsed);
            parsed = applyEmoji(parsed);

            fileData.contents = new Buffer(parsed);

            delete files[file];
            files[html] = fileData;
            delete files[html].page.page; // TODO: erroneous circular reference here

            return resolve();
          });
        });
      });
    }

    /* This function goes through a file's frontmatter and converts Liquid variables
       in Strings and Arrays
    */
    function processFrontmatter(dataVars, fileData, fileKey) {
      return new Promise(function(resolve) {
        if (fileKey == "contents" || fileKey == "mode" || fileKey == "stats") {
          return resolve(fileData);
        }

        // if (fileKey == "redirect_from") {
        //   redirects.createRedirectFrom(metalsmith, fileData, fileKey);
        //   return resolve(fileData);
        // }
        // if (fileKey == "redirect_to") {
        //   redirects.createRedirectTo(metalsmith, fileData, fileKey);
        //   return resolve(fileData)
        // }

        let value = fileData[fileKey];
        var modifiedFileData = fileData;
        modifiedFileData.page[fileKey] = value;

        // We need to apply Liquid to the frontmatter to replace variables
        // applied from the config file
        if (LIQUID_CONTENT.test(value)) {
          if (_.isArray(value)) {
            value = _.map(value, function(el) {
              if (LIQUID_CONTENT.test(el)) {
                el.replace(LIQUID_CONTENT, function(match) {
                  applyLiquid(match, dataVars, function(result) {
                    modifiedFileData.page[fileKey] = result;
                  });
                });
              } else {
                return el;
              }
            });
            return resolve(modifiedFileData);
          } else if (_.isString(value)) {
            applyLiquid(value, dataVars, function(result) {
              modifiedFileData.page[fileKey] = result;
              return resolve(modifiedFileData);
            });
          }
        } else {
          return resolve(fileData);
        }
      });
    };

    function applyLiquid(content, dataVars, callback) {
      engine
        .parse(content)
        .then(function (template) {
          return template.render(dataVars);
        })
        .then(function (result) {
          callback(result);
        });
    }

    function applyCustomizations(html) {
      return html.replace(OPEN_INTRO, '<div class="intro">')
        .replace(CLOSE_INTRO, '</div>');
    };

    function applyTOC(html) {
      return toc.process(html, {
        header: '<h<%= level %>><a name="<%= anchor %>" class="anchor" href="#<%= anchor %>"><span class="octicon octicon-link"></span></a><%= header %></h<%= level %>>'
      });
    };

    // TODO: ignore pre, code, tt ancestors
    function applyEmoji(html) {
      return emojis.replaceWithHtml(html, 'https://assets-cdn.github.com/images/icons/emoji/')
    };
  }
};
