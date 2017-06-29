( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	function prepareOptions( presets ) {
		return $.map( presets, function ( preset, id ) {
			return { data: id, label: preset.label };
		} );
	}

	/**
	 * @class
	 * @extends {OO.ui.CheckboxMultiselectInputWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.NamespacePresets = function ( store, config ) {
		var myConfig = $.extend( {
			presets: {}
		}, config || {} );
		myConfig.options = prepareOptions( config.presets );
		this.store = store;

		this.presets = myConfig.presets;

		mw.libs.advancedSearch.ui.NamespacePresets.parent.call( this, myConfig );

		// Using undocumented internals because this.on does not work, see https://phabricator.wikimedia.org/T168735
		this.checkboxMultiselectWidget.on( 'change', this.updateStoreFromPresets, [], this );
		this.$element.addClass( 'mw-advancedSearch-namespacePresets' );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.NamespacePresets, OO.ui.CheckboxMultiselectInputWidget );

	mw.libs.advancedSearch.ui.NamespacePresets.prototype.updateStoreFromPresets = function ( newValue ) {
		var key = newValue.getData();
		if ( newValue.selected ) {
			this.store.setNamespaces( this.presets[ key ].namespaces );
		} else {
			this.store.setNamespaces( this.store.getNamespaces().filter( function ( id ) {
				return this.presets[ key ].namespaces.indexOf( id ) === -1;
			}, this ) );
		}
	};

}( mediaWiki, jQuery ) );
