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

  matter = require('gray-matter'),
  _ = require('lodash');

const LIQUID_CONTENT = /\{\{.+?\}\}/g;

const OPEN_INTRO = /<p>\{\{#intro\}\}<\/p>/g;
const CLOSE_INTRO = /<p>\{\{\/intro\}\}<\/p>/g;

module.exports = {
  markdown: async function(files, metalsmith, done) {
    debugMarkdown("Markdown");

    let dataVars = conrefifier.setupConfig(metalsmith._source, metalsmith._metadata);
    let fileData = {};

    for (let file of Object.keys(files)) {
      await processFile(file).then(null, function(error) {
        if (error)
          console.error(`Error while processing ${file}: ${error}`);
      });
    }
    debugMarkdown("Markdown");
    done();

    /*
       This function converts a Markdown file into HTML. It does not
       apply the layout.
    */
    async function processFile(file) {
      if (".md" != path.extname(file)) return;

      let modifiedFileData = [];
      let dir = path.dirname(file);
      let html = path.basename(file, path.extname(file)) + ".html";
      if ("." != dir) html = dir + "/" + html;

      fileData = files[file];
      let contents = fileData.contents.toString();

      // This first pass converts the frontmatter variables,
      // and inserts data variables into the body
      let result = await applyLiquid(contents, dataVars);

      let parsed = matter(result);
      let frontmatter = parsed.data;

      for (let frontmatterKey of Object.keys(frontmatter)) {
        await createRedirects(frontmatterKey);
      }

      // apply frontmatter under the "page" namespace
      files[file].page = frontmatter;

      // This second application renders the data conditionals within the body
      let body = await applyLiquid(parsed.content, dataVars);
      let renderedBody = md.render(body);

      return new Promise(function(resolve, reject) {
        try {
          renderedBody = applyCustomizations(renderedBody);
          renderedBody = applyTOC(renderedBody);
          renderedBody = applyEmoji(renderedBody);

          fileData.contents = new Buffer(renderedBody);

          delete files[file];
          files[html] = fileData;

          return resolve();
        } catch (error) {
          console.error(`Error while processing ${file}: ${error}`);
          return reject(error);
        }
      });
    }

    function createRedirects(frontmatterKey) {
      return new Promise(function(resolve) {
        if (frontmatterKey == "redirect_from") {
          redirects.createRedirectFrom(frontmatterKey);
        }
        else if (frontmatterKey == "redirect_to") {
          redirects.createRedirectTo(frontmatterKey);
        }
        return resolve();
      });
    };

    function applyLiquid(content, dataVars) {
      return engine
        .parse(content)
        .then(function (template) {
          return template.render(dataVars);
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

    // TODO: need to ignore pre, code, tt ancestors
    function applyEmoji(html) {
      return emojis.replaceWithHtml(html, 'https://assets-cdn.github.com/images/icons/emoji/')
    };
  }
};
