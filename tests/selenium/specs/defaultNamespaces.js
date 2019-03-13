'use strict';

const assert = require( 'assert' );
const SearchPage = require( '../pageobjects/search.page' );
const UserLoginPage = require( '../../../../../tests/selenium/pageobjects/userlogin.page' );

describe( 'Advanced Search', function () {
	const log = require( 'semlog' ).log, // https://github.com/fannon/semlog/
		Bot = require( 'mwbot' ); // https://github.com/Fannon/mwbot

	function setSearchNamespaceOptions( namespaceIds ) {
		const client = new Bot();
		return client.loginGetEditToken( {
			username: browser.options.username,
			password: browser.options.password,
			apiUrl: browser.options.baseUrl + '/api.php'
		} ).then( () => {
			return client.request( {
				action: 'query',
				meta: 'userinfo',
				uiprop: 'options'
			} ).then( ( data ) => {
				let searchNamespaces = namespaceIds.map( ( nsId ) => {
					return 'searchNs' + nsId + '=1';
				} ).join( '|' );
				const userOptions = data.query.userinfo.options;
				Object.keys( userOptions ).forEach( function ( key ) {
					if ( userOptions[ key ] &&
						key.indexOf( 'searchNs' ) === 0 &&
						searchNamespaces.indexOf( key + '=1' ) === -1
					) {
						searchNamespaces += '|' + key + '=0';
					}
				} );
				return client.request( {
					action: 'options',
					change: searchNamespaces,
					token: client.editToken
				} ).catch( ( err ) => {
					log( err );
				} );
			} ).catch( ( err ) => {
				log( err );
			} );
		} ).catch( ( err ) => {
			log( err );
		} );
	}

	function resetUserOptions() {
		const client = new Bot();
		return client.loginGetEditToken( {
			username: browser.options.username,
			password: browser.options.password,
			apiUrl: browser.options.baseUrl + '/api.php'
		} ).then( () => {
			return client.request( {
				action: 'options',
				reset: true,
				token: client.editToken
			} ).catch( ( err ) => {
				log( err );
			} );
		} ).catch( ( err ) => {
			log( err );
		} );
	}

	it( 'selects the default namespaces', function () {
		browser.call( resetUserOptions );
		browser.call( () => {
			return setSearchNamespaceOptions( [ '0', '1', '2', '10' ] );
		} );
		UserLoginPage.login( browser.options.username, browser.options.password );
		SearchPage.open();
		let selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs(),
			expectedNamespaceIDs = [ '0', '1', '2', '10' ];
		selectedNamespaceIDs.sort();
		expectedNamespaceIDs.sort();
		browser.call( resetUserOptions );

		assert.deepEqual( selectedNamespaceIDs, expectedNamespaceIDs );
	} );

	it( 'selects the namespaces from the URL', function () {
		SearchPage.open( { ns0: 1, ns1: 1, ns2: 1, ns10: 1 } );
		let selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs(),
			expectedNamespaceIDs = [ '0', '1', '2', '10' ];
		selectedNamespaceIDs.sort();
		expectedNamespaceIDs.sort();
		browser.call( resetUserOptions );

		assert.deepEqual( selectedNamespaceIDs, expectedNamespaceIDs );
	} );

	it( 'displays the default namespaces of the user and wiki and that the default checkbox is selected', function () {
		// Since MediaWiki core does not allow us to delete the NS_MAIN namespace,
		// we add it to the expected result
		let defaultNamespaceOptions = [ '15', '4', '5', '6' ];
		let expectedNamespaceOptions = [ '0', '15', '4', '5', '6' ];
		browser.call( resetUserOptions );
		browser.call( () => {
			return setSearchNamespaceOptions( defaultNamespaceOptions );
		} );
		UserLoginPage.login( browser.options.username, browser.options.password );
		SearchPage.open();
		let selectedNamespaceIDs = SearchPage.getSelectedNamespaceIDs();
		selectedNamespaceIDs.sort();
		expectedNamespaceOptions.sort();
		assert( SearchPage.default.isSelected() );
		assert.deepEqual( expectedNamespaceOptions, selectedNamespaceIDs );
	} );
} );
