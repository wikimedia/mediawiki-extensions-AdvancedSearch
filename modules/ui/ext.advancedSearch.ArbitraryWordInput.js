( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.TagMultiselectWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.ArbitraryWordInput = function ( store, config ) {
		var myConfig = $.extend( { allowArbitrary: true }, config || {} );
		this.store = store;
		this.optionId = config.optionId;

		this.store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.ArbitraryWordInput.parent.call( this, myConfig );

		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.ArbitraryWordInput, OO.ui.TagMultiselectWidget );

	/**
	 * @inheritdoc
	 */
	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.doInputEnter = function () {
		if ( !this.input.getValue() ) {
			return true;
		}
		return mw.libs.advancedSearch.ui.ArbitraryWordInput.parent.prototype.doInputEnter.call( this );
	};

	/**
	 * @inheritdoc
	 */
	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.onInputBlur = function () {
		if ( this.input.getValue() && $.trim( this.input.getValue() ) !== '' ) {
			this.addTagFromInput();
		}
		return mw.libs.advancedSearch.ui.ArbitraryWordInput.parent.prototype.onInputBlur.call( this );
	};

	// TODO move to util module
	function arrayEquals( a1, a2 ) {
		var i = a1.length;
		if ( a1.length !== a2.length ) {
			return false;
		}
		while ( i-- ) {
			if ( a1[ i ] !== a2[ i ] ) {
				return false;
			}
		}
		return true;
	}

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.populateFromStore = function () {
		var val = this.store.getOption( this.optionId ) || [];
		if ( arrayEquals( this.getValue(), val ) ) {
			return;
		}
		this.setValue( val );
	};

} )( mediaWiki, jQuery );
