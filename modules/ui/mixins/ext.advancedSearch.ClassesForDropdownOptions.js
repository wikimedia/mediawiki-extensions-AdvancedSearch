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
	const widget = this;
	this.optionsDirty = true;

	const optionWidgets = options.map( function ( opt ) {
		let optValue, optionWidget;

		if ( opt.optgroup === undefined ) {
			optValue = widget.cleanUpValue( opt.data );
			// The following classes are used here:
			// * mw-advancedSearch-inlanguage-*
			// * mw-advancedSearch-filetype-*
			// * mw-advancedSearch-sort-*
			optionWidget = new OO.ui.MenuOptionWidget( {
				data: optValue,
				classes: [ widget.className + optValue.replace( /\W+/g, '-' ) ],
				label: opt.label !== undefined ? opt.label : optValue
			} );
		} else {
			optionWidget = new OO.ui.MenuSectionOptionWidget( {
				label: opt.optgroup,
				classes: []
			} );
		}

		return optionWidget;
	} );

	this.dropdownWidget.getMenu().clearItems().addItems( optionWidgets );
};

module.exports = ClassesForDropdownOptions;
