'use strict';

/**
 * Button that expands a connected pane.
 *
 * Both button and pane can have arbitrary jQuery content.
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.IndicatorElement
 * @constructor
 *
 * @param {Object} config
 * @param {string} config.suffix
 * @param {jQuery} config.$buttonContent
 * @param {number} [config.tabIndex]
 * @param {Function} config.dependentPaneContentBuilder
 */
const ExpandablePane = function ( config ) {
	config = $.extend( config, { data: this.STATE_CLOSED } );
	this.suffix = config.suffix;
	ExpandablePane.parent.call( this, config );

	this.button = new OO.ui.ButtonWidget( {
		classes: [ 'mw-advancedSearch-expandablePane-button' ],
		framed: true,
		tabIndex: config.tabIndex,
		label: config.$buttonContent,
		indicator: 'down'
	} );
	this.button.connect( this, {
		click: 'onButtonClick'
	} );

	this.$dependentPane = $( '<div>' )
		.attr( 'id', 'mw-advancedSearch-expandable-' + config.suffix )
		.addClass( 'mw-advancedSearch-expandablePane-pane' );
	this.dependentPaneContentBuilder = config.dependentPaneContentBuilder;

	// The following classes are used here:
	// * mw-advancedSearch-expandablePane-namespaces
	// * mw-advancedSearch-expandablePane-options
	this.$element.addClass( 'mw-advancedSearch-expandablePane-' + this.suffix );
	this.$element.append( this.button.$element, this.$dependentPane );
	this.button.$button.attr( {
		'aria-controls': 'mw-advancedSearch-expandable-' + config.suffix,
		'aria-expanded': 'false'
	} );

	this.notifyChildInputVisibility( config.data === this.STATE_OPEN );
};

OO.inheritClass( ExpandablePane, OO.ui.Widget );
OO.mixinClass( ExpandablePane, OO.ui.mixin.IndicatorElement );

ExpandablePane.prototype.STATE_CLOSED = 'closed';
ExpandablePane.prototype.STATE_OPEN = 'open';

ExpandablePane.prototype.onButtonClick = function () {
	if ( this.data === this.STATE_OPEN ) {
		this.data = this.STATE_CLOSED;
		this.updatePaneVisibility( this.STATE_CLOSED );
		this.notifyChildInputVisibility( false );
		mw.track( 'counter.MediaWiki.AdvancedSearch.event.' + this.suffix + '.collapse' );
	} else {
		this.data = this.STATE_OPEN;
		this.updatePaneVisibility( this.STATE_OPEN );
		this.notifyChildInputVisibility( true );
		mw.track( 'counter.MediaWiki.AdvancedSearch.event.' + this.suffix + '.expand' );
	}
	this.emit( 'change', this.data );
};

ExpandablePane.prototype.buildDependentPane = function () {
	if ( this.dependentPaneContentBuilder ) {
		this.$dependentPane.append( this.dependentPaneContentBuilder() );
		this.dependentPaneContentBuilder = null;
	}
};

/**
 * @private
 * @param {boolean} visible
 */
ExpandablePane.prototype.notifyChildInputVisibility = function ( visible ) {
	$( 'input', this.$dependentPane ).trigger( visible === true ? 'visible' : 'hidden' );
};

/**
 * @private
 * @param {string} state
 */
ExpandablePane.prototype.updatePaneVisibility = function ( state ) {
	if ( state === this.STATE_OPEN ) {
		this.$dependentPane.show();
		this.button.$button.attr( 'aria-expanded', 'true' );
	} else {
		this.$dependentPane.hide();
		this.button.$button.attr( 'aria-expanded', 'false' );
	}
};

/**
 * @return {boolean}
 */
ExpandablePane.prototype.isOpen = function () {
	return this.data === this.STATE_OPEN;
};

module.exports = ExpandablePane;
