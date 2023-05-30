'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	it( 'adds search parameters to pagination links', async function () {
		await SearchPage.addExamplePages( 2 );
		await SearchPage.open( {
			limit: 1,
			search: 'The',
			'advancedSearch-current': JSON.stringify( { fields: { plain: [ 'The' ] } } ) } );
		await ( await SearchPage.getSearchPaginationLinks() )[ 0 ].waitForExist();

		for ( const link of await SearchPage.getSearchPaginationLinks() ) {
			assert( ( await link.getAttribute( 'href' ) ).includes( 'advancedSearch-current' ) );
		}
	} );
} );
