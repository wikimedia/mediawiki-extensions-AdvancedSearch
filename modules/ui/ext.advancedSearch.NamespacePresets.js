( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * Prepare static namespace ID presets for improved performance during later processing
	 *
	 * @param {Object} presets
	 * @return {Object}
	 */
	function groomPresets( presets ) {
		var groomedPresets = {};
		$.each( presets, function ( key, presetConfig ) {
			var preset = { label: presetConfig.label };
			if ( typeof presetConfig.provider !== 'undefined' ) {
				if ( typeof mw.libs.advancedSearch.dm.NamespacePresetProviders[ presetConfig.provider ] === 'function' ) {
					preset.namespaces = mw.libs.advancedSearch.dm.NamespacePresetProviders[ presetConfig.provider ]();
				} else {
					mw.log.warn( 'Provider function ' + presetConfig.provider + ' not found in mw.libs.advancedSearch.dm.NamespacePresetProviders' );
					return;
				}
			} else if ( Array.isArray( presetConfig.namespaces ) ) {
				preset.namespaces = presetConfig.namespaces;
			} else {
				mw.log.warn( 'No defined namespaces or provider function for ' + key + ' in $wgAdvancedSearchNamespacePresets' );
				return;
			}
			preset.namespaces.sort();
			groomedPresets[ key ] = preset;
		} );

		return groomedPresets;
	}

	function prepareOptions( presets ) {
		return $.map( presets, function ( preset, id ) {
			return { data: id, label: mw.msg( preset.label ) };
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
		config = $.extend( {
			presets: {}
		}, config );
		config.presets = groomPresets( config.presets );

		config.options = prepareOptions( config.presets );
		this.store = store;

		this.presets = config.presets;

		mw.libs.advancedSearch.ui.NamespacePresets.parent.call( this, config );

		// Using undocumented internals because this.on does not work, see https://phabricator.wikimedia.org/T168735
		this.checkboxMultiselectWidget.on( 'change', this.updateStoreFromPresets, [], this );
		this.$element.addClass( 'mw-advancedSearch-namespacePresets' );
		store.connect( this, { update: 'updatePresetsFromStore' } );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.NamespacePresets, OO.ui.CheckboxMultiselectInputWidget );

	mw.libs.advancedSearch.ui.NamespacePresets.prototype.updateStoreFromPresets = function ( newValue ) {
		var key = newValue.getData();
		if ( newValue.selected ) {
			this.store.setNamespaces( mw.libs.advancedSearch.util.arrayConcatUnique(
				this.presets[ key ].namespaces,
				this.store.getNamespaces() )
			);
		} else {
			this.store.setNamespaces( this.store.getNamespaces().filter( function ( id ) {
				return this.presets[ key ].namespaces.indexOf( id ) === -1;
			}, this ) );
		}
	};

	mw.libs.advancedSearch.ui.NamespacePresets.prototype.updatePresetsFromStore = function () {
		var selectedPresets = {},
			self = this,
			storeNamespaces = self.store.getNamespaces();
		$.each( this.presets, function ( key, presetConfig ) {
			selectedPresets[ key ] = mw.libs.advancedSearch.util.arrayContains(
				storeNamespaces,
				presetConfig.namespaces
			);
		} );
		this.checkboxMultiselectWidget.off( 'change', this.updateStoreFromPresets, this );
		$.each( selectedPresets, function ( key, isSelected ) {
			var presetWidget = self.checkboxMultiselectWidget.findItemFromData( key );
			if ( presetWidget.isSelected() !== isSelected ) {
				presetWidget.setSelected( isSelected );
			}
		} );
		this.checkboxMultiselectWidget.on( 'change', this.updateStoreFromPresets, [], this );

	};

}( mediaWiki, jQuery ) );
