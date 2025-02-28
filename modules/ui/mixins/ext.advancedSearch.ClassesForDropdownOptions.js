'use strict';

/**
 * @mixin
 * @requires OO.ui.DropdownInputWidget
 * @constructor
 *
 * @param {string} className
 */
const ClassesForDropdownOptions = function () {};

ClassesForDropdownOptions.prototype.setOptionsData = function ( options ) {
	this.optionsDirty = true;

	const optionWidgets = options.map( ( opt ) => {
		if ( opt.optgroup ) {
			return new OO.ui.MenuSectionOptionWidget( { label: opt.optgroup } );
		}

		const value = this.cleanUpValue( opt.data );
		// The following classes are used here:
		// * mw-advancedSearch-inlanguage-*
		// * mw-advancedSearch-filetype-*
		// * mw-advancedSearch-sort-*
		return new OO.ui.MenuOptionWidget( {
			data: value,
			classes: [ this.className + value.replace( /\W+/g, '-' ) ],
			label: opt.label || value
		} );
	} );

	this.dropdownWidget.getMenu().clearItems().addItems( optionWidgets );
};

module.exports = ClassesForDropdownOptions;
