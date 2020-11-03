( function () {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	var getOptions = function ( selected ) {
		var options = mw.libs.advancedSearch.dm.getSortMethods().map( function ( method ) {
			// The currently active sort method already appears in the list, don't add it again
			if ( method.name === selected ) {
				selected = undefined;
			}
			return { data: method.name, label: method.label };
		} );
		if ( selected ) {
			// If the currently active sort method isn't known, show its raw identifier
			options.push( { data: selected } );
		}
		return options;
	};

	mw.libs.advancedSearch.ui.SortPreference = function ( store, config ) {
		this.store = store;
		config = $.extend( {
			options: getOptions( store.getSortMethod() )
		}, config );
		this.className = 'mw-advancedSearch-sort-';

		store.connect( this, { update: 'onStoreUpdate' } );
		mw.libs.advancedSearch.ui.SortPreference.parent.call( this, config );
		this.setValueFromStore();
		this.connect( this, { change: 'onValueUpdate' } );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.SortPreference, OO.ui.DropdownInputWidget );
	OO.mixinClass( mw.libs.advancedSearch.ui.SortPreference, mw.libs.advancedSearch.ui.ClassesForDropdownOptions );

	mw.libs.advancedSearch.ui.SortPreference.prototype.onStoreUpdate = function () {
		this.setValueFromStore();
	};

	mw.libs.advancedSearch.ui.SortPreference.prototype.setValueFromStore = function () {
		this.setValue( this.store.getSortMethod() );
	};

	mw.libs.advancedSearch.ui.SortPreference.prototype.onValueUpdate = function () {
		this.store.setSortMethod( this.getValue() );
	};

}() );
