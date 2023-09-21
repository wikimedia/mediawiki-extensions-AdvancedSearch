'use strict';

/**
 * @class
 * @extends OO.ui.Widget
 * @constructor
 *
 * @param {SearchModel} store
 * @param {Object} config
 * @cfg {boolean} [data=true] If the set of preview pills should be visible
 * @cfg {Object.<int,string>} namespacesLabels
 */
const NamespacesPreview = function ( store, config ) {
	config = $.extend( {
		data: true
	}, config );
	this.store = store;
	this.namespacesLabels = config.namespacesLabels;

	store.connect( this, { update: 'onStoreUpdate' } );

	NamespacesPreview.parent.call( this, config );

	this.$element.addClass( 'mw-advancedSearch-namespacesPreview' );
	this.updatePreview();
};

OO.inheritClass( NamespacesPreview, OO.ui.Widget );

NamespacesPreview.prototype.onStoreUpdate = function () {
	this.updatePreview();
};

/**
 * Render the preview for all options
 */
NamespacesPreview.prototype.updatePreview = function () {
	// TODO check if we really need to re-generate
	this.$element.find( '.mw-advancedSearch-namespacesPreview-previewPill' ).remove();
	if ( !this.data ) {
		return;
	}

	this.store.getNamespaces().forEach( function ( nsId ) {
		const val = this.namespacesLabels[ nsId ] || nsId;
		this.$element.append( this.generateTag( nsId, val ).$element );
	}.bind( this ) );
};

/**
 * Create a tag item that represents the preview for a single option-value-combination
 *
 * @param {string} nsId
 * @param {string} value
 * @return {OO.ui.TagItemWidget}
 */
NamespacesPreview.prototype.generateTag = function ( nsId, value ) {
	const tag = new OO.ui.TagItemWidget( {
		label: $( '<span>' ).text( value ),
		draggable: false
	} );

	tag.connect( this, {
		remove: function () {
			this.store.removeNamespace( nsId );
		}
	} );

	tag.$element
		.attr( 'title', value )
		.addClass( 'mw-advancedSearch-namespacesPreview-previewPill' );
	return tag;
};

/**
 * @param {boolean} show
 */
NamespacesPreview.prototype.togglePreview = function ( show ) {
	this.data = show;
	this.updatePreview();
};

module.exports = NamespacesPreview;
