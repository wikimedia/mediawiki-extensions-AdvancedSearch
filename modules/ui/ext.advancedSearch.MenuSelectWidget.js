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

	MenuSelectWidget.super.call( this, $.extend( {
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
	MenuSelectWidget.super.prototype.toggle.call( this, show );
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

/**
 * @param {string} query
 * @param {string} [mode='prefix']
 * @return {Function}
 */
MenuSelectWidget.prototype.getItemMatcher = function ( query, mode ) {
	if ( mode && mode !== 'prefix' ) {
		// Fall back to the original behavior when not in the default "prefix" mode
		return MenuSelectWidget.super.prototype.getItemMatcher.apply( this, arguments );
	}

	const normalizeForMatching = ( text ) => OO.ui.SelectWidget.static.normalizeForMatching( text )
		// Additional normalization to match the normalization in wgNamespaceIds
		.replace( /[\s_]+/g, '_' );

	const normalizedQuery = normalizeForMatching( query );
	if ( !normalizedQuery ) {
		// Match everything, same default behavior as in OO.ui.SelectWidget.getItemMatcher
		return () => true;
	}

	const goodIds = {};
	// Assume the query was numeric, this just won't do anything in case it was not
	goodIds[ normalizedQuery ] = true;

	const namespaceIds = mw.config.get( 'wgNamespaceIds' );
	for ( const name in namespaceIds ) {
		// Prefix match with the canonical, normalized namespace names in wgNamespaceIds
		if ( name.indexOf( normalizedQuery ) === 0 ) {
			goodIds[ namespaceIds[ name ] ] = true;
		}
	}

	return function ( item ) {
		return item.getData() in goodIds ||
			// This is the default behavior from OO.ui.SelectWidget.getItemMatcher
			normalizeForMatching( item.getMatchText() ).indexOf( normalizedQuery ) === 0;
	};
};

module.exports = MenuSelectWidget;
