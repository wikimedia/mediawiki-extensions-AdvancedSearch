'use strict';

const assert = require( 'assert' );
const SearchPage = require( '../pageobjects/search.page' );
const UserLoginPage = require( '../../../../../tests/selenium/pageobjects/userlogin.page' );

describe( 'Advanced Search', function () {

	const url = require( 'url' ), // https://nodejs.org/docs/latest/api/url.html
		baseUrl = url.parse( browser.options.baseUrl ), // http://webdriver.io/guide/testrunner/browserobject.html
		Bot = require( 'nodemw' ), // https://github.com/macbre/nodemw
		client = new Bot( {
			protocol: baseUrl.protocol,
			server: baseUrl.hostname,
			port: baseUrl.port,
			path: baseUrl.path,
			username: browser.options.username,
			password: browser.options.password
		} );

	function setSearchNamespaceOptions( namespaceIds ) {
		return new Promise( ( resolve, reject ) => {
			client.logIn( ( err ) => {
				if ( err ) {
					return reject( err );
				}
				resolve();
			} );
		} ).then( () => {
			return new Promise( ( resolve, reject ) => {
				client.getToken( '', '', ( err, token ) => {
					if ( err ) {
						return reject( err );
					}
					resolve( token );
				} );
			} );
		} ).then( ( token ) => {
			return new Promise( ( resolve, reject ) => {
				const searchNamespaces = namespaceIds.map( ( nsId ) => {
					return 'searchNs' + nsId + '=true';
				} ).join( '|' );
				client.api.call( {
					action: 'options',
					change: searchNamespaces,
					token: token
				}, ( err ) => {
					if ( err ) {
						return reject( err );
					}
					resolve();
				}, 'POST' );
			} );
		} );
	}

	function resetSearchNamespaceOptions() {

		return new Promise( ( resolve, reject ) => {
			client.logIn( ( err ) => {
				if ( err ) {
					return reject( err );
				}
				resolve();
			} );
		} ).then( () => {
			return new Promise( ( resolve, reject ) => {
				client.getToken( '', '', ( err, token ) => {
					if ( err ) {
						return reject( err );
					}
					resolve( token );
				} );
			} );
		} ).then( ( token ) => {
			return new Promise( ( resolve, reject ) => {
				client.api.call( {
					action: 'options',
					change: 'searchNs0=true',
					reset: true,
					token: token
				}, ( err ) => {
					if ( err ) {
						return reject( err );
					}
					resolve();
				}, 'POST' );
			} );
		} );
	}

	it( 'selects the default namespaces', () => {
		browser.call( resetSearchNamespaceOptions );
		browser.call( () => { return setSearchNamespaceOptions( [ '0', '1', '2', '10' ] ); } );
		UserLoginPage.login( browser.options.username, browser.options.password );
		SearchPage.open();
		let selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs(),
			expectedNamespaceIDs = [ '0', '1', '2', '10' ];
		selectedNamespaceIDs.sort();
		expectedNamespaceIDs.sort();
		browser.call( resetSearchNamespaceOptions );

		assert.deepEqual( selectedNamespaceIDs, expectedNamespaceIDs );
	} );

	it( 'selects the namespaces from the URL', () => {
		SearchPage.open( { ns0: 1, ns1: 1, ns2: 1, ns10: 1 } );
		let selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs(),
			expectedNamespaceIDs = [ '0', '1', '2', '10' ];
		selectedNamespaceIDs.sort();
		expectedNamespaceIDs.sort();
		browser.call( resetSearchNamespaceOptions );

		assert.deepEqual( selectedNamespaceIDs, expectedNamespaceIDs );
	} );

	it( 'ignores the namespaces from the URL when advancedSearch is submitted', () => {
		SearchPage.open( {
			ns0: 1,
			ns1: 1,
			ns2: 1,
			ns10: 1,
			// fake an advancedSearch submission by providing a state
			'advancedSearch-current': JSON.stringify( { options: {}, namespaces: [ '1', '2' ] } )
		} );
		let selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs(),
			expectedNamespaceIDs = [ '1', '2' ];
		selectedNamespaceIDs.sort();
		expectedNamespaceIDs.sort();
		browser.call( resetSearchNamespaceOptions );

		assert.deepEqual( selectedNamespaceIDs, expectedNamespaceIDs );
	} );

} );
