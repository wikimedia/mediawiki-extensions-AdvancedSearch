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
		this.namespaces = [ '0' ]; // Always start with Article namespace

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
	 * The state of an option or of the namespaces has changed
	 */

	/* Constants */

	/**
	 * Namespace id of Main (Article) namespace
	 * @type {string}
	 */
	mw.libs.advancedSearch.dm.SearchModel.MAIN_NAMESPACE = '0';

	/**
	 * Namespace id of File namespace
	 * @type {string}
	 */
	mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE = '6';

	/* Methods */

	/**
	 *
	 * @param  {string} optionId
	 * @param  {mixed} value
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.storeOption = function ( optionId, value ) {
		var namespaces = this.getNamespaces();
		// TODO check for allowed options?
		this.searchOptions[ optionId ] = value;
		if ( optionId === 'filetype' && !this.filetypeSupportsDimensions() ) {
			this.searchOptions.filew = [ '>', '' ];
			this.searchOptions.fileh = [ '>', '' ];
		}

		if ( optionId === 'filetype' && namespaces.indexOf( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE ) === -1 ) {
			namespaces.push( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE );
			this.setNamespaces( namespaces );
		}

		this.emitUpdate();
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.getOption = function ( optionId ) {
		return this.searchOptions[ optionId ];
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.removeOption = function ( optionId ) {
		delete this.searchOptions[ optionId ];
		if ( optionId === 'filetype' ) {
			this.searchOptions.filew = [ '>', '' ];
			this.searchOptions.fileh = [ '>', '' ];
		}
		this.emit( 'update' );
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

	/**
	 * Serialize options and namespaces to JSON
	 *
	 * @return {string}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.toJSON = function () {
		return JSON.stringify( {
			options: this.searchOptions,
			namespaces: this.namespaces
		} );
	};

	/**
	 * Set options and namespaces from JSON string
	 *
	 * @param  {string} jsonSerialized
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.setAllFromJSON = function ( jsonSerialized ) {
		var valuesChanged = false,
			unserialized;

		try {
			unserialized = JSON.parse( jsonSerialized );
		} catch ( e ) {
			return;
		}

		if ( typeof unserialized !== 'object' ) {
			return;
		}

		if ( typeof unserialized.options === 'object' ) {
			this.searchOptions = {};
			for ( var opt in unserialized.options ) {
				this.searchOptions[ opt ] = unserialized.options[ opt ];
			}
			valuesChanged = true;
		}
		if ( $.isArray( unserialized.namespaces ) ) {
			this.namespaces = unserialized.namespaces;
			valuesChanged = true;
		}
		if ( valuesChanged ) {
			this.emitUpdate();
		}
	};

	/**
	 * Check if the selected file type supports dimensions
	 *
	 * @return {boolean}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.filetypeSupportsDimensions = function () {
		return FILETYPES_WITH_DIMENSIONS.indexOf( this.getOption( 'filetype' ) ) > -1;
	};

	/**
	 * @return {Array}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.getNamespaces = function () {
		return this.namespaces;
	};

	/**
	 * @param {Array} namespaces
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.setNamespaces = function ( namespaces ) {
		var previousNamespaces = this.namespaces.slice( 0 );
		if ( this.getOption( 'filetype' ) && namespaces.indexOf( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE ) === -1 ) {
			namespaces.push( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE );
		}

		if ( !mw.libs.advancedSearch.util.arrayEquals( [], namespaces ) ) {
			this.namespaces = namespaces;
		} else {
			this.namespaces = [ mw.libs.advancedSearch.dm.SearchModel.MAIN_NAMESPACE ];
		}

		if ( !mw.libs.advancedSearch.util.arrayEquals( previousNamespaces, this.namespaces ) ) {
			this.emitUpdate();
		}
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.emitUpdate = function () {
		this.emit( 'update' );
	};

}( mediaWiki, jQuery ) );
