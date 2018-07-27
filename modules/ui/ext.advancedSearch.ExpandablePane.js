( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * Button that expands a connected pane.
	 *
	 * Both button and pane can have arbitrary jQuery content.
	 *
	 * @class
	 * @extends {OO.ui.Widget}
	 * @mixins {OO.ui.mixin.IndicatorElement}
	 * @constructor
	 *
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.ExpandablePane = function ( config ) {
		config = $.extend( { data: this.STATE_CLOSED }, config );

		mw.libs.advancedSearch.ui.ExpandablePane.parent.call( this, config );

		this.button = new OO.ui.ButtonWidget( {
			classes: [ 'mw-advancedSearch-expandablePane-button' ],
			framed: true,
			tabIndex: config.tabIndex,
			label: config.$buttonLabel,
			indicator: 'down'
		} );
		this.button.connect( this, {
			click: 'onButtonClick'
		} );

		this.$dependentPane = $( '<div>' )
			.attr( 'id', 'mw-advancedSearch-expandable' )
			.addClass( 'mw-advancedSearch-expandablePane-pane' );
		if ( config.$paneContent ) {
			this.$dependentPane.append( config.$paneContent );
		}

		this.$element.addClass( 'mw-advancedSearch-expandablePane' );
		this.$element.append( this.button.$element, this.$dependentPane );
		this.button.$element.attr( {
			'aria-expanded': 'false',
			'aria-controls': 'mw-advancedSearch-expandable'
		} );

		this.notifyChildInputVisibility( config.data === this.STATE_OPEN );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.ExpandablePane, OO.ui.Widget );
	OO.mixinClass( mw.libs.advancedSearch.ui.ExpandablePane, OO.ui.mixin.IndicatorElement );

	mw.libs.advancedSearch.ui.ExpandablePane.prototype.STATE_CLOSED = 'closed';
	mw.libs.advancedSearch.ui.ExpandablePane.prototype.STATE_OPEN = 'open';

	mw.libs.advancedSearch.ui.ExpandablePane.prototype.onButtonClick = function () {
		if ( this.data === this.STATE_OPEN ) {
			this.data = this.STATE_CLOSED;
			this.updatePaneVisibility( this.STATE_CLOSED );
			this.notifyChildInputVisibility( false );
		} else {
			this.data = this.STATE_OPEN;
			this.updatePaneVisibility( this.STATE_OPEN );
			this.notifyChildInputVisibility( true );
		}
		this.emit( 'change', this.data );
	};

	/**
	 * @private
	 * @param {boolean} visible
	 */
	mw.libs.advancedSearch.ui.ExpandablePane.prototype.notifyChildInputVisibility = function ( visible ) {
		$( 'input', this.$dependentPane ).trigger( visible === true ? 'visible' : 'hidden' );
	};

	/**
	 * @private
	 * @param {string} state
	 */
	mw.libs.advancedSearch.ui.ExpandablePane.prototype.updatePaneVisibility = function ( state ) {
		if ( state === this.STATE_OPEN ) {
			this.$dependentPane.show();
			this.button.$element.attr( 'aria-expanded', 'true' );
		} else {
			this.$dependentPane.hide();
			this.button.$element.attr( 'aria-expanded', 'false' );
		}
	};

	/**
	 * @return {boolean}
	 */
	mw.libs.advancedSearch.ui.ExpandablePane.prototype.isOpen = function () {
		return this.data === this.STATE_OPEN;
	};

}( mediaWiki, jQuery ) );
