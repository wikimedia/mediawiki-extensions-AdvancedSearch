# AdvancedSearch

The [AdvancedSearch extension](https://www.mediawiki.org/wiki/Extension:AdvancedSearch) enhances
Special:Search by providing an advanced parameters form and improving how namespaces for a
search query are selected.

## Development

This project uses [npm](https://docs.npmjs.com/) and [grunt](https://gruntjs.com/) to run
JavaScript-related tasks (e.g. linting).
[Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/)
_can_ be used to ease installation.

### Installation

    docker-compose run --rm js-build npm install

### Run Linting

    docker-compose run --rm js-build grunt
