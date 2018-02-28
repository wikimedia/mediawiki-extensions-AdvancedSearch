( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	/**
	 * Fired when the namespace ID providers are initialized
	 *
	 * The real event name is `advancedSearch.initNamespacePresetProviders`, but jsDuck does not support dots in event names.
	 *
	 * @event advancedSearch_initNamespacePresetProviders
	 * @param {object} providerFunctions
	 */

	/**
	 *
	 * @param {ext.advancedSearch.dm.SearchableNamespaces} namespaces
	 * @constructor
	 */
	mw.libs.advancedSearch.dm.NamespacePresetProviders = function ( namespaces ) {
		this.namespaces = namespaces;
		this.providerFunctions = {
			all: function ( namespaces ) {
				return namespaces;
			},
			discussion: function ( namespaces ) {
				return $.grep( namespaces, function ( id ) {
					return parseInt( id, 10 ) % 2;
				} );
			}
		};
		mw.hook( 'advancedSearch.initNamespacePresetProviders' ).fire( this.providerFunctions );
	};

	OO.initClass( mw.libs.advancedSearch.dm.NamespacePresetProviders );

	mw.libs.advancedSearch.dm.NamespacePresetProviders.prototype.hasProvider = function ( providerName ) {
		return this.providerFunctions.hasOwnProperty( providerName );
	};

	/**
	 *
	 * @param {String} providerName
	 * @return {String[]}
	 */
	mw.libs.advancedSearch.dm.NamespacePresetProviders.prototype.getNamespaceIdsFromProvider = function ( providerName ) {
		var ids = $.map(
			this.providerFunctions[ providerName ]( this.namespaces.getNamespaceIds() ),
			function ( id ) { return String( id ); }
		);
		if ( !this.namespaceIdsAreValid( ids ) ) {
			mw.log.warn( 'AdvancedSearch namespace preset provider "' + providerName + '" returned invalid namespace ID' );
			return [];
		}
		return ids;
	};

	/**
	 *
	 * @param {String[]} namespaceIds
	 * @return {bool}
	 */
	mw.libs.advancedSearch.dm.NamespacePresetProviders.prototype.namespaceIdsAreValid = function ( namespaceIds ) {
		return mw.libs.advancedSearch.util.arrayContains( this.namespaces.getNamespaceIds(), namespaceIds );
	};

}( mediaWiki, jQuery ) );
