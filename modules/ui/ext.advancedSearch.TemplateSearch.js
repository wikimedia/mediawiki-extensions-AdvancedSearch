'use strict';

const MultiselectLookup = require( '../dm/ext.advancedSearch.MultiselectLookup.js' );

/**
 * @class
 * @extends MultiselectLookup
 *
 * @constructor
 * @param {SearchModel} store
 * @param {Object} config
 */
const TemplateSearch = function ( store, config ) {
	TemplateSearch.super.call( this, store, config );

	this.$element.addClass( 'mw-advancedSearch-template' );
};

OO.inheritClass( TemplateSearch, MultiselectLookup );

module.exports = TemplateSearch;
