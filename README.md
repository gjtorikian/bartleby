# graffito

A next generation documentation site. This combines a lot of DITA-esque ideas with the relative ease of a markup language.

## Installation

``` bash
npm install graffito
```

## Data concepts

* `config`
* `data`
* `page`

* Data files are read
* Config is read
* Frontmatter is read
* Liquid is applied to frontmatter

## Usage

``` javascript
var graffito = require('graffito')

graffito([{
    source: "spec/fixtures/sample/content/dotcom/articles",
    destination: "_site/articles",
    directory: "spec/fixtures/sample/layouts",
    partials: "spec/fixtures/sample/layouts/includes"
  },
  {
    source: "spec/fixtures/content/post",
    destination: "_site/post",
    directory: "spec/fixtures/sample/layouts",
    partials: "spec/fixtures/sample/layouts/includes"
  }
]);

```

Returns a Promise.

## Options

| Option | Description | Default |
| :----- | :---------- | :------ |
| `base` | | `` |
| `destination` | | `` |
| `directory` | | `` |
| `partials` | | `` |
| `plugins` | | `` |
| `source` | | `` |

## Redirects

### Redirect_from array

### Redirect_to

## Plugins
