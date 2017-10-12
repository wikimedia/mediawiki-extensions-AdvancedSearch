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
		this.store = store;
		this.optionId = config.optionId;
		this.placeholderText = config.placeholder || '';

		this.store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.ArbitraryWordInput.parent.call(
			this,
			$.extend( { allowArbitrary: true }, config || {} )
		);

		this.input.$input.on( 'input', this.onInput.bind( this ) );
		this.on( 'change', this.updatePlaceholder.bind( this ) );

		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.ArbitraryWordInput, OO.ui.TagMultiselectWidget );

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.populateFromStore = function () {
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

		var val = this.store.getOption( this.optionId ) || [];
		if ( arrayEquals( this.getValue(), val ) ) {
			return;
		}
		this.setValue( val );
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.onInput = function () {
		var segments = this.input.getValue().split( ',' );

		if ( segments.length > 1 ) {
			var self = this;

			segments.map( function ( segment ) {
				if ( self.isAllowedData( segment ) ) {
					self.addTag( segment );
				}
			} );

			this.clearInput();
			this.focus();
		}
	};

	/**
	 * @inheritdoc
	 */
	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.isAllowedData = function ( data ) {
		if ( data.trim() === '' ) {
			return false;
		}

		return mw.libs.advancedSearch.ui.ArbitraryWordInput.parent.prototype.isAllowedData.call( this, data );
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.updatePlaceholder = function () {
		this.input.$input.attr( 'placeholder', this.getTextForPlaceholder() );
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.getTextForPlaceholder = function () {
		if ( this.input.getValue() !== '' || this.getValue().length > 0 ) {
			return '';
		}

		return this.placeholderText;
	};

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

}( mediaWiki, jQuery ) );
