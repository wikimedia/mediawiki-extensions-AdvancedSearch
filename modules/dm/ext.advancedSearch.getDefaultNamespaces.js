( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	/**
	 * Get the default search namespace IDs from user settings
	 *
	 * @param {Object} userSettings User settings like in mw.user.options.values
	 * @return {string[]} Namespace IDs
	 */
	mw.libs.advancedSearch.dm.getDefaultNamespaces = function ( userSettings ) {
		var defaultNamespaces = [];
		$.each( userSettings, function ( key, value ) {
			var nsMatch = key.match( /^searchNs(\d+)/ );
			if ( nsMatch !== null && value ) {
				defaultNamespaces.push( nsMatch[ 1 ] );
			}
		} );
		return defaultNamespaces;
	};

}( mediaWiki, jQuery ) );
