( function ( mw ) {
	var ItemMenuOptionWidget = mw.libs.advancedSearch.ui.ItemMenuOptionWidget;

	QUnit.module( 'ext.advancedSearch.ui.ItemMenuOptionWidget' );

	QUnit.test( 'Creates a valid menu option', function ( assert ) {
		var menuOption = new ItemMenuOptionWidget( {
			data: '2',
			label: 'User'
		} );
		assert.ok( menuOption.checkboxWidget );
		assert.strictEqual( menuOption.getData(), '2' );
		assert.strictEqual( menuOption.getLabel(), 'User' );
	} );

}( mediaWiki ) );
