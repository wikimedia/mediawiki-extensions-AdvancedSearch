'use strict';

const TitleCache = require( './ext.advancedSearch.TitleCache.js' );

/**
 * @param {OO.ui.TagItemWidget} item
 */
const markNonExistent = function ( item ) {
	item.$label.addClass( 'new' );
};

/**
 * @param {OO.ui.TagItemWidget} item
 * @param {TitleCache} queryCache
 */
const markPageExistence = function ( item, queryCache ) {
	if ( queryCache.get( item.getLabel() ) === 'NO' ) {
		markNonExistent( item );
	}
};

/**
 * @param {Object} res API response
 * @param {TitleCache} queryCache
 * @return {string[]} Subset of titles that are known to exist, otherwise empty
 */
const populateCache = function ( res, queryCache ) {
	const pages = [];
	for ( const i in res.query.pages ) {
		const page = res.query.pages[ i ];
		if ( !page.missing ) {
			pages.push( page.title );
		}
		queryCache.set( page.title, page.missing ? 'NO' : 'YES' );
	}
	return pages;
};

/**
 * @class
 * @extends OO.ui.TagMultiselectWidget
 *
 * @constructor
 * @param {SearchModel} store
 * @param {Object} config
 * @param {string} config.fieldId Field name
 * @param {number} config.namespaceId
 * @param {mw.Api} [config.api]
 */
const MultiselectLookup = function ( store, config ) {
	config = Object.assign( {}, config, {
		allowArbitrary: true,
		input: {
			autocomplete: false
		}
	} );
	this.store = store;
	this.fieldId = config.fieldId;
	this.namespaceId = config.namespaceId;
	this.api = config.api || new mw.Api();
	this.queryCache = new TitleCache();

	this.store.connect( this, { update: 'onStoreUpdate' } );

	MultiselectLookup.super.call( this, config );

	this.$input = this.input.$input;

	this.input.connect( this, { change: 'onLookupInputChange' } );

	OO.ui.mixin.LookupElement.call( this, config );

	this.populateFromStore();
	this.connect( this, { change: 'onValueUpdate' } );
};

OO.inheritClass( MultiselectLookup, OO.ui.TagMultiselectWidget );
OO.mixinClass( MultiselectLookup, OO.ui.mixin.LookupElement );

MultiselectLookup.prototype.onStoreUpdate = function () {
	this.populateFromStore();
};

MultiselectLookup.prototype.populateFromStore = function () {
	if ( this.store.hasFieldChanged( this.fieldId, this.getValue() ) ) {
		this.setValue( this.store.getField( this.fieldId ) );
	}
};

/**
 * @param {string|string[]} valueObject
 */
MultiselectLookup.prototype.setValue = function ( valueObject ) {
	const names = Array.isArray( valueObject ) ? valueObject : [ valueObject ];
	// Initialize with "PENDING" value to avoid new request in createTagItemWidget
	names.forEach( ( value ) => {
		this.queryCache.set( value, 'PENDING' );
	} );
	MultiselectLookup.super.prototype.setValue.call( this, valueObject );

	this.searchForPagesInNamespace( names ).then( () => {
		this.items.forEach( ( item ) => {
			markPageExistence( item, this.queryCache );
		} );
	} );
};

/**
 * @param {string} name
 * @return {jQuery.Promise}
 */
MultiselectLookup.prototype.searchForPageInNamespace = function ( name ) {
	const deferred = $.Deferred();

	const title = this.getPrefixedTitle( name );
	if ( !title ) {
		this.queryCache[ name ] = 'NO';
		return deferred.resolve( [] ).promise();
	}

	this.queryCache[ name ] = 'PENDING';

	this.api.get( {
		formatversion: 2,
		action: 'query',
		prop: 'info',
		titles: title.getPrefixedText()
	} ).done( ( res ) => {
		const pages = populateCache( res, this.queryCache );
		deferred.resolve( pages );
	} ).fail( () => {
		deferred.reject.bind( deferred );
	} );

	return deferred.promise();
};

/**
 * @param {string[]} names
 * @return {jQuery.Promise}
 */
