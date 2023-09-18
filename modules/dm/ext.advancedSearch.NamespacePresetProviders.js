'use strict';

const getDefaultNamespaces = require( './ext.advancedSearch.getDefaultNamespaces.js' );
const { arrayContains } = require( '../ext.advancedSearch.util.js' );

/**
 * Fired when the namespace ID providers are initialized
 *
 * The real event name is `advancedSearch.initNamespacePresetProviders`, but jsDuck does not support dots in event names.
 *
 * @event advancedSearch_initNamespacePresetProviders
 * @param {Object} providerFunctions
 */

/**
 * @param {Object.<int,string>} namespaces Mapping namespace IDs to localized names
 * @constructor
 */
const NamespacePresetProviders = function ( namespaces ) {
	this.namespaces = namespaces;
	this.providerFunctions = {
		all: function ( namespaceIds ) {
			return namespaceIds;
		},
		discussion: function ( namespaceIds ) {
			return namespaceIds.filter( mw.Title.isTalkNamespace );
		},
		defaultNamespaces: function () {
			return getDefaultNamespaces( mw.user.options.values );
		}
	};
	mw.hook( 'advancedSearch.initNamespacePresetProviders' ).fire( this.providerFunctions );
};

OO.initClass( NamespacePresetProviders );

NamespacePresetProviders.prototype.hasProvider = function ( providerName ) {
	return Object.prototype.hasOwnProperty.call( this.providerFunctions, providerName );
};

/**
 * @param {string} providerName
 * @return {string[]}
 */
NamespacePresetProviders.prototype.getNamespaceIdsFromProvider = function ( providerName ) {
	const self = this;

	return this.providerFunctions[ providerName ]( Object.keys( this.namespaces ) )
		// Calling String() as a function casts numbers to strings
		.map( String )
		.filter( function ( id ) {
			if ( id in self.namespaces ) {
				return true;
			}
			mw.log.warn( 'AdvancedSearch namespace preset provider "' + providerName + '" returned invalid namespace ID' );
			return false;
		} );
};

/**
 * @param {string[]} namespaceIds
 * @return {boolean}
 */
NamespacePresetProviders.prototype.namespaceIdsAreValid = function ( namespaceIds ) {
	return arrayContains( Object.keys( this.namespaces ), namespaceIds );
};

module.exports = NamespacePresetProviders;
