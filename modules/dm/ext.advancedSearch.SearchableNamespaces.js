( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	/**
	 * @param {Object} allNamespaces
	 * @return {Object}
	 */
	function filterSearchableNamespaces( allNamespaces ) {
		var searchableNamespaces = {};
		Object.keys( allNamespaces ).forEach( function ( id ) {
			if ( Number( id ) >= 0 ) {
				searchableNamespaces[ id ] = allNamespaces[ id ] || mw.msg( 'blanknamespace' );
			}
		} );
		return searchableNamespaces;
	}

	/**
	 * This data model contains the subset of namespaces and their IDs that's used for AdvancedSearch
	 *
	 * @class
	 * @constructor
	 * @param {Object} allNamespaces Namespaces as provided by mw.config.get( 'wgFormattedNamespaces' )
	 */
	mw.libs.advancedSearch.dm.SearchableNamespaces = function ( allNamespaces ) {
		this.namespaces = filterSearchableNamespaces( allNamespaces );
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
