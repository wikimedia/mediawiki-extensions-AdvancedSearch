( function () {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	/**
	 * Get the default search namespace IDs from user settings
	 *
	 * @param {Object} userSettings User settings like in mw.user.fields.values
	 * @return {string[]} Namespace IDs
	 */
	mw.libs.advancedSearch.dm.getDefaultNamespaces = function ( userSettings ) {
		const defaultNamespaces = [];
		for ( const key in userSettings ) {
			if ( userSettings[ key ] ) {
				const matches = key.match( /^searchNs(\d+)$/ );
				if ( matches ) {
					defaultNamespaces.push( matches[ 1 ] );
				}
			}
		}
		return defaultNamespaces;
	};

}() );
