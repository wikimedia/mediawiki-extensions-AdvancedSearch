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
			.on( 'click keypress', function ( e ) {
				var code = e.keyCode || e.which;
				if (
					code === 13 || // enter
					code === 108 || // numpad enter
					code === 32 || // space
					code === 33 || // page up
					code === 34 || // page down
					code === 38 || // arrow up
					code === 40 || // arrow down
					code === 1 // left mouse
				) {
					// will avoid scrolling with space, arrows and page keys
					e.preventDefault();
					self.onButtonClick();
				}
			} );

		this.$dependentPane = $( '<div></div>' )
			.addClass( 'mw-advancedSearch-expandablePane-pane' );

		if ( config.hasOwnProperty( 'tabIndex' ) ) {
			this.$btn.prop( 'tabindex', parseInt( config.tabIndex ) );
		}

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
