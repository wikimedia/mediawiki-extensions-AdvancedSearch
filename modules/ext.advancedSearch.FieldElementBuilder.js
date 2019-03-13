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
	mw.libs.advancedSearch.FieldElementBuilder = function ( state ) {
		this.state = state;
	};

	$.extend( mw.libs.advancedSearch.FieldElementBuilder.prototype, {
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
					self.state.storeField( id, newValue );
					return;
				}

				self.state.storeField( id, newValue.map( function ( valueObj ) {
					if ( typeof valueObj === 'string' ) {
						return valueObj;
					}
					return valueObj.data;
				} ) );
			};
		},

		/**
		 * @param {ext.libs.advancedSearch.SearchField} field
		 * @return {ext.libs.advancedSearch.ui.TextInput}
		 * @private
		 */
		createWidget: function ( field ) {
			var widgetDefaultConfig = {
					fieldId: field.id,
					id: 'advancedSearchField-' + field.id
				},
				widget = field.init( this.state, widgetDefaultConfig );

			if ( !field.customEventHandling ) {
				widget.on( 'change', this.createMultiSelectChangeHandler( field.id ) );
			}

			return widget;
		},

		/**
		 * Build HTML element that contains all the search fields
		 *
		 * @param {ext.advancedSearch.FieldCollection} fieldCollection
		 * @return {jQuery} jQuery object that contains all search field widgets, wrapped in Layout widgets
		 */
		buildAllFieldsElement: function ( fieldCollection ) {
			var $allOptions = $( '<div>' ).addClass( 'mw-advancedSearch-fieldContainer' ),
				fieldSets = {},
				self = this,
				group;

			fieldCollection.fields.forEach( function ( field ) {
				if ( typeof field.enabled === 'function' && !field.enabled() ) {
					return;
				}

				group = fieldCollection.getGroup( field.id );
				if ( !fieldSets[ group ] ) {
					fieldSets[ group ] = new OO.ui.FieldsetLayout( {
						label: mw.msg( 'advancedsearch-optgroup-' + group )
					} );
				}

				fieldSets[ group ].addItems( [
					field.layout( self.createWidget( field ), field, self.state )
				] );
			} );

			for ( group in fieldSets ) {
				$allOptions.append( fieldSets[ group ].$element );
			}

			return $allOptions;
		}
	} );
}() );
