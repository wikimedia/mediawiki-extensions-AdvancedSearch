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
 * @param {boolean} [config.data=false] True to expand the pane by default
 * @param {string} config.suffix
 * @param {jQuery} config.$buttonLabel
 * @param {number} [config.tabIndex]
 * @param {Function} config.dependentPaneContentBuilder
 */
const ExpandablePane = function ( config ) {
	this.suffix = config.suffix;
	ExpandablePane.parent.call( this, config );

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

	this.notifyChildInputVisibility();
};

OO.inheritClass( ExpandablePane, OO.ui.Widget );
OO.mixinClass( ExpandablePane, OO.ui.mixin.IndicatorElement );

ExpandablePane.prototype.onButtonClick = function () {
	const action = this.isOpen() ? 'collapse' : 'expand';
	this.data = !this.isOpen();
	this.updatePaneVisibility();
	this.notifyChildInputVisibility();
	mw.track( 'counter.MediaWiki.AdvancedSearch.event.' + this.suffix + '.' + action );
	this.emit( 'change', this.isOpen() );
};

ExpandablePane.prototype.buildDependentPane = function () {
	if ( this.dependentPaneContentBuilder ) {
		this.$dependentPane.append( this.dependentPaneContentBuilder() );
		this.dependentPaneContentBuilder = null;
	}
};

/**
 * @private
 */
ExpandablePane.prototype.notifyChildInputVisibility = function () {
	$( 'input', this.$dependentPane ).trigger( this.isOpen() ? 'visible' : 'hidden' );
};

/**
 * @private
 */
ExpandablePane.prototype.updatePaneVisibility = function () {
	const open = this.isOpen();
	this.$dependentPane.toggle( open );
	this.button.$button.attr( 'aria-expanded', open ? 'true' : 'false' );
};

/**
 * @return {boolean}
 */
ExpandablePane.prototype.isOpen = function () {
	return !!this.data;
};

module.exports = ExpandablePane;
