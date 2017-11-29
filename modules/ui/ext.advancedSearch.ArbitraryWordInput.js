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
		config = $.extend( {}, config );

		this.store = store;
		this.optionId = config.optionId;
		this.placeholderText = config.placeholder || '';

		this.store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.ArbitraryWordInput.parent.call(
			this,
			$.extend( { allowArbitrary: true }, config )
		);

		this.input.$input.on( 'input', this.buildTagsFromInput.bind( this ) );
		this.on( 'change', this.updatePlaceholder.bind( this ) );

		// run initial size calculation after off-canvas construction (hidden parent node)
		this.input.$input.on( 'visible', function () {
			this.updateInputSize();
		}.bind( this ) );

		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.ArbitraryWordInput, OO.ui.TagMultiselectWidget );

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.populateFromStore = function () {
		var val = this.store.getOption( this.optionId ) || [];
		if ( mw.libs.advancedSearch.util.arrayEquals( this.getValue(), val ) ) {
			return;
		}
		this.setValue( val );
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.buildTagsFromInput = function () {
		var segments = this.input.getValue().split( ',' );

		if ( segments.length > 1 ) {
			var self = this;

			segments.map( function ( segment ) {
				var trimmedSegment = segment.trim();

				if ( self.isAllowedData( trimmedSegment ) ) {
					self.addTag( trimmedSegment );
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
		// bust cached width so placeholder remains changeable
		this.contentWidthWithPlaceholder = undefined;
		this.input.$input.attr( 'placeholder', this.getTextForPlaceholder() );
	};

	mw.libs.advancedSearch.ui.ArbitraryWordInput.prototype.getTextForPlaceholder = function () {
		if ( this.getValue().length > 0 ) {
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