MultiselectLookup.prototype.searchForPagesInNamespace = function ( names ) {
	const deferred = $.Deferred();

	names = names.map( ( name ) => {
		const title = this.getPrefixedTitle( name );
		if ( !title ) {
			this.queryCache[ name ] = 'NO';
			return null;
		}
		return title.getPrefixedText();
	} ).filter( ( name ) => name );
	if ( !names.length ) {
		return deferred.resolve().promise();
	}

	this.api.get( {
		formatversion: 2,
		action: 'query',
		prop: 'info',
		titles: names.join( '|' )
	} ).done( ( res ) => {
		populateCache( res, this.queryCache );
		deferred.resolve();
	} ).fail( () => {
		deferred.reject.bind( deferred );
	} );

	return deferred.promise();
};

/**
 * @param {string} data
 * @param {string} label
 * @return {OO.ui.TagItemWidget}
 */
MultiselectLookup.prototype.createTagItemWidget = function ( data, label ) {
	label = label || data;
	const title = this.getPrefixedTitle( label ),
		$tagItemLabel = $( '<a>' );

	if ( title ) {
		$tagItemLabel.attr( {
			target: '_blank',
			href: title.getUrl(),
			title: title.getPrefixedText()
		} );
	}

	const tagItem = new OO.ui.TagItemWidget( {
		data: data,
		label: label,
		$label: $tagItemLabel
	} );

	if ( !this.queryCache.has( tagItem.getLabel() ) ) {
		this.searchForPageInNamespace( tagItem.getLabel() )
			.then( ( response ) => {
				if ( !response.length ) {
					markNonExistent( tagItem );
				}
			} );
	} else {
		markPageExistence( tagItem, this.queryCache );
	}

	// The click event defined in TagItemWidget's constructor
	// is removed because it destroys the pill field on click.
	tagItem.$element.off( 'click' );

	return tagItem;
};

/**
 * Update external states on internal updates
 */
MultiselectLookup.prototype.onValueUpdate = function () {
	this.store.storeField( this.fieldId, this.getValue() );
};

/**
 * @inheritdoc OO.ui.mixin.LookupElement
 */
MultiselectLookup.prototype.getLookupRequest = function () {
	const value = this.input.getValue();

	// @todo More elegant way to prevent empty API requests?
	if ( !value.trim() ) {
		return $.Deferred().reject();
	}
	return this.api.get( {
		action: 'opensearch',
		search: value,
		namespace: this.namespaceId
	} );
};

/**
 * @inheritdoc OO.ui.mixin.LookupElement
 */
MultiselectLookup.prototype.getLookupCacheDataFromResponse = function ( response ) {
	return response || [];
};

/**
 * @inheritdoc OO.ui.mixin.LookupElement
 */
MultiselectLookup.prototype.getLookupMenuOptionsFromData = function ( data ) {
	const items = [];
	const currentValues = this.getValue();
	for ( let i = 0; i < data[ 1 ].length; i++ ) {
		const pageNameWithoutNamespace = this.removeNamespace( data[ 1 ][ i ] );

		// do not show suggestions for items already selected
		if ( currentValues.includes( pageNameWithoutNamespace ) ) {
			continue;
		}

		items.push( new OO.ui.MenuOptionWidget( {
			data: pageNameWithoutNamespace,
			label: pageNameWithoutNamespace
		} ) );
	}
	return items;
};

/**
 * @private
 * @param {string} pageName
 * @return {mw.Title|null}
 */
MultiselectLookup.prototype.getPrefixedTitle = function ( pageName ) {
	return mw.Title.newFromText( pageName, this.namespaceId );
};

/**
 * Get the name part of a page title containing a namespace
 *
 * @private
 * @param {string} pageTitle
 * @return {string}
 */
MultiselectLookup.prototype.removeNamespace = function ( pageTitle ) {
	return mw.Title.newFromText( pageTitle ).getMainText();
};

/**
 * Override behavior from OO.ui.mixin.LookupElement
 *
 * @param {OO.ui.TagItemWidget} item
 */
MultiselectLookup.prototype.onLookupMenuChoose = function ( item ) {
	this.addTag( item.getData() );
	this.input.setValue( '' );
};

/**
 * Override to make sure query caching is based on the correct (input) value
 *
 * @inheritdoc
 */
MultiselectLookup.prototype.getRequestQuery = function () {
	return this.input.getValue();
};

/**
 * Implemented because OO.ui.mixin.LookupElement expects it.
 *
 * @return {boolean}
 */
MultiselectLookup.prototype.isReadOnly = function () {
	return false;
};

module.exports = MultiselectLookup;
