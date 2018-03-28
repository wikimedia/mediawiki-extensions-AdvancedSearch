'use strict';

const assert = require( 'assert' );
const url = require( 'url' );
const querystring = require( 'querystring' );
const SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	function addExamplePages( numPages ) {
		let Bot = require( 'mwbot' ), // https://github.com/Fannon/mwbot
			client = new Bot(),
			animals = [ 'cat', 'goat' ];

		return new Promise( function ( resolve, reject ) {
			const editPage = function ( pageNumber ) {
				const content = 'The big brown ' + animals[ pageNumber % 2 ] + ' jumped over the lazy dog.';
				client.edit(
					'Search Test Page ' + ( pageNumber + 1 ),
					content,
					'Created page with "' + content + '"'
				).then( () => {
					if ( pageNumber > numPages ) {
						return resolve();
					} else {
						return editPage( pageNumber + 1 );
					}
				} ).catch( ( err ) => {
					return reject( err );
				} );
			};
			client.loginGetEditToken( {
				username: browser.options.username,
				password: browser.options.password,
				apiUrl: browser.options.baseUrl + '/api.php'
			} ).then( () => {
				return editPage( 0 );
			} ).catch( ( err ) => {
				return reject( err );
			} );
		} );
	}
	function assertURLContainsAdvancedSearchState( urlStr ) {
		const urlparts = url.parse( urlStr ),
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
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'brown,' );
		SearchPage.searchExactText.put( '"jumped over"' );
		SearchPage.submitForm();
		browser.waitForVisible( '.mw-advancedSearch-container', 10000 );

		assert( SearchPage.searchPaginationLinks.isExisting() );
		SearchPage.searchPaginationLinks.value.map( function ( link ) {
			assertURLContainsAdvancedSearchState( link.getAttribute( 'href' ) );
		} );
	} );
} );
