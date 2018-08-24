( function ( mw ) {
	var ItemMenuOptionWidget = mw.libs.advancedSearch.ui.ItemMenuOptionWidget;

	QUnit.module( 'ext.advancedSearch.ui.ItemMenuOptionWidget' );

	QUnit.test( 'Creates a valid menu option', function ( assert ) {
		var menuOption = new ItemMenuOptionWidget( {
			data: '2',
			label: 'User'
		} );
		assert.ok( menuOption.checkboxWidget );
		assert.equal( menuOption.getData(), '2' );
		assert.equal( menuOption.getLabel(), 'User' );
	} );

}( mediaWiki ) );
