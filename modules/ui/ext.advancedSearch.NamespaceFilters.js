'use strict';

const MenuSelectWidget = require( './ext.advancedSearch.MenuSelectWidget.js' );

/**
 * @class
 * @extends OO.ui.MenuTagMultiselectWidget
 *
 * @constructor
 * @param {SearchModel} store
 * @param {Object} config
 * @param {Object.<string,string>} config.namespaces Namespace id => Namespace label (similar to mw.config.get( 'wgFormattedNamespaces' ) )
 */
const NamespaceFilters = function ( store, config ) {
	this.store = store;
	this.namespaces = this.prettifyNamespaces( config.namespaces );

	NamespaceFilters.super.call( this, $.extend( true, {
		classes: [ 'mw-advancedSearch-namespaceFilter' ],
		inputPosition: 'outline',
		allowArbitrary: false,
		allowDisplayInvalidTags: false,
		allowReordering: false,
		menu: {
			hideWhenOutOfView: false,
			hideOnChoose: false,
			highlightOnFilter: false,
			namespaces: this.namespaces
		},
		input: {
			icon: 'menu'
		}
	}, config ) );

	this.$namespaceContainer = $( '<span>' ).addClass( 'mw-advancedSearch-namespaceContainer' );
	this.$element.append( this.$namespaceContainer );

	this.store.connect( this, { update: 'onStoreUpdate' } );
	this.setValueFromStore();
	this.updateNamespaceFormFields();
	// this needs to be executed last in the stack
	// in order to prevent unwanted scroll-to-top jumps on select
	setTimeout( this.highlightSelectedNamespacesInMenu.bind( this ), 0 );

	this.connect( this, { change: 'onValueUpdate' } );
};

OO.inheritClass( NamespaceFilters, OO.ui.MenuTagMultiselectWidget );

/**
 * Prettify namespace names e.g. "config_talk" becomes "Config talk"
 *
 * @param {Object.<string,string>} namespaceIds Namespace id => Namespace label (similar to mw.config.get( 'wgFormattedNamespaces' ) )
 * @return {Object.<string,string>}
 */
NamespaceFilters.prototype.prettifyNamespaces = function ( namespaceIds ) {
	Object.keys( namespaceIds ).forEach( ( id ) => {
		namespaceIds[ id ] = mw.Title.newFromText( namespaceIds[ id ] || id ).getMainText();
	} );
	return namespaceIds;
};

/**
 * @inheritdoc
 */
NamespaceFilters.prototype.createMenuWidget = function ( menuConfig ) {
	return new MenuSelectWidget( menuConfig );
};

/**
 * Update internal state on external updates
 */
NamespaceFilters.prototype.onStoreUpdate = function () {
	this.setValueFromStore();
	this.updateNamespaceFormFields();
	this.highlightSelectedNamespacesInMenu();
};

/**
 * Update external states on internal updates
 */
NamespaceFilters.prototype.onValueUpdate = function () {
	this.store.setNamespaces( this.getValue() );
};

NamespaceFilters.prototype.updateNamespaceFormFields = function () {
	const namespaceIds = this.store.getNamespaces();
	this.$namespaceContainer.empty();
	namespaceIds.forEach( ( nsId ) => {
		this.$namespaceContainer.append(
			$( '<input>' ).attr( {
				type: 'hidden',
				value: '1',
				name: 'ns' + nsId
			} )
		);
	} );
};

NamespaceFilters.prototype.setValueFromStore = function () {
	const namespaceIds = this.store.getNamespaces();
	// prevent updating the store while reacting to its update notification
	this.disconnect( this, { change: 'onValueUpdate' } );
	this.clearItems();
	namespaceIds.forEach( ( id ) => {
		this.addTag( id, this.namespaces[ id ] );
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
 * @param {string} nsId Numeric namespace id
 * @param {string} [label=nsId] Pretty-printed name of the namespace
 * @return {OO.ui.TagItemWidget}
 */
NamespaceFilters.prototype.createTagItemWidget = function ( nsId, label ) {
	// The following classes are used here:
	// * mw-advancedSearch-namespace-0
	// * mw-advancedSearch-namespace-1
	// etc.
	return new OO.ui.TagItemWidget( {
		data: nsId,
		label: label || nsId,
		draggable: false,
		classes: [ 'mw-advancedSearch-namespace-' + nsId ]
	} );
};

NamespaceFilters.prototype.highlightSelectedNamespacesInMenu = function () {
	this.getMenu().getItems().forEach( ( menuItem ) => {
		const isInTagList = !!this.findItemFromData( menuItem.getData() );
		if ( isInTagList ) {
			menuItem.checkboxWidget.setSelected( false );
			menuItem.setSelected( false );
		}
		menuItem.setSelected( isInTagList );
		menuItem.checkboxWidget.setSelected( isInTagList );
	} );
};

NamespaceFilters.prototype.highlightLastSelectedTag = function ( menuItemData ) {
	const tag = this.findItemFromData( menuItemData );
	if ( tag ) {
		tag.$element.addClass( 'selected' );
	}
};

NamespaceFilters.prototype.removeHighlightFromTags = function () {
	this.getItems().forEach( ( tag ) => {
		tag.$element.removeClass( 'selected' );
	} );
};

/**
 * Remove an item from the list of namespaces in store
 *
 * @param {string} namespace Numeric namespace id to be removed
 * @return {string[]} collection of namespaces minus the removed item
 */
NamespaceFilters.prototype.removeNamespaceTag = function ( namespace ) {
	return this.store.getNamespaces().filter( ( id ) => id !== namespace );
};

/**
 * Add or remove a tag for the chosen menu item based on checkbox state
 *
 * @param {OO.ui.OptionWidget} menuItem Chosen menu item
 */
NamespaceFilters.prototype.onMenuChoose = function ( menuItem ) {
	if ( menuItem.checkboxWidget.isSelected() ) {
		this.store.setNamespaces( this.removeNamespaceTag( menuItem.getData() ) );
	} else {
		NamespaceFilters.super.prototype.onMenuChoose.call( this, menuItem, true );
		this.highlightLastSelectedTag( menuItem.getData() );
		this.clearInput();
	}
};

/**
 * Handle menu toggle events.
 *
 * @private
 * @param {boolean} isVisible Open state of the menu
 */
NamespaceFilters.prototype.onMenuToggle = function ( isVisible ) {
	NamespaceFilters.super.prototype.onMenuToggle.call( this );
	this.input.setIcon( isVisible ? 'search' : 'menu' );
	if ( !isVisible ) {
		this.removeHighlightFromTags();
	}
};

module.exports = NamespaceFilters;
