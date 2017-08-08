( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.Widget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.SearchPreview = function ( store, config ) {
		var myConfig = $.extend( {
			previewOptions: [],
			data: true
		}, config || {} );
		this.store = store;
		this.previewOptions = myConfig.previewOptions;

		store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.SearchPreview.parent.call( this, myConfig );

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
	 * Render the preview for all options
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.updatePreview = function () {
		// TODO check if we really need to re-generate
		this.$element.find( '.mw-advancedSearch-searchPreview-previewPill' ).remove();

		if ( !this.data ) {
			return;
		}

		$.each( this.previewOptions, function ( index, optionId ) {
			var val = this.store.getOption( optionId );

			if ( this.skipOptionInPreview( optionId, val ) ) {
				return;
			}

			this.$element.append( this.generateTag( optionId, val ).$element );
		}.bind( this ) );
	};

	/**
	 * Decide if an option-value-combination should be listed in the preview
	 *
	 * @param {string} optionId
	 * @param {string|array} value
	 * @return {boolean}
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.skipOptionInPreview = function ( optionId, value ) {
		if ( !value ) {
			return true;
		}
		if ( $.isArray( value ) && value.length === 0 ) {
			return true;
		}
		if ( optionId.match( '^file[hw]$' ) && $.isArray( value ) && !value[ 1 ] ) {
			return true;
		}

		return false;
	};

	/**
	 * Create a tag item that represents the preview for a single option-value-combination
	 *
	 * @param {string} optionId
	 * @param {string} value
	 * @return {OO.ui.TagItemWidget}
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.generateTag = function ( optionId, value ) {
		var formattedValue = this.formatValue( value ),
			tag = new OO.ui.TagItemWidget( {
				label: mw.msg( 'advancedsearch-field-' + optionId ),
				content: [
					new OO.ui.HtmlSnippet(
						$( '<span>' )	// redundant span to cover browsers without support for bdi tag
							.addClass( 'content' )
							.append(
								$( '<bdi>' ).text( formattedValue )
							)
					)
				]
			} );

		tag.toggleDraggable( false ); // constructor config has no effect; https://phabricator.wikimedia.org/T172781

		tag.connect( this, {
			remove: function () {
				this.store.removeOption( optionId );
			}
		} );

		tag.$element
			.attr( 'title', formattedValue )
			.addClass( 'mw-advancedSearch-searchPreview-previewPill' );

		return tag;
	};

	/**
	 * Format a value to be used in the preview
	 *
	 * @param {string|array} value
	 * @return {string}
	 */
	mw.libs.advancedSearch.ui.SearchPreview.prototype.formatValue = function ( value ) {
		if ( $.isArray( value ) ) {
			value = value.join( ' ' );
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

}( mediaWiki, jQuery ) );
