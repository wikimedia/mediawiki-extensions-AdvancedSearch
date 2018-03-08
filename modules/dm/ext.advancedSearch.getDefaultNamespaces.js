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
		if ( !userSettings ) {
			return [ mw.libs.advancedSearch.dm.SearchModel.MAIN_NAMESPACE ];
		}
		$.each( userSettings, function ( key, value ) {
			var nsMatch = key.match( /^searchNs(\d+)/ );
			if ( nsMatch !== null && value ) {
				defaultNamespaces.push( nsMatch[ 1 ] );
			}
		} );
		if ( defaultNamespaces.length === 0 ) {
			return [ mw.libs.advancedSearch.dm.SearchModel.MAIN_NAMESPACE ];
		}
		return defaultNamespaces;
	};

}( mediaWiki, jQuery ) );
