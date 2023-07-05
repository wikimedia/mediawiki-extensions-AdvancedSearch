'use strict';

/**
 * Get the default search namespace IDs from user settings
 *
 * @param {Object} userSettings User settings like in mw.user.fields.values
 * @return {string[]} Namespace IDs
 */
const getDefaultNamespaces = function ( userSettings ) {
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

module.exports = getDefaultNamespaces;
