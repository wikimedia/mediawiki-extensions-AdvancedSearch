( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	var KNOWN_DOCUMENT_TYPES = [
		'xls', 'xlsx',
		'doc', 'docx',
		'odt',
		'ods',
		'odp',
		'pdf'
	];

	var isKnownDocumentType = function ( fileExtension ) {
		return KNOWN_DOCUMENT_TYPES.indexOf( fileExtension ) > -1;
	};

	var getTopLevelMimeType = function ( mimeType ) {
		return mimeType.split( '/' )[ 0 ];
	};

	var addFileOption = function ( options, groupName, option ) {
		if ( options[ groupName ].length === 0 ) {
			options[ groupName ] = [ { optgroup: mw.msg( 'advancedsearch-filetype-section-' + groupName ) } ];
		}
		options[ groupName ] = options[ groupName ].concat( option );
	};

	var getFileOptions = function ( options, allowedMimeTypes ) {
		$.each( allowedMimeTypes, function ( fileExtension, mimeType ) {
			var groupName = 'other',
				topLevelType = getTopLevelMimeType( mimeType );

			if ( isKnownDocumentType( fileExtension ) ) {
				groupName = 'document';
			} else if ( options.hasOwnProperty( topLevelType ) ) {
				groupName = topLevelType;
			}

			addFileOption( options, groupName, { data: mimeType, label: fileExtension } );
		} );

		return options;
	};

	/**
	 * @class
	 * @constructor
	 *
	 * @param {array} mimeTypes
	 */
	mw.libs.advancedSearch.dm.FileTypeOptionProvider = function ( mimeTypes ) {
		this.mimeTypes = mimeTypes;
		this.options = {
			image: [],
			audio: [],
			video: [],
			document: [],
			other: []
		};
	};

	OO.initClass( mw.libs.advancedSearch.dm.FileTypeOptionProvider );

	/**
	 * Returns the general file type options
	 *
	 * @return {Array.<Object>}
	 */
	mw.libs.advancedSearch.dm.FileTypeOptionProvider.prototype.getFileGroupOptions = function () {
		return [
			{ optgroup: mw.msg( 'advancedsearch-filetype-section-types' ) },
			{ data: 'bitmap', label: mw.msg( 'advancedsearch-filetype-bitmap' ) },
			{ data: 'vector', label: mw.msg( 'advancedsearch-filetype-vector' ) },
			{ data: 'video', label: mw.msg( 'advancedsearch-filetype-video' ) },
			{ data: 'audio', label: mw.msg( 'advancedsearch-filetype-audio' ) },
			{ data: 'multimedia', label: mw.msg( 'advancedsearch-filetype-multimedia' ) },
			{ data: 'office', label: mw.msg( 'advancedsearch-filetype-office' ) }
		];
	};

	/**
	 * Returns the file type options based on allowed mime types
	 *
	 * @return {Array.<Object>}
	 */
	mw.libs.advancedSearch.dm.FileTypeOptionProvider.prototype.getAllowedFileTypeOptions = function () {
		var options = [];

		$.each( getFileOptions( this.options, this.mimeTypes ), function ( index, fileOptions ) {
			options = options.concat( fileOptions );
		} );

		return options;
	};

}( mediaWiki, jQuery ) );
