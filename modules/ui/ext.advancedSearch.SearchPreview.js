( function () {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * Get the message associated with a file dimension comparator value
	 *
	 * @param {string} comparator
	 * @return {string}
	 */
	var fileComparatorToMessage = function ( comparator ) {
		switch ( comparator ) {
			case '':
				return 'advancedsearch-filesize-equals-symbol';
			case '>':
				return 'advancedsearch-filesize-greater-than-symbol';
			case '<':
				return 'advancedsearch-filesize-smaller-than-symbol';
		}
	};

	/**
	 * @param {string} fieldId
	 * @return {boolean}
	 */
	var fieldIsImageDimension = function ( fieldId ) {
		return /^file[hw]$/.test( fieldId );
	};

	/**
	 * @param {string} fieldId
	 * @return {boolean}
	 */
	var fieldIsSortMethod = function ( fieldId ) {
		return fieldId === 'sort';
	};

	var lookupTranslationForSortMethod = function ( sortMethodName ) {
		var foundSortMethod = mw.libs.advancedSearch.dm.getSortMethods().filter( function ( sortMethod ) {
			return sortMethod.name === sortMethodName;
		} );
		return foundSortMethod.length > 0 ? foundSortMethod[ 0 ].previewLabel : mw.msg( 'advancedsearch-sort-unknown' );
	};

	var lookupTranslationForLabel = function ( fieldId ) {
		if ( fieldId === 'sort' ) {
			return 'advancedsearch-field-preview-sort';
		}
		return 'advancedsearch-field-' + fieldId;
	};

	/**
	 * @class
	 * @extends {OO.ui.Widget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.SearchPreview = function ( store, config ) {
		config = $.extend( {
			fieldNames: [],
			data: true
		}, config );
		this.store = store;
		this.fieldNames = config.fieldNames;

		store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.SearchPreview.parent.call( this, config );

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

	/**
	 * Render the preview for all fields
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.updatePreview = function () {
		// TODO check if we really need to re-generate
		this.$element.find( '.mw-advancedSearch-searchPreview-previewPill' ).remove();

		if ( !this.data ) {
			return;
		}

		this.fieldNames.forEach( function ( fieldId ) {
			var val = this.store.getField( fieldId );

			if ( this.skipFieldInPreview( fieldId, val ) ) {
				return;
			}

			this.$element.append( this.generateTag( fieldId, val ).$element );
		}.bind( this ) );

		this.$element.append( this.generateTag( 'sort', this.store.getSortMethod() ).$element );
	};

	/**
	 * Decide if an field-value-combination should be listed in the preview
	 *
	 * @param {string} fieldId
	 * @param {string|Array} value
	 * @return {boolean}
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.skipFieldInPreview = function ( fieldId, value ) {
		if ( !value ) {
			return true;
		}
		if ( Array.isArray( value ) && value.length === 0 ) {
			return true;
		}
		if ( fieldIsImageDimension( fieldId ) && Array.isArray( value ) && !value[ 1 ] ) {
			return true;
		}

		if ( fieldIsSortMethod( fieldId ) ) {
			return true;
		}

		return false;
	};

	/**
	 * Create a tag item that represents the preview for a single field-value-combination
	 *
	 * @param {string} fieldId
	 * @param {string} value
	 * @return {OO.ui.TagItemWidget}
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.generateTag = function ( fieldId, value ) {
		var formattedValue = this.formatValue( fieldId, value ),
			tag = new OO.ui.TagItemWidget( {
				label: $()
					.add( $( '<span>' ).text( mw.msg( lookupTranslationForLabel( fieldId ) ) ) )
					// redundant span to cover browsers without support for bdi tag
					.add( $( '<span>' ).addClass( 'mw-advancedSearch-searchPreview-content' ).append(
						$( '<bdi>' ).text( formattedValue )
					) ),
				draggable: false
			} );

		tag.connect( this, {
			remove: function () {
				this.store.removeField( fieldId );
			}
		} );

		tag.$element
			.attr( 'title', formattedValue )
			.addClass( 'mw-advancedSearch-searchPreview-previewPill' )
			.addClass( 'mw-advancedSearch-searchPreview-preview-' + fieldId );

		return tag;
	};

	/**
	 * Format a value to be used in the preview
	 *
	 * @param {string} fieldId
	 * @param {string|Array} value
	 * @return {string}
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.formatValue = function ( fieldId, value ) {
		if ( fieldIsImageDimension( fieldId ) && Array.isArray( value ) ) {
			return mw.msg( fileComparatorToMessage( value[ 0 ] ) ) + ' ' + value[ 1 ];
		}

		if ( fieldIsSortMethod( fieldId ) ) {
			return lookupTranslationForSortMethod( value );
		}

		if ( Array.isArray( value ) ) {
			return value.map( function ( v ) {
				return String( v ).trim();
			} ).filter( function ( v ) {
				return v !== '';
			} ).join( ', ' );
		}

		return value.trim();
	};

	mw.libs.advancedSearch.ui.SearchPreview.prototype.showPreview = function () {
		this.data = true;
		this.updatePreview();
	};

	mw.libs.advancedSearch.ui.SearchPreview.prototype.hidePreview = function () {
		this.data = false;
		this.updatePreview();
	};

}() );
