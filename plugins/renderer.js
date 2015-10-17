let path = require("path"),

  debug = require("debug"),
  debugRenderer = debug("bartleby-renderer"),
  site = require("./site"),
  redirects   = require("./redirects"),
  layout = require("./layout"),
  conrefifier = require("./conrefifier"),
  helpers = require("./helpers"),

  Remarkable = require("remarkable"),
  md = new Remarkable({html: true}),
  toc = require("toc"),
  emojis = require("emojis"),

  matter = require("gray-matter"),
  _ = require("lodash");

const IGNORED_TAG = /`\{[%\{](.+?)[%\}]\}`/g;
const OPEN_INTRO = /\{\{#intro\}\}/g;
const CLOSE_INTRO = /\{\{\/intro\}\}/g;

module.exports = renderer;
let metalsmith = {}, files = [], source = "";

/**
 * This function acts as a typical Metalsmith plugin. It takes
 * a set of files and converts Markdown into HTML. Along the way,
 * it also translates conrefs (written as Liquid variables)
 * into their proper text.
 */
function renderer(options) {
  return async function(f, ms, done) {
    debugRenderer("Start renderer");
    metalsmith = ms;
    files = f;
    source = metalsmith._source;
    site.metadata[source] = [];

    try {
      for (let file of Object.keys(files)) {
        if (".md" == path.extname(file)) {
          await processMarkdown(file);
        }
        else if (".json" == path.extname(file)) {
          await processJson(file);
        }
      }
      site.metadata[source] = files;
    } catch (e) {
      console.error(`Error rendering file: ${e}`);
      throw e;
    }
    debugRenderer("End renderer");
    done();
  }

  /*
     This function converts a Markdown file into HTML.
     It does not apply a layout.
  */
  async function processMarkdown(file) {
    // Prepares the final filename
    let dir = path.dirname(file);
    let pathname = path.basename(file, path.extname(file));
    if ("." != dir) pathname = dir + "/" + pathname;

    // Fetch file contents
    let fileData = files[file];
    let contents = fileData.contents.toString();

    // Apply some pre-processing
    contents = applyIntro(contents);
    contents = applyCommandline(contents);
    contents = ignoreTags(contents);

    let pageVars = conrefifier.setupPageVars(site.config.page_variables, file);
    pageVars = { "site": site.vars(), "page": pageVars };

    // This first pass converts the frontmatter variables,
    // and inserts data variables into the body
    let result = await layout.applyLiquid(contents, pageVars);
    // This second application renders the previously inserted
    // data conditionals within the body
    result = await layout.applyLiquid(result, pageVars);

    let parsed = matter(result);
    let frontmatter = parsed.data;

    for (let frontmatterKey of Object.keys(frontmatter)) {
      await createRedirects(file, frontmatterKey, frontmatter[frontmatterKey]);
    }

    // We can stop now, the redirector will rewrite this file
    if (frontmatter.redirect_to) {
      return new Promise(function(resolve) { return resolve(); });
    }

    // Apply all frontmatter under the "page" namespace
    files[file].page = frontmatter;

    let renderedBody = md.render(parsed.content);

    return new Promise(function(resolve, reject) {
      try {
        renderedBody = applyTOC(renderedBody);
        renderedBody = applyEmoji(renderedBody);

        fileData.contents = new Buffer(renderedBody);

        delete files[file];
        files[`${pathname}/index.html`] = fileData;
        files[`${pathname}/index.html`].pathname = pathname;
        files[`${pathname}/index.html`].string_contents = renderedBody;

        if (options.build.navigation) {
          files[`${pathname}/index.html`].page.parents = findParents(fileData.page.title, options.build.navigation);
        }

        return resolve();
      } catch (error) {
        console.error(`Error while processing Markdown ${file}: ${error}`);
        return reject(error);
      }
    });
  }

  async function processJson(file) {
    // Prepares the final filename
    let dir = path.dirname(file);
    let pathname = path.basename(file, path.extname(file));
    if ("." != dir) pathname = dir + "/" + pathname;

    // Fetch file contents
    let fileData = files[file];
    let contents = fileData.contents.toString();

    let pageVars = conrefifier.setupPageVars(site.config.page_variables, file);
    pageVars = { site: site.vars(), page: pageVars };

    let result = await layout.applyLiquid(contents, pageVars);
    let parsed = matter(result);

    files[file].page = _.merge(pageVars, parsed.data);

    return new Promise(function(resolve, reject) {
      try {
        fileData.contents = new Buffer(parsed.content);

        delete files[file];
        files[`${pathname}.json`] = fileData;

        return resolve();
      } catch (error) {
        console.error(`Error while processing JSON ${file}: ${error}`);
        return reject(error);
      }
    });
  }

  function findParents(title, navigation) {
    let siteVars = site.vars();
    let dataFileContents = helpers.fetchNestedObject(siteVars, navigation);
    let parents = _.findKey(dataFileContents, function(o) {
      if (_.isObject(o[0])) {
        let category = Object.keys(o[0])[0];
        if (_.includes(o[0][category], title)) {
          return category;
        }
      }
      else {
        return _.includes(o, title);
      }
    });

    return parents;
  }

  function createRedirects(file, frontmatterKey, frontmatterValue) {
    return new Promise(function(resolve) {
      if (frontmatterKey == "redirect_from") {
        redirects.createRedirectFrom(metalsmith, files, file, frontmatterValue);
      }
      else if (frontmatterKey == "redirect_to") {
        redirects.createRedirectTo(metalsmith, files, file, frontmatterValue);
      }
      return resolve();
    });
  }

  function applyIntro(text) {
    return text.replace(OPEN_INTRO, "<div class=\"intro\">")
               .replace(CLOSE_INTRO, "</div>");
  }

  function applyCommandline(text) {
    return text.replace(/\n?``` command-line([^`]+)```$/gm, function(match) {
      match = match.replace(/^\s*``` command-line/g, "<pre class=\"command-line\">");
      match = match.replace(/```/g, "</pre>\n");
      match = match.replace(/^\$ (.+)$/gm, "<span class=\"command\">$1</span>");
      match = match.replace(/^(\# .+)$/gm, "<span class=\"comment\">$1</span>");
      match = match.replace(/^> (.+)$/gm, "<span class=\"output\"><span># </span>$1</span>");

      return match;
    });
  }

  function ignoreTags(text) {
    return text.replace(IGNORED_TAG, "<code>&123;%$1%}</code>");
  }

  function applyTOC(html) {
    return toc.process(html, {
      header: "<h<%= level %>><a name=\"<%= anchor %>\" class=\"anchor\" href=\"#<%= anchor %>\"><span class=\"octicon octicon-link\"></span></a><%= header %></h<%= level %>>"
    });
  }

  // TODO: need to ignore pre, code, tt ancestors
  function applyEmoji(html) {
    return emojis.replaceWithHtml(html, 'https://assets-cdn.github.com/images/icons/emoji/')
  }
}
