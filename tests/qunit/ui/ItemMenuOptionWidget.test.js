( function () {
	var ItemMenuOptionWidget = mw.libs.advancedSearch.ui.ItemMenuOptionWidget;

	QUnit.module( 'ext.advancedSearch.ui.ItemMenuOptionWidget' );

	QUnit.test( 'Creates a valid menu option', function ( assert ) {
		var menuOption = new ItemMenuOptionWidget( {
			data: '2',
			label: 'User'
		} );
		assert.true( menuOption.checkboxWidget instanceof mw.libs.advancedSearch.ui.CheckboxInputWidget );
		assert.strictEqual( menuOption.getData(), '2' );
		assert.strictEqual( menuOption.getLabel(), 'User' );
	} );

}() );
