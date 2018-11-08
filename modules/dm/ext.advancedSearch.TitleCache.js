( function () {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	mw.libs.advancedSearch.dm.TitleCache = function () {
		this.cache = {};
	};

	function getCacheKey( name ) {
		var title = new mw.Title( name );
		return title.getName();
	}

	mw.libs.advancedSearch.dm.TitleCache.prototype.get = function ( name ) {
		return this.cache[ getCacheKey( name ) ];
	};

	mw.libs.advancedSearch.dm.TitleCache.prototype.set = function ( name, value ) {
		this.cache[ getCacheKey( name ) ] = value;
	};

	mw.libs.advancedSearch.dm.TitleCache.prototype.has = function ( name ) {
		return Object.prototype.hasOwnProperty.call( this.cache, getCacheKey( name ) );
	};

}() );
