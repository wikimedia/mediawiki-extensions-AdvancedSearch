( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	// Internal constants
	var FILETYPES_WITH_DIMENSIONS = [
		'bitmap',
		'drawing',
		'image',
		'video'
	];

	/**
	 * @class
	 * @constructor
	 * @mixins OO.EventEmitter
	 * @param {string[]} [defaultNamespaces] The namespaces selected by default (for new searches)
	 */
	mw.libs.advancedSearch.dm.SearchModel = function ( defaultNamespaces ) {
		this.searchOptions = {};
		this.namespaces = defaultNamespaces || [];

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
	 * Namespace id of File namespace
	 * @type {string}
	 */
	mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE = '6';

	/* Methods */

	/**
	 * @param {string} optionId
	 * @param {*} value
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.storeOption = function ( optionId, value ) {
		var namespaces;

		// TODO check for allowed options?

		if ( this.searchOptions[ optionId ] !== undefined && OO.compare( this.searchOptions[ optionId ], value ) ) {
			return;
		}

		if ( value === '' || ( Array.isArray( value ) && value.length === 0 ) ) {
			this.removeOption( optionId );
			return;
		}

		this.searchOptions[ optionId ] = value;

		if ( optionId === 'filetype' && !this.filetypeSupportsDimensions() ) {
			this.resetFileDimensionOptions();
		}

		namespaces = this.getNamespaces();
		if ( optionId === 'filetype' && namespaces.indexOf( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE ) === -1 ) {
			namespaces.push( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE );
			this.setNamespaces( namespaces );
		}

		this.emitUpdate();
	};

	/**
	 * Retrieve value of option with given id
	 *
	 * @param {string} optionId
	 * @return {*}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.getOption = function ( optionId ) {
		return this.searchOptions[ optionId ];
	};

	/**
	 * Remove option with given id
	 *
	 * @param {string} optionId
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.removeOption = function ( optionId ) {
		if ( this.searchOptions[ optionId ] === undefined ) {
			return;
		}

		delete this.searchOptions[ optionId ];

		if ( optionId === 'filetype' ) {
			this.resetFileDimensionOptions();
		}

		this.emitUpdate();
	};

	/**
	 * Reset the file dimension search options
	 *
	 * @private
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.resetFileDimensionOptions = function () {
		this.removeOption( 'filew' );
		this.removeOption( 'fileh' );
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
		var json = {};
		if ( !$.isEmptyObject( this.searchOptions ) ) {
			json.options = this.searchOptions;
		}
		if ( this.namespaces.length ) {
			json.namespaces = this.namespaces;
		}
		return JSON.stringify( json );
	};

	/**
	 * Set options and namespaces from JSON string
	 *
	 * @param {string} jsonSerialized
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
		if ( Array.isArray( unserialized.namespaces ) ) {
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
		var fileType = this.getOption( 'filetype' );
		if ( !fileType ) {
			return false;
		}
		var generalFileType = fileType.replace( /\/.*/, '' );
		return FILETYPES_WITH_DIMENSIONS.indexOf( generalFileType ) !== -1;
	};

	/**
	 * @return {string[]}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.getNamespaces = function () {
		return this.namespaces;
	};

	/**
	 * @param {string[]} namespaces
	 * @return {string[]}
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.sortNamespacesByNumber = function ( namespaces ) {
		return namespaces.sort( function ( a, b ) {
			return Number( a ) - Number( b );
		} );
	};

	/**
	 * @param {string[]} namespaces
	 */
	mw.libs.advancedSearch.dm.SearchModel.prototype.setNamespaces = function ( namespaces ) {
		var previousNamespaces = this.namespaces.slice( 0 );
		if ( this.getOption( 'filetype' ) && namespaces.indexOf( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE ) === -1 ) {
			namespaces.push( mw.libs.advancedSearch.dm.SearchModel.FILE_NAMESPACE );
		}

		this.namespaces = this.sortNamespacesByNumber( namespaces );

		if ( !OO.compare( previousNamespaces, this.namespaces ) ) {
			this.emitUpdate();
		}
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.emitUpdate = function () {
		this.emit( 'update' );
	};

}( mediaWiki, jQuery ) );
