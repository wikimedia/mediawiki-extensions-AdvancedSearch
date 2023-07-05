QUnit.module( 'ext.advancedSearch.ui.MenuSelectWidget' );

QUnit.test( 'Populates the dropdown with the provided namespaces', function ( assert ) {
	const { MenuSelectWidget, SearchModel } = require( 'ext.advancedSearch.elements' );
	const namespaces = {
			0: 'Article',
			1: 'Talk',
			2: 'User',
			3: 'UserTalk'
		},
		menu = new MenuSelectWidget( new SearchModel(), {
			namespaces: namespaces
		} );

	menu.getItems().forEach( function ( idx, item ) {
		assert.strictEqual( namespaces[ idx ], item.$label );
	} );
	assert.strictEqual( menu.getItemCount(), 4 );
} );
