'use strict';

const SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', () => {

	it( 'adds search parameters to pagination links', async () => {
		await SearchPage.addExamplePages( 2 );
		await SearchPage.open( {
			limit: 1,
			search: 'The',
			'advancedSearch-current': JSON.stringify( { fields: { plain: [ 'The' ] } } ) } );
		await ( await SearchPage.getSearchPaginationLinks() )[ 0 ].waitForExist();

		for ( const link of await SearchPage.getSearchPaginationLinks() ) {
			await expect( await link.getAttribute( 'href' ) ).toContain( 'advancedSearch-current' );
		}
	} );
} );
