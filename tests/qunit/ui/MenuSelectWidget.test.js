( function ( mw ) {
	var MenuSelectWidget = mw.libs.advancedSearch.ui.MenuSelectWidget,
		Model = mw.libs.advancedSearch.dm.SearchModel;

	QUnit.module( 'ext.advancedSearch.ui.MenuSelectWidget' );

	QUnit.test( 'Populates the dropdown with the provided namespaces', function ( assert ) {
		var namespaces = {
				0: 'Article',
				1: 'Talk',
				2: 'User',
				3: 'UserTalk'
			},
			menu = new MenuSelectWidget( Model, {
				namespaces: namespaces
			} );

		menu.getItems().forEach( function ( idx, item ) {
			assert.equal( namespaces[ idx ], item.$label );
		} );
		assert.equal( menu.getItemCount(), 4 );
	} );

}( mediaWiki ) );
