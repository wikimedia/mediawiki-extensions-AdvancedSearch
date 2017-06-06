( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	// Internal constants
	var FILETYPES_WITH_DIMENSIONS = [
		'bitmap',
		'video',
		'jpeg',
		'tiff'
	];

	/**
	 * @class
	 * @constructor
	 * @mixins OO.EventEmitter
	 */
	mw.libs.advancedSearch.dm.SearchModel = function () {
		this.searchOptions = {};

		// Mixin constructor
		OO.EventEmitter.call( this );
	};

	/* Initialization */

	OO.initClass( mw.libs.advancedSearch.dm.SearchModel );
	OO.mixinClass( mw.libs.advancedSearch.dm.SearchModel, OO.EventEmitter );

	/* Events */

	/**
	 * @event update
	 *
	 * The state of an option has changed
	 */

	/* Methods */

	/**
	 *
	 * @param  {string} optionId
	 * @param  {mixed} value
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.storeOption = function ( optionId, value ) {
		// TODO check for allowed options?
		this.searchOptions[ optionId ] = value;
		if ( optionId == 'filetype' && !this.filetypeSupportsDimensions() ) {
			this.searchOptions.filew = [ '>', '' ];
			this.searchOptions.fileh = [ '>', '' ];
		}
		this.emit( 'update' );
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.getOption = function ( optionId ) {
		return this.searchOptions[ optionId ];
	};

	/**
	 * Get non-empty search options
	 *
	 * @return {Object}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.getOptions = function () {
		var options = {};
		$.each( this.searchOptions, function ( key, value ) {
			if ( !$.isEmptyObject( value ) ) {
				options[ key ] = value;
			}
		} );
		return options;
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.toJSON = function () {
		return JSON.stringify( this.searchOptions );
	};

	/**
	 * Check if the selected file type supports dimensions
	 *
	 * @return {boolean}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.filetypeSupportsDimensions = function () {
		return FILETYPES_WITH_DIMENSIONS.indexOf( this.getOption( 'filetype' ) ) > -1;
	};

} )( mediaWiki, jQuery );
