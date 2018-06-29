( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};
	mw.libs.advancedSearch.dm.trackingEvents = mw.libs.advancedSearch.dm.trackingEvents || {};

	/**
	 * @class
	 * @constructor
	 */
	mw.libs.advancedSearch.dm.trackingEvents.SearchRequest = function () {
		this.eventName = 'AdvancedSearchRequest';
		this.eventData = {
			plain: false,
			phrase: false,
			not: false,
			or: false,
			intitle: false,
			filetype: false,
			hastemplate: false,
			subpageof: false,
			inlanguage: false,
			deepcategory: false
		};
	};

	OO.initClass( mw.libs.advancedSearch.dm.trackingEvents.SearchRequest );

	/**
	 * Gets the event name
	 *
	 * @return {string}
	 */
	mw.libs.advancedSearch.dm.trackingEvents.SearchRequest.prototype.getEventName = function () {
		return this.eventName;
	};

	/**
	 * @return {Object}
	 */
	mw.libs.advancedSearch.dm.trackingEvents.SearchRequest.prototype.getEventData = function () {
		return this.eventData;
	};

	/**
	 * Populate tracking event by given search options
	 *
	 * @param {Object} searchOptions
	 */
	mw.libs.advancedSearch.dm.trackingEvents.SearchRequest.prototype.populateFromStoreOptions = function ( searchOptions ) {
		var self = this;

		for ( var key in searchOptions ) {
			if ( searchOptions.hasOwnProperty( key ) && searchOptions[ key ].length ) {
				self.eventData[ key ] = true;
			}
		}
	};

}( mediaWiki ) );
