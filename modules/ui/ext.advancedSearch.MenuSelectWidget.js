'use strict';

const ItemMenuOptionWidget = require( './ext.advancedSearch.ItemMenuOptionWidget.js' );

/**
 * A floating menu widget for the filter list
 *
 * @extends OO.ui.MenuSelectWidget
 *
 * @constructor
 * @param {SearchModel} store
 * @param {Object} config
 * @cfg {Object} namespaces
 * @cfg {jQuery} [$overlay] A jQuery object serving as overlay for popups
 */
const MenuSelectWidget = function ( store, config ) {
	this.store = store;
	this.config = config;
	this.namespaces = config.namespaces;
	this.$overlay = config.$overlay || this.$element;
	this.$body = $( '<div>' ).addClass( 'mw-advancedSearch-ui-menuSelectWidget-body' );

	MenuSelectWidget.parent.call( this, $.extend( {
		$autoCloseIgnore: this.$overlay,
		filterFromInput: true
	}, config ) );
	this.createMenu();
};

OO.inheritClass( MenuSelectWidget, OO.ui.MenuSelectWidget );

/**
 * @inheritdoc
 */
MenuSelectWidget.prototype.toggle = function ( show ) {
	MenuSelectWidget.parent.prototype.toggle.call( this, show );
	this.setVerticalPosition( 'below' );
};

MenuSelectWidget.prototype.createMenu = function () {
	if ( this.menuInitialized ) {
		return;
	}
	this.menuInitialized = true;
	const items = [];
	for ( const id in this.namespaces ) {
		const isTalkNamespace = id % 2;
		// The following classes are used here:
		// * mw-advancedSearch-namespace-0
		// * mw-advancedSearch-namespace-1
		// etc.
		items.push( new ItemMenuOptionWidget( $.extend( {
			data: id,
			label: this.namespaces[ id ] || id,
			classes: [
				'mw-advancedSearch-namespace-' + id,
				isTalkNamespace ? '' : 'mw-advancedSearch-namespace-border'
			]
		}, this.config ) ) );
	}
	this.addItems( items );
};

module.exports = MenuSelectWidget;
