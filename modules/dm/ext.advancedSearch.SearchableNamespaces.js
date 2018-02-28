( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	function prepareNamespaces( rawNamespaces ) {
		var namespaces = {};
		Object.keys( rawNamespaces ).forEach( function ( key ) {
			if ( parseInt( key, 10 ) >= 0 ) {
				namespaces[ key ] = rawNamespaces[ key ];
			}
		} );
		// Article namespace has no name by default
		namespaces[ '0' ] = mw.msg( 'advancedsearch-namespaces-articles' );
		return namespaces;
	}

	/**
	 * This data model contains the subset of namespaces and their IDs that's used for AdvancedSearch
	 *
	 * @class
	 * @constructor
	 * @param {Object} namespaces Namespaces as provided by mw.config.get( 'wgFormattedNamespaces' )
	 */
	mw.libs.advancedSearch.dm.SearchableNamespaces = function ( namespaces ) {
		this.namespaces = prepareNamespaces( namespaces );
	};

	/**
	 * @return {Object} Namespace IDs (strings) and labels
	 */
	mw.libs.advancedSearch.dm.SearchableNamespaces.prototype.getNamespaces = function () {
		return this.namespaces;
	};

	/**
	 * @return {string[]}
	 */
	mw.libs.advancedSearch.dm.SearchableNamespaces.prototype.getNamespaceIds = function () {
		return Object.keys( this.namespaces );
	};

}( mediaWiki ) );
