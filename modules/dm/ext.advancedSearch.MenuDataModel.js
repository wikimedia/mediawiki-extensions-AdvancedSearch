( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	/**
	 * @class
	 * @constructor
	 * @mixins OO.EventEmitter
	 *
	 * @param {Object} items
	 */
	mw.libs.advancedSearch.dm.MenuDataModel = function ( items ) {
		this.menuItems = items || {};

		// Mixin constructor
		OO.EventEmitter.call( this );

		if ( items ) {
			this.emit( 'update' );
		}
	};

	/* Initialization */

	OO.initClass( mw.libs.advancedSearch.dm.MenuDataModel );
	OO.mixinClass( mw.libs.advancedSearch.dm.MenuDataModel, OO.EventEmitter );

	/* Events */

	/**
	 * @event update
	 *
	 * The state of an option has changed
	 */

	/* Methods */

	/**
	 * @return {Object} item keys and labels
	 */
	mw.libs.advancedSearch.dm.MenuDataModel.prototype.getMenuItems = function () {
		return this.menuItems;
	};

	mw.libs.advancedSearch.dm.MenuDataModel.prototype.setMenuItems = function ( items ) {
		this.menuItems = items;
		this.emit( 'update' );
	};
} )( mediaWiki );
