'use strict';

/**
 * @class
 * @property {SearchField[]} fields
 *
 * @constructor
 * @param {SearchField[]} searchFields
 */
const QueryCompiler = function ( searchFields ) {
	this.fields = searchFields;
};

/**
 * @private
 * @param {SearchModel} state
 * @return {string[]}
 */
QueryCompiler.prototype.formatSearchFields = function ( state ) {
	const queryElements = [];

	this.fields.forEach( ( field ) => {
		const val = state.getField( field.id ),
			formattedQueryElement = val ? field.formatter( val ) : '';

		if ( formattedQueryElement ) {
			queryElements.push( formattedQueryElement );
		}
	} );

	return queryElements;
};

/**
 * @param {SearchModel} state
 * @return {string}
 */
QueryCompiler.prototype.compileSearchQuery = function ( state ) {
	return this.formatSearchFields( state ).join( ' ' );
};

/**
 * @param {string} search The current search string
 * @param {SearchModel} state
 * @return {string}
 */
QueryCompiler.prototype.removeCompiledQueryFromSearch = function ( search, state ) {
	const advancedQuery = this.compileSearchQuery( state );
	if ( advancedQuery && search.endsWith( advancedQuery ) ) {
		return search.slice( 0, -advancedQuery.length ).replace( /\s+$/, '' );
	}
	return search;
};

module.exports = QueryCompiler;
