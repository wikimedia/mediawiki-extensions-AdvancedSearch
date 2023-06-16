'use strict';

/**
 * FieldLayout that can show and hide itself when the store changes, based on visibility function
 *
 * @class
 * @extends OO.ui.FieldLayout
 * @constructor
 *
 * @param {SearchModel} store
 * @param {OO.ui.Widget} widget
 * @param {Object} config
 */
const ImageDimensionLayout = function ( store, widget, config ) {
	this.store = store;
	this.checkVisibility = config.checkVisibility;

	store.connect( this, { update: 'onStoreUpdate' } );

	ImageDimensionLayout.parent.call( this, widget, config );

	this.toggle( this.checkVisibility() );
};

OO.inheritClass( ImageDimensionLayout, OO.ui.FieldLayout );

ImageDimensionLayout.prototype.onStoreUpdate = function () {
	this.toggle( this.checkVisibility() );
};

module.exports = ImageDimensionLayout;
