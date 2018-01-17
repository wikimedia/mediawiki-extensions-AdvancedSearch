( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.TagMultiselectWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.TemplateSearch = function ( store, config ) {
		config = $.extend( {}, config, {
			allowArbitrary: true,
			input: {
				autocomplete: false
			}
		} );
		this.store = store;
		this.optionId = config.optionId;
		this.api = config.api || new mw.Api();

		this.store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.TemplateSearch.parent.call( this, config );

		this.$input = this.input.$input;

		this.input.connect( this, { change: 'onLookupInputChange' } );

		// Mixin constructor
		OO.ui.mixin.LookupElement.call( this, config );

		this.populateFromStore();

		this.connect( this, { change: 'onValueUpdate' } );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.TemplateSearch, OO.ui.TagMultiselectWidget );
	OO.mixinClass( mw.libs.advancedSearch.ui.TemplateSearch, OO.ui.mixin.LookupElement );

	mw.libs.advancedSearch.ui.TemplateSearch.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.TemplateSearch.prototype.populateFromStore = function () {
		// protect parent class from working with an undefined value
		var value = this.store.getOption( this.optionId ) || [];

		// avoid redundant event triggering if no value change is performed
		if ( OO.compare( value, this.getValue() ) ) {
			return;
		}

		this.setValue( value );
	};

	/**
	 * Update external states on internal updates
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.onValueUpdate = function () {
		this.store.storeOption( this.optionId, this.getValue() );
	};

	/**
	 * @inheritdoc OO.ui.mixin.LookupElement
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.getLookupRequest = function () {
		var value = this.input.getValue();

		// @todo More elegant way to prevent empty API requests?
		if ( value.trim() === '' ) {
			return $.Deferred().reject();
		}

		return this.api.get( {
			action: 'opensearch',
			search: this.input.getValue(),
			namespace: 10
		} );
	};

	/**
	 * @inheritdoc OO.ui.mixin.LookupElement
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response || [];
	};

	/**
	 * @inheritdoc OO.ui.mixin.LookupElement
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.getLookupMenuOptionsFromData = function ( data ) {
		var
			items = [],
			i, templateNameWithoutNamespace,
			currentValues = this.getValue();
		for ( i = 0; i < data[ 1 ].length; i++ ) {
			templateNameWithoutNamespace = this.removeNamespace( data[ 1 ][ i ] );

			// do not show suggestions for items already selected
			if ( currentValues.indexOf( templateNameWithoutNamespace ) !== -1 ) {
				continue;
			}

			items.push( new OO.ui.MenuOptionWidget( {
				data: templateNameWithoutNamespace,
				label: templateNameWithoutNamespace
			} ) );
		}
		return items;
	};

	/**
	 * Get the name part of a page title containing a namespace
	 *
	 * @param {string} pageTitle
	 * @return {string}
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.removeNamespace = function ( pageTitle ) {
		return mw.Title.newFromText( pageTitle ).getNameText();
	};

	/**
	 * Override behavior from OO.ui.mixin.LookupElement
	 *
	 * @param {OO.ui.TagItemWidget} item
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.onLookupMenuItemChoose = function ( item ) {
		this.addTag( item.getData() );
		this.input.setValue( '' );
	};

	/**
	 * Override to make sure query caching is based on the correct (input) value
	 *
	 * @inheritdoc
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.getRequestQuery = function () {
		return this.input.getValue();
	};

	/**
	 * Implemented because OO.ui.mixin.LookupElement expects it.
	 *
	 * @return {boolean}
	 */
	mw.libs.advancedSearch.ui.TemplateSearch.prototype.isReadOnly = function () {
		return false;
	};

}( mediaWiki, jQuery ) );
