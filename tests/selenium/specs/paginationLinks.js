'use strict';

var assert = require( 'assert' );
var url = require( 'url' );
var querystring = require( 'querystring' );
var SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	function addExamplePages( numPages ) {
		var url = require( 'url' ), // https://nodejs.org/docs/latest/api/url.html
			baseUrl = url.parse( browser.options.baseUrl ), // http://webdriver.io/guide/testrunner/browserobject.html
			Bot = require( 'nodemw' ), // https://github.com/macbre/nodemw
			client = new Bot( {
				protocol: baseUrl.protocol,
				server: baseUrl.hostname,
				port: baseUrl.port,
				path: baseUrl.path,
				username: browser.options.username,
				password: browser.options.password,
				debug: false
			} ),
			animals = [ 'cat', 'goat' ];

		return new Promise( function ( resolve, reject ) {
			var editPage = function ( pageNumber ) {
				var content = 'The big brown ' + animals[ pageNumber % 2 ] + ' jumped over the lazy dog.';
				client.edit(
					'Search Test Page ' + ( pageNumber + 1 ),
					content,
					'Created page with "' + content + '"',
					function ( err ) {
						if ( err ) {
							return reject( err );
						}
						if ( pageNumber > numPages ) {
							return resolve();
						} else {
							return editPage( pageNumber + 1 );
						}
					} );
			};
			client.logIn( function ( err ) {
				if ( err ) {
					return reject( err );
				}
				return editPage( 0 );
			} );
		} );
	}

	function assertURLContainsAdvancedSearchState( urlStr ) {
		var urlparts = url.parse( urlStr ),
			searchParams = querystring.parse( urlparts.query );
		assert( typeof searchParams[ 'advancedSearch-current' ] !== 'undefined' );
		assert( typeof JSON.parse( searchParams[ 'advancedSearch-current' ] ) === 'object' );
	}

	it( 'adds search parameters to pagination links', function () {
		this.timeout( 60000 );
		browser.call( function () {
			return addExamplePages( 21 );
		} );

		SearchPage.open();
		browser.waitForVisible( '.mw-advancedSearch-container', 10000 );
		SearchPage.searchExpandablePane.click();
		SearchPage.searchTheseWords.click();
		browser.keys( 'brown,' );
		SearchPage.searchExactText.setValue( '"jumped over"\uE007' );
		browser.waitForVisible( '.mw-advancedSearch-container', 10000 );

		assert( SearchPage.searchPaginationLinks.isExisting() );
		SearchPage.searchPaginationLinks.value.map( function ( link ) {
			assertURLContainsAdvancedSearchState( link.getAttribute( 'href' ) );
		} );
	} );
} );
