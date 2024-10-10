QUnit.module( 'ext.advancedSearch.ui.CheckboxInputWidget' );

QUnit.test( 'Checkbox does not respond to click events', ( assert ) => {
	const { CheckboxInputWidget } = require( 'ext.advancedSearch.elements' );
	const checkbox = new CheckboxInputWidget();
	checkbox.$element.trigger( 'click' );
	assert.false( checkbox.isSelected() );
} );
