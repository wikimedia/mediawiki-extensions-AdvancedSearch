'use strict';

/**
 * @class
 * @constructor
 * @param {Object} languages in format { language-code: language-name }
 */
const LanguageOptionProvider = function ( languages ) {
	this.languages = Object.keys( languages ).map( function ( key ) {
		return { data: key, label: key + ' - ' + languages[ key ] };
	} );
	this.languages.sort( function ( a, b ) {
		// Sort alphabetically
		return a.data.localeCompare( b.data );
	} );
};

OO.initClass( LanguageOptionProvider );

LanguageOptionProvider.prototype.getLanguages = function () {
	return this.languages;
};

module.exports = LanguageOptionProvider;
