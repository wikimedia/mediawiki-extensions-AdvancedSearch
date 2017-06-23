( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.Widget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.SearchPreview = function ( store, config ) {
		var myConfig = $.extend( { previewOptions: {} }, config || {} );
		this.store = store;
		this.previewOptions = myConfig.previewOptions;

		store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.SearchPreview.parent.call( this, myConfig );

		this.label = new OO.ui.LabelWidget( {
			label: config.label,
			classes: [ 'mw-advancedSearch-searchPreview-label' ]
		} );
		this.$element.append( this.label.$element );

		this.$element.addClass( 'mw-advancedSearch-searchPreview' );
		this.updatePreview();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.SearchPreview, OO.ui.Widget );

	mw.libs.advancedSearch.ui.SearchPreview.prototype.onStoreUpdate = function () {
		this.updatePreview();
	};

	mw.libs.advancedSearch.ui.SearchPreview.prototype.updatePreview = function () {
		var self = this;
		// TODO check if we really need to re-generate
		this.$element.find( '.mw-advancedSearch-searchPreview-previewPill' ).remove();

		// TODO only generate previews if in preview mode, hide previews when form is shown
		$.each( this.previewOptions, function ( optionId, option ) {
			var val = self.store.getOption( optionId );
			if ( !val || ( optionId.match( '^file[hw]$' ) && ( !$.isArray( val ) || !val[ 1 ] ) ) ) {
				return;
			}
			var tag = new OO.ui.TagItemWidget( { label: option.label } );
			tag.connect( this, {
				remove: function () {
					self.store.removeOption( optionId );
				}
			} );
			tag.$label.attr( 'title', option.formatter( val ) );
			tag.$element.addClass( 'mw-advancedSearch-searchPreview-previewPill' );
			self.$element.append( tag.$element );
		} );
	};

} )( mediaWiki );
