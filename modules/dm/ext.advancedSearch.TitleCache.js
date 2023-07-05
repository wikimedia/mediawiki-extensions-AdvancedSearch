'use strict';

const TitleCache = function () {
	this.cache = {};
};

const getCacheKey = function ( name ) {
	// Note: The Title class is used for normalization, even if the incoming strings aren't page
	// titles, but namespace names.
	try {
		return ( new mw.Title( name ) ).getPrefixedDb();
	} catch ( e ) {
		return name;
	}
};

TitleCache.prototype.get = function ( name ) {
	return this.cache[ getCacheKey( name ) ];
};

TitleCache.prototype.set = function ( name, value ) {
	this.cache[ getCacheKey( name ) ] = value;
};

TitleCache.prototype.has = function ( name ) {
	return Object.prototype.hasOwnProperty.call( this.cache, getCacheKey( name ) );
};

module.exports = TitleCache;
