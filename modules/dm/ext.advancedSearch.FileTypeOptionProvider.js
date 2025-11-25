'use strict';

const KNOWN_DOCUMENT_TYPES = [
	'xls', 'xlsx',
	'doc', 'docx',
	'odt',
	'ods',
	'odp',
	'pdf'
];

/**
 * @param {string} fileExtension
 * @return {boolean}
 */
const isKnownDocumentType = function ( fileExtension ) {
	return KNOWN_DOCUMENT_TYPES.includes( fileExtension );
};

/**
 * @param {string} mimeType
 * @return {string}
 */
const getTopLevelMimeType = function ( mimeType ) {
	return mimeType.split( '/' )[ 0 ];
};

/**
 * @param {Object.<string,Object[]>} options
 * @param {string} groupName
 * @param {Object} option
 */
const addFileOption = function ( options, groupName, option ) {
	// Note: Assigning a new array doesn't change the pre-defined order in options
	if ( !options[ groupName ] || !options[ groupName ].length ) {
		// The following messages are used here:
		// * advancedsearch-filetype-section-image
		// * advancedsearch-filetype-section-audio
		// * advancedsearch-filetype-section-video
		// * advancedsearch-filetype-section-document
		// * advancedsearch-filetype-section-other
		options[ groupName ] = [ { optgroup: mw.msg( 'advancedsearch-filetype-section-' + groupName ) } ];
	}
	options[ groupName ].push( option );
};

/**
 * @param {Object.<string,string>} allowedMimeTypes File extension => MIME type
 * @return {Object.<string,Object[]>}
 */
const getFileOptions = function ( allowedMimeTypes ) {
	// Known top-level MIME types (i.e. the first part of "image/…") in a useful order
	const options = {
		image: [],
		audio: [],
		video: [],
		document: []
	};

	for ( const fileExtension in allowedMimeTypes ) {
		let groupName = 'other';
		const mimeType = allowedMimeTypes[ fileExtension ],
			topLevelType = getTopLevelMimeType( mimeType );

		if ( isKnownDocumentType( fileExtension ) ) {
			groupName = 'document';
		} else if ( topLevelType in options ) {
			groupName = topLevelType;
		}

		addFileOption( options, groupName, { data: mimeType, label: fileExtension } );
	}

	return options;
};

/**
 * @class
 * @property {Object.<string,string>} mimeTypes
 *
 * @constructor
 * @param {Object.<string,string>} mimeTypes File extension => MIME type
 */
const FileTypeOptionProvider = function ( mimeTypes ) {
	this.mimeTypes = mimeTypes;
};

OO.initClass( FileTypeOptionProvider );

/**
 * Returns the general file type fields
 *
 * @return {Object[]}
 */
FileTypeOptionProvider.prototype.getFileGroupOptions = function () {
	return [
		{ optgroup: mw.msg( 'advancedsearch-filetype-section-types' ) },
		{ data: 'bitmap', label: mw.msg( 'advancedsearch-filetype-bitmap' ) },
		{ data: 'drawing', label: mw.msg( 'advancedsearch-filetype-drawing' ) },
		{ data: 'audio', label: mw.msg( 'advancedsearch-filetype-audio' ) },
		{ data: 'video', label: mw.msg( 'advancedsearch-filetype-video' ) },
		{ data: 'office', label: mw.msg( 'advancedsearch-filetype-office' ) }
	];
};

/**
 * Returns the file type fields based on allowed mime types
 *
 * @return {Object[]}
 */
FileTypeOptionProvider.prototype.getAllowedFileTypeOptions = function () {
	const groups = getFileOptions( this.mimeTypes );
	// TODO: Replace with Object.values( groups ) when we can
	return [].concat( ...Object.keys( groups ).map( ( k ) => groups[ k ] ) );
};

module.exports = FileTypeOptionProvider;
