'use strict';

/**
 * @class
 * @property {Object.<string,boolean|undefined>} cache
 *
 * @constructor
 */
const TitleCache = function () {
	this.cache = {};
};

/**
 * @param {string} name
 * @return {string}
 */
const getCacheKey = function ( name ) {
	// Note: The Title class is used for normalization, even if the incoming strings aren't page
	// titles, but namespace names.
	try {
		return ( new mw.Title( name ) ).getPrefixedDb();
	} catch ( e ) {
		return name;
	}
};

/**
 * @param {string} name
 * @return {boolean|undefined} If the page exists, undefined when we don't know yet
 */
TitleCache.prototype.exists = function ( name ) {
	return this.cache[ getCacheKey( name ) ];
};

/**
 * @param {string} name
 * @param {boolean|undefined} [exists=undefined] If the page exists, undefined when we don't know yet
 */
TitleCache.prototype.set = function ( name, exists ) {
	this.cache[ getCacheKey( name ) ] = exists;
};

/**
 * @param {string} name
 * @return {boolean}
 */
TitleCache.prototype.has = function ( name ) {
	return getCacheKey( name ) in this.cache;
};

module.exports = TitleCache;
