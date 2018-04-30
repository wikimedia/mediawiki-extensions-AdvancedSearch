( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	var markTemplateExistence = function ( item, queryCache ) {
		if ( queryCache.get( item.$label.text() ) === 'NO' ) {
			item.$element.find( 'a.oo-ui-labelElement-label' ).addClass( 'new' );
		}
	};

	var populateCache = function ( res, self ) {
		var templates = [];

		$.each( res.query.pages, function ( index, page ) {
			if ( !page.missing ) {
				templates.push( page.title );
				self.queryCache.set( page.title, 'YES' );
				return;
			}
			self.queryCache.set( page.title, 'NO' );
		} );

		return templates;
	};

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
		this.queryCache = new mw.libs.advancedSearch.dm.TitleCache();

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

		if ( this.store.hasOptionChanged( this.optionId, this.getValue() ) ) {
			this.setValue( this.store.getOption( this.optionId ) );
		}
	};

	mw.libs.advancedSearch.ui.TemplateSearch.prototype.setValue = function ( valueObject ) {
		var names = Array.isArray( valueObject ) ? valueObject : [ valueObject ];
		// Initialize with "PENDING" value to avoid new request in createTagItemWidget
		names.forEach( function ( value ) { this.queryCache.set( value, 'PENDING' ); }.bind( this ) );
		mw.libs.advancedSearch.ui.TemplateSearch.parent.prototype.setValue.call( this, valueObject );
		this.searchForTemplates( names ).then( function () {
			var self = this;
			this.items.forEach( function ( item ) {
				markTemplateExistence( item, self.queryCache );
			} );
			$( '#advancedSearchOption-hastemplate input' ).css( 'width', '1em' );
		}.bind( this ) );
	};

	mw.libs.advancedSearch.ui.TemplateSearch.prototype.searchForTemplate = function ( name ) {
		var deferred = $.Deferred(), self = this;

		this.queryCache[ name ] = 'PENDING';

		this.api.get( {
			formatversion: 2,
			action: 'query',
			prop: 'info',
			titles: 'Template:' + name
		} ).done( function ( res ) {
			var templates = populateCache( res, self );
			deferred.resolve( templates );
		} ).fail( function () {
			deferred.reject.bind( deferred );
		} );

		return deferred.promise();
	};

	mw.libs.advancedSearch.ui.TemplateSearch.prototype.searchForTemplates = function ( names ) {
		var deferred = $.Deferred(), self = this;

		this.api.get( {
			formatversion: 2,
			action: 'query',
			prop: 'info',
			titles: names.map( function ( name ) { return 'Template:' + name; } ).join( '|' )
		} ).done( function ( res ) {
			var templates = [];
			populateCache( res, self );
			deferred.resolve( templates );
		} ).fail( function () {
			deferred.reject.bind( deferred );
		} );

		return deferred.promise();
	};

	mw.libs.advancedSearch.ui.TemplateSearch.prototype.createTagItemWidget = function ( data, label ) {
		label = label || data;
		var tagItem = new OO.ui.TagItemWidget( { data: data, label: label } );
		var formattedLabel = mw.libs.advancedSearch.util.capitalize( tagItem.$label.text() ),
			title = 'Template:' + formattedLabel,
			extLink = mw.config.get( 'wgScript' ) + '?title=' + title,
			content = mw.libs.advancedSearch.util.capitalize( tagItem.getData() );

		tagItem.$element
			.find( 'span.oo-ui-labelElement-label:first-child' )
			.empty()
			.append(
				'<a target="_blank" href="' + extLink + '" title="' + title + '" class="oo-ui-labelElement-label">' +
				content +
				'</a>'
			);
		// If template doesn't exist color the tag text in red
		if ( !this.queryCache.has( tagItem.$label.text() ) ) {
			this.searchForTemplate( tagItem.$label.text() )
				.then( function ( response ) {
					if ( response.length === 0 ) {
						tagItem.$element.find( 'a.oo-ui-labelElement-label' ).addClass( 'new' );
					}
				} );
		} else {
			markTemplateExistence( tagItem, this.queryCache );
		}

		// The click event defined in TagItemWidget's constructor
		// is removed because it destroys the pill field on click.
		tagItem.$element.off( 'click' );

		return tagItem;
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
