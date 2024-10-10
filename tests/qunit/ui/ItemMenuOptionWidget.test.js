QUnit.module( 'ext.advancedSearch.ui.ItemMenuOptionWidget' );

QUnit.test( 'Creates a valid menu option', ( assert ) => {
	const { CheckboxInputWidget, ItemMenuOptionWidget } = require( 'ext.advancedSearch.elements' );

	const menuOption = new ItemMenuOptionWidget( {
		data: '2',
		label: 'User'
	} );
	assert.true( menuOption.checkboxWidget instanceof CheckboxInputWidget );
	assert.strictEqual( menuOption.getData(), '2' );
	assert.strictEqual( menuOption.getLabel(), 'User' );
} );
