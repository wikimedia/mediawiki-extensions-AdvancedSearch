'use strict';

const assert = require( 'assert' );
const url = require( 'url' );
const querystring = require( 'querystring' );
const SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	function addExamplePages( numPages ) {
		const Bot = require( 'mwbot' ), // https://github.com/Fannon/mwbot
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
				username: browser.config.mwUser,
				password: browser.config.mwPwd,
				apiUrl: browser.options.baseUrl + '/api.php'
			} ).then( () => {
				return editPage( 0 );
			} ).catch( ( err ) => {
				return reject( err );
			} );
		} );
	}
	function assertURLContainsAdvancedSearchState( urlStr ) {
		// eslint-disable-next-line node/no-deprecated-api
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
		$( '.mw-advancedSearch-container' ).waitForDisplayed( 10000 );

		assert( SearchPage.searchPaginationLink.isExisting() );
		SearchPage.searchPaginationLinks.forEach( function ( link ) {
			assertURLContainsAdvancedSearchState( link.getAttribute( 'href' ) );
		} );
	} );
} );
