'use strict';

var assert = require( 'assert' );
var SpecialPage = require( '../pageobjects/special.page' );
var SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	it( 'has the advanced search extension installed', function () {

		SpecialPage.open();

		assert( SpecialPage.advancedSearchExtensionLink.isVisible() );

	} );

	it( 'inserts advanced search elements on search page', function () {

		SearchPage.open();

		assert( SearchPage.searchContainer.isVisible() );

	} );

} );
