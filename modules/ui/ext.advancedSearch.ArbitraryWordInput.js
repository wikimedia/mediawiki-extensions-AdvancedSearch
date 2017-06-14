( function ( mw ) {
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

		mw.libs.advancedSearch.ui.ArbitraryWordInput.parent.call( this, myConfig );
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

} )( mediaWiki );
