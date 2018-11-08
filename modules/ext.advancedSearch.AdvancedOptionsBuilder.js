( function () {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	/**
	 * @param {ext.libs.advancedSearch.dm.SearchModel} state
	 *
	 * @class
	 * @constructor
	 */
	mw.libs.advancedSearch.AdvancedOptionsBuilder = function ( state ) {
		this.state = state;
	};

	$.extend( mw.libs.advancedSearch.AdvancedOptionsBuilder.prototype, {
		/**
		 * @type {ext.libs.advancedSearch.dm.SearchModel}
		 * @private
		 */
		state: null,

		/**
		 * @param  {string} id
		 * @return {Function}
		 * @private
		 */
		createMultiSelectChangeHandler: function ( id ) {
			var self = this;

			return function ( newValue ) {
				if ( typeof newValue !== 'object' ) {
					self.state.storeOption( id, newValue );
					return;
				}

				self.state.storeOption( id, $.map( newValue, function ( $valueObj ) {
					if ( typeof $valueObj === 'string' ) {
						return $valueObj;
					}
					return $valueObj.data;
				} ) );
			};
		},

		/**
		 * @param {Object} option
		 * @return {ext.libs.advancedSearch.ui.TextInput}
		 * @private
		 */
		createWidget: function ( option ) {
			var widget = option.init( this.state );

			if ( !option.customEventHandling ) {
				widget.on( 'change', this.createMultiSelectChangeHandler( option.id ) );
			}

			return widget;
		},

		/**
		 * Build HTML element that contains all the search fields
		 *
		 * @param {ext.libs.advancedSearch.AdvancedOptionsConfig} advancedOptions
		 * @return {jQuery} jQuery object that contains all search field widgets, wrapped in Layout widgets
		 */
		buildAllOptionsElement: function ( advancedOptions ) {
			var $allOptions = $( '<div>' ).addClass( 'mw-advancedSearch-fieldContainer' ),
				optionSets = {},
				self = this;

			advancedOptions.forEach( function ( option ) {
				if ( option.enabled && !option.enabled() ) {
					return;
				}

				if ( !optionSets[ option.group ] ) {
					optionSets[ option.group ] = new OO.ui.FieldsetLayout( {
						label: mw.msg( 'advancedsearch-optgroup-' + option.group )
					} );
				}

				optionSets[ option.group ].addItems( [
					option.layout( self.createWidget( option ), option, self.state )
				] );
			} );

			for ( var group in optionSets ) {
				$allOptions.append( optionSets[ group ].$element );
			}

			return $allOptions;
		}
	} );
}() );
