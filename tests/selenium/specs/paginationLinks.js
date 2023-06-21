'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {
	it( 'adds search parameters to pagination links', function () {
		SearchPage.addExamplePages( 21 );
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'brown,' );
		SearchPage.searchExactText.put( '"jumped over"' );
		SearchPage.submitForm();
		SearchPage.searchPaginationLinks[ 0 ].waitForExist();

		SearchPage.searchPaginationLinks.forEach( function ( link ) {
			assert( link.getAttribute( 'href' ).includes( 'advancedSearch-current' ) );
		} );
	} );
} );
