( function () {
	const CheckboxInputWidget = mw.libs.advancedSearch.ui.CheckboxInputWidget;

	QUnit.module( 'ext.advancedSearch.ui.CheckboxInputWidget' );

	QUnit.test( 'Checkbox does not respond to click events', function ( assert ) {
		const checkbox = new CheckboxInputWidget( {} );
		checkbox.$element.trigger( 'click' );
		assert.false( checkbox.isSelected() );
	} );

}() );
