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
const DeepCategoryFilter = function ( store, config ) {
	DeepCategoryFilter.super.call( this, store, config );

	this.$element.addClass( 'mw-advancedSearch-deepCategory' );
};

OO.inheritClass( DeepCategoryFilter, MultiselectLookup );

module.exports = DeepCategoryFilter;
