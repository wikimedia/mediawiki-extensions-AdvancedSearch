( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};

	/**
	 * @param {ext.libs.advancedSearch.AdvancedOptionsConfig} options
	 * @class
	 * @constructor
	 */
	mw.libs.advancedSearch.QueryCompiler = function ( options ) {
		this.options = options;
	};

	/**
	 * @private
	 * @param {ext.libs.advancedSearch.dm.SearchModel} state
	 * @return {string[]}
	 */
	mw.libs.advancedSearch.QueryCompiler.prototype.formatSearchOptions = function ( state ) {
		var queryElements = [],
			greedyQuery = null;

		this.options.forEach( function ( option ) {
			var val = state.getOption( option.id ),
				formattedQueryElement = val ? option.formatter( val ) : '';

			if ( !formattedQueryElement ) {
				return;
			}

			// FIXME: Should fail if there is more than one greedy option!
			if ( option.greedy && !greedyQuery ) {
				greedyQuery = option.formatter( val );
			} else {
				queryElements.push( formattedQueryElement );
			}

		} );
		if ( greedyQuery ) {
			queryElements.push( greedyQuery );
		}

		return queryElements;
	};

	/**
	 * @param {ext.libs.advancedSearch.dm.SearchModel} state
	 * @return {string}
	 */
	mw.libs.advancedSearch.QueryCompiler.prototype.compileSearchQuery = function ( state ) {
		return this.formatSearchOptions( state ).join( ' ' );
	};

	/**
	 * @param {string} haystack
	 * @param {string} needle
	 * @return {boolean}
	 */
	var stringEndsWith = function ( haystack, needle ) {
		var position = haystack.length - needle.length;
		return position >= 0 && haystack.indexOf( needle, position ) === position;
	};

	/**
	 * @param {string} search The current search string
	 * @param {ext.libs.advancedSearch.dm.SearchModel} state
	 * @return {string}
	 */
	mw.libs.advancedSearch.QueryCompiler.prototype.removeCompiledQueryFromSearch = function ( search, state ) {
		var advancedQuery = this.compileSearchQuery( state );
		if ( advancedQuery && stringEndsWith( search, advancedQuery ) ) {
			return search.slice( 0, -advancedQuery.length ).replace( /\s+$/, '' );
		}
		return search;
	};

}( mediaWiki ) );
