( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.FieldLayout}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.ImageDimensionInput = function ( store, config ) {
		this.optionId = config.optionId;
		this.store = store;
		store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.ImageDimensionInput.parent.call( this, config );

		if ( !$.isArray( this.data ) ) {
			this.data = [ '>', '' ];
		}

		this.$element.addClass( 'advancedSearch-filesize' );

		this.operatorInput = new OO.ui.DropdownInputWidget( {
			options: [
				// TODO translate
				{ data: '', label: mw.msg( 'advancedSearch-filesize-equals' ) },
				{ data: '>', label: mw.msg( 'advancedSearch-filesize-greater-than' ) },
				{ data: '<', label: mw.msg( 'advancedSearch-filesize-smaller-than' ) }
			],
			value: '>'
		} );
		this.valueInput = new OO.ui.TextInputWidget( { label: 'px' } );

		this.operatorInput.connect( this, { change: 'onInputChange' } );
		this.valueInput.connect( this, { change: 'onInputChange' } );

		this.$element.append( this.operatorInput.$element.wrap( '<div class="operator-container"></div>' ).parent() );
		this.$element.append( this.valueInput.$element.wrap( '<div class="value-container"></div>' ).parent() );

		this.operatorInput.setValue( '>' ); // Workaround for broken default value, see https://phabricator.wikimedia.org/T166783
		this.setValuesFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.ImageDimensionInput, OO.ui.Widget );

	mw.libs.advancedSearch.ui.ImageDimensionInput.prototype.onInputChange = function ( val ) {
		this.data[ 0 ] = this.operatorInput.getValue();
		this.data[ 1 ] = this.valueInput.getValue();
		this.emit( 'change', this.data );
	};

	mw.libs.advancedSearch.ui.ImageDimensionInput.prototype.onStoreUpdate = function () {
		this.setValuesFromStore();
	};

	mw.libs.advancedSearch.ui.ImageDimensionInput.prototype.setValuesFromStore = function () {
		var newValue = this.store.getOption( this.optionId );
		if ( !newValue || newValue == this.data ) {
			return;
		}
		this.data = newValue;
		if ( this.data.length < 2 ) {
			return;
		}
		this.operatorInput.setValue( this.data[ 0 ] );
		this.valueInput.setValue( this.data[ 1 ] );
	};

} )( mediaWiki );
