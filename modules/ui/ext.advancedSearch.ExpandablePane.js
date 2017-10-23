( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @param  {string} state 'open' or 'closed'
	 * @return {string}       Indicator name
	 */
	function getIndicatorNameForState( state ) {
		return state === 'open' ? 'up' : 'down';
	}

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
		var myConfig = $.extend( { data: this.STATE_CLOSED }, config );

		mw.libs.advancedSearch.ui.ExpandablePane.parent.call( this, myConfig );
		OO.ui.mixin.IndicatorElement.call( this, { indicator: getIndicatorNameForState( myConfig.data ) } );

		var self = this;
		this.$btn = $( '<div></div>' )
			.addClass( 'oo-ui-buttonElement-button' )
			.addClass( 'mw-advancedSearch-expandablePane-button' )
			.on( 'click', function () { self.onButtonClick(); } );

		this.$dependentPane = $( '<div></div>' )
			.addClass( 'mw-advancedSearch-expandablePane-pane' );

		if ( config.$buttonLabel ) {
			this.$btn.append( config.$buttonLabel );
		}

		this.$btn.append( this.$indicator );

		if ( config.$paneContent ) {
			this.$dependentPane.append( config.$paneContent );
		}

		this.$btn.addClass( 'oo-ui-buttonElement-framed' );
		this.$element.addClass( 'mw-advancedSearch-expandablePane' );
		this.$element.append( this.$btn, this.$dependentPane );

		this.notifyChildInputVisibility( myConfig.data === this.STATE_OPEN );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.ExpandablePane, OO.ui.Widget );
	OO.mixinClass( mw.libs.advancedSearch.ui.ExpandablePane, OO.ui.mixin.IndicatorElement );

	mw.libs.advancedSearch.ui.ExpandablePane.prototype.STATE_CLOSED = 'closed';
	mw.libs.advancedSearch.ui.ExpandablePane.prototype.STATE_OPEN = 'open';

	mw.libs.advancedSearch.ui.ExpandablePane.prototype.onButtonClick = function () {
		if ( this.data === this.STATE_OPEN ) {
			this.data = this.STATE_CLOSED;
			this.$dependentPane.hide();
			this.notifyChildInputVisibility( false );
		} else {
			this.data = this.STATE_OPEN;
			this.$dependentPane.show();
			this.notifyChildInputVisibility( true );
		}
		this.setIndicator( getIndicatorNameForState( this.data ) );
		this.emit( 'change', this.data );
	};

	mw.libs.advancedSearch.ui.ExpandablePane.prototype.notifyChildInputVisibility = function ( visible ) {
		$( 'input', this.$dependentPane ).trigger( visible === true ? 'visible' : 'hidden' );
	};

	/**
	 * @return {boolean}
	 */
	mw.libs.advancedSearch.ui.ExpandablePane.prototype.isOpen = function () {
		return this.data === this.STATE_OPEN;
	};

}( mediaWiki, jQuery ) );
