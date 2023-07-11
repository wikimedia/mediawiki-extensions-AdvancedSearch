'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {
	it( 'adds search parameters to pagination links', function () {
		SearchPage.addExamplePages( 2 );
		SearchPage.open( {
			limit: 1,
			search: 'The',
			'advancedSearch-current': JSON.stringify( { fields: { plain: [ 'The' ] } } ) } );
		SearchPage.searchPaginationLinks[ 0 ].waitForExist();

		SearchPage.searchPaginationLinks.forEach( function ( link ) {
			assert( link.getAttribute( 'href' ).includes( 'advancedSearch-current' ) );
		} );
	} );
} );
