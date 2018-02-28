( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	mw.libs.advancedSearch.dm.NamespacePresetProviders = {
		all: function () {
			var namespaces = [];
			$.each( mw.config.get( 'wgNamespaceIds' ), function ( _, value ) {
				if ( value >= 0 && namespaces.indexOf( String( value ) ) === -1 ) {
					namespaces.push( String( value ) );
				}
			} );
			return namespaces;
		},
		discussion: function () {
			var namespaces = [];
			$.each( mw.config.get( 'wgNamespaceIds' ), function ( _, value ) {
				if ( value % 2 && value >= 0 && namespaces.indexOf( String( value ) ) === -1 ) {
					namespaces.push( String( value ) );
				}
			} );
			return namespaces;
		}
	};

}( mediaWiki, jQuery ) );
