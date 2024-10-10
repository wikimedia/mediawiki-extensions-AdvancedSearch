QUnit.module( 'ext.advancedSearch.ui.MenuSelectWidget' );

QUnit.test( 'Populates the dropdown with the provided namespaces', ( assert ) => {
	const { MenuSelectWidget } = require( 'ext.advancedSearch.elements' );
	const namespaces = {
			0: 'Article',
			1: 'Talk',
			2: 'User',
			3: 'UserTalk'
		},
		menu = new MenuSelectWidget( {
			namespaces: namespaces
		} );

	menu.getItems().forEach( ( idx, item ) => {
		assert.strictEqual( namespaces[ idx ], item.$label );
	} );
	assert.strictEqual( menu.getItemCount(), 4 );
} );
