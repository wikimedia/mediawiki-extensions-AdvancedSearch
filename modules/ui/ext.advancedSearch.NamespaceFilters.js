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

		this.$namespaceContainer = $( '<span>' ).addClass( 'mw-advancedSearch-namespaceContainer' );
		this.$element.append( this.$namespaceContainer );

		this.store = store;
		this.store.connect( this, { update: 'onStoreUpdate' } );
		this.setValueFromStore();
		this.updateNamespaceFormFields();

		this.connect( this, { change: 'onValueUpdate' } );
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

	/**
	 * Update internal state on external updates
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.onStoreUpdate = function () {
		this.setValueFromStore();
		this.updateNamespaceFormFields();
	};

	/**
	 * Update external states on internal updates
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.onValueUpdate = function () {
		this.store.setNamespaces( this.getValue() );
	};

	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.updateNamespaceFormFields = function () {
		var self = this,
			namespaces = this.store.getNamespaces();
		this.$namespaceContainer.empty();
		$.each( namespaces, function ( idx, key ) {
			self.$namespaceContainer.append(
				$( '<input>' ).attr( {
					type: 'hidden',
					value: '1',
					name: 'ns' + key
				} )
			);
		} );
	};

	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.setValueFromStore = function () {
		var self = this,
			namespaces = this.store.getNamespaces();

		// prevent updating the store while reacting to its update notification
		this.disconnect( this, { change: 'onValueUpdate' } );

		this.clearItems();
		$.each( namespaces, function ( idx, key ) {
			self.addTag( key, self.namespaces[ key ] );
		} );

		// re-establish event binding
		this.connect( this, { change: 'onValueUpdate' } );
	};

	/**
	 * Construct a OO.ui.TagItemWidget from given label and data.
	 *
	 * Overrides OO.ui.TagMultiselectWidget default behaviour to further configure individual tags; called in addTag()
	 *
	 * @protected
	 * @param {string} data Item data
	 * @param {string} label The label text.
	 * @return {OO.ui.TagItemWidget}
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.createTagItemWidget = function ( data, label ) {
		label = label || data;

		return new OO.ui.TagItemWidget( {
			data: data,
			label: label,
			draggable: false
		} );
	};

	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.disableSelectedNamespacesInMenu = function () {
		var self = this;

		$.each( this.getMenu().getItems(), function ( index, menuItem ) {
			menuItem.setDisabled( !!self.getItemFromData( menuItem.getData() ) );
		} );
	};

	/**
	 * Respond to change event, where items were added, removed, or cleared.
	 *
	 * Overrides OO.ui.TagMultiselectWidget.prototype.onChangeTags default behaviour to add GUI effect
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.onChangeTags = function () {
		mw.libs.advancedSearch.ui.NamespaceFilters.parent.prototype.onChangeTags.call( this );

		this.disableSelectedNamespacesInMenu();

		var tagItems = this.getItems();

		if ( tagItems.length > 0 ) {
			tagItems[ 0 ].setDisabled( tagItems.length === 1 );
		}
	};

	/**
	 * Respond to menu choose event by clearing the input field
	 *
	 * @param {OO.ui.OptionWidget} menuItem Chosen menu item
	 */
	mw.libs.advancedSearch.ui.NamespaceFilters.prototype.onMenuChoose = function ( menuItem ) {
		mw.libs.advancedSearch.ui.NamespaceFilters.parent.prototype.onMenuChoose.call( this, menuItem );
		this.clearInput();
	};

}( mediaWiki, jQuery ) );
