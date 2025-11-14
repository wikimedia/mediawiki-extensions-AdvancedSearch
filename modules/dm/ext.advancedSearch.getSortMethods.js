'use strict';

/**
 * @return {string[]}
 */
const getSortMethods = function () {
	return mw.config.get( 'advancedSearch.sortMethods' ) || [ 'relevance' ];
};

module.exports = getSortMethods;
