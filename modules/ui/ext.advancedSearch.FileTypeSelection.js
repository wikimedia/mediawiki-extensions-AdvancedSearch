( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.DropdownInputWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.FileTypeSelection = function ( store, config ) {
		var myConfig = $.extend( {
			options: [
				{
					data: '',
					label: ''
				},
				{
					optgroup: mw.msg( 'advancedsearch-filetype-section-types' )
				},
				{
					data: 'bitmap',
					label: mw.msg( 'advancedsearch-filetype-bitmap' )
				},
				{
					data: 'vector',
					label: mw.msg( 'advancedsearch-filetype-vector' )
				},
				{
					data: 'video',
					label: mw.msg( 'advancedsearch-filetype-video' )
				},
				{
					data: 'audio',
					label: mw.msg( 'advancedsearch-filetype-audio' )
				},
				{
					data: 'multimedia',
					label: mw.msg( 'advancedsearch-filetype-multimedia' )
				},
				{
					data: 'document',
					label: mw.msg( 'advancedsearch-filetype-document' )
				},

				{
					optgroup: mw.msg( 'advancedsearch-filetype-section-image' )
				},
				{
					data: 'jpeg',
					label: mw.msg( 'advancedsearch-filetype-bitmap-jpeg' )
				},
				{
					data: 'tiff',
					label: mw.msg( 'advancedsearch-filetype-bitmap-tiff' )
				},
				{
					data: 'svg',
					label: mw.msg( 'advancedsearch-filetype-vector-svg' )
				},

				{
					optgroup: mw.msg( 'advancedsearch-filetype-section-sound' )
				},
				{
					data: 'jpeg',
					label: mw.msg( 'advancedsearch-filetype-audio-wav' )
				},
				{
					data: 'tiff',
					label: mw.msg( 'advancedsearch-filetype-audio-flac' )
				},
				{
					data: 'svg',
					label: mw.msg( 'advancedsearch-filetype-audio-midi' )
				},

				{
					optgroup: mw.msg( 'advancedsearch-filetype-section-document' )
				},
				{
					data: 'pdf',
					label: mw.msg( 'advancedsearch-filetype-document-pdf' )
				},
				{
					data: 'office',
					label: mw.msg( 'advancedsearch-filetype-document-office' )
				}
			]
		}, config );
		this.store = store;
		this.optionId = config.optionId;

		// Parent constructor
		mw.libs.advancedSearch.ui.FileTypeSelection.parent.call( this, myConfig );

		store.connect( this, { update: 'onStoreUpdate' } );

		this.setValueFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.FileTypeSelection, OO.ui.DropdownInputWidget );

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.onStoreUpdate = function () {
		this.setValueFromStore();
	};

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.setValueFromStore = function () {
		var storeValue = this.store.getOption( this.optionId ),
			selectedItem = this.dropdownWidget.getMenu().getItemFromData( storeValue );
		// avoid setting invalid values and re-triggering
		if ( selectedItem === null || this.getValue() === storeValue ) {
			return;
		}
		this.setValue( storeValue );
	};

}( mediaWiki, jQuery ) );
