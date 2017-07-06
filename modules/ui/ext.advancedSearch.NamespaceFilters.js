( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.MenuTagMultiselectWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 * @cfg {Object} [namespaceIcons] Namespace id => icon name
	 * @cfg {Object} [namespaces] Namespace id => Namespace label (similar to mw.config.get( 'wgFormattedNamespaces' ) )
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters = function ( store, config ) {
		var myConfig = $.extend( {
			namespaces: {},
			namespaceIcons: {
				2: 'userAvatar',
				3: 'userTalk',
				6: 'image',
				8: 'language',
				10: 'puzzle',
				12: 'help',
				828: 'puzzle'
			},
			options: [],
			classes: []
		}, config || {} );

		this.namespaces = myConfig.namespaces;
		myConfig.options = myConfig.options.concat( this.createNamespaceOptions( this.namespaces ) );
		myConfig.classes.push( 'mw-advancedSearch-namespaceFilter' );
		this.setNamespaceIcons( myConfig.namespaceIcons );

		mw.libs.advancedSearch.ui.NamespaceFilters.parent.call( this, myConfig );

		this.$namespaceContainer = $( '<span class="mw-advancedSearch-namespaceContainer"></span>' );
		this.$element.append( this.$namespaceContainer );

		this.store = store;
		this.store.connect( this, { update: 'onStoreUpdate' } );
		this.setValueFromStore();
		this.updateNamespaceFormFields();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.NamespaceFilters, OO.ui.MenuTagMultiselectWidget );

	/**
	 * @inheritdoc
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.createMenuOptionWidget = function ( data, label ) {
		return new OO.ui.MenuOptionWidget( {
			data: data,
			label: label || data,
			icon: this.getNamespaceIcon( data )
		} );
	};

	/**
	 * @param  {number} ns Namespace ID
	 * @return {string}    Icon name
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.getNamespaceIcon = function ( ns ) {
		if ( ns in this.namespaceIcons ) {
			return this.namespaceIcons[ ns ];
		}
		return ns % 2 ? 'stripeSummary' : 'article';
	};

	/**
	 *
	 * @param  {Object} icons Namespace id => icon name
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.setNamespaceIcons = function ( icons ) {
		this.namespaceIcons = icons;
	};

	/**
	 * Create an options array suitable for menu items
	 *
	 * @param {Object} namespaces namespace id => label
	 * @return {Object}
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.createNamespaceOptions = function ( namespaces ) {
		var options = [];
		$.each( namespaces, function ( ns, label ) {
			var nsId = parseInt( ns, 10 );
			if ( nsId < 0 || isNaN( nsId ) || !label ) {
				return;
			}

			options.push( {
				data: ns,
				label: label
			} );
		} );
		return options;
	};

	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.onStoreUpdate = function () {
		this.setValueFromStore();
		this.updateNamespaceFormFields();
	};

	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.updateNamespaceFormFields = function () {
		var self = this,
			namespaces = this.store.getNamespaces();
		this.$namespaceContainer.empty();
		$.each( namespaces, function ( idx, key ) {
			self.$namespaceContainer.append( $( '<input type="hidden" value=1>' ).prop( 'name', 'ns' + key ) );
		} );
	};

	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.setValueFromStore = function () {
		var self = this,
			namespaces = this.store.getNamespaces();

		// Avoid endless loop of change events when state is already reached
		if ( !$.isArray( namespaces ) || mw.libs.advancedSearch.util.arrayEquals( namespaces, this.getValue() ) ) {
			return;
		}
		this.clearItems();
		$.each( namespaces, function ( idx, key ) {
			self.addTag( key, self.namespaces[ key ] );
		} );
	};

}( mediaWiki, jQuery ) );
