( function ( mw, $ ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	/**
	 * @param {string} val
	 * @return {string}
	 */
	function trimQuotes( val ) {
		val = val.replace( /^"((?:\\.|[^"\\])+)"$/, '$1' );
		if ( !/^"/.test( val ) ) {
			val = val.replace( /\\(.)/g, '$1' );
		}
		return val;
	}

	/**
	 * @param {string} val
	 * @return {string}
	 */
	function enforceQuotes( val ) {
		return '"' + trimQuotes( val ).replace( /(["\\])/g, '\\$1' ) + '"';
	}

	/**
	 * @param {string} val
	 * @return {string}
	 */
	function optionalQuotes( val ) {
		return /\s/.test( val ) ? enforceQuotes( val ) : trimQuotes( val );
	}

	/**
	 * @param {string} prefix
	 * @param {string} val
	 * @return {string}
	 */
	function formatSizeConstraint( prefix, val ) {
		if ( !Array.isArray( val ) || val.length < 2 || $.trim( val[ 1 ] ) === '' ) {
			return '';
		}
		return prefix + val.join( '' );
	}

	function getMessageOrFalse( messageKey ) {
		// use prepared tooltip because of mw.message deficiencies
		var tooltips = mw.config.get( 'advancedSearch.tooltips' );
		return tooltips[ messageKey ] || false;
	}

	function getOptionHelpMessageOrFalse( option ) {
		var message = getMessageOrFalse( 'advancedsearch-help-' + option.id );
		var head = mw.msg( 'advancedsearch-field-' + option.id );
		if ( !message || !head ) {
			return false;
		}

		return new OO.ui.HtmlSnippet( '<h6 class="mw-advancedSearch-tooltip-head">' + head + '</h6>' + message );
	}

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
		 */
		state: null,

		/**
		 * @param {OO.ui.Widget} widget
		 * @param {string} option
		 * @param {ext.libs.advancedSearch.dm.SearchModel} state
		 * @return {ext.advancedSearch.ui.OptionalElementLayout}
		 */
		createOptionalFieldLayout: function ( widget, option, state ) {
			return new mw.libs.advancedSearch.ui.OptionalElementLayout(
				state,
				widget,
				{
					label: mw.msg( 'advancedsearch-field-' + option.id ),
					align: 'right',
					checkVisibility: function () {
						return state.filetypeSupportsDimensions();
					},
					help: getOptionHelpMessageOrFalse( option )
				}
			);
		},

		/**
		 * @param {OO.ui.Widget} widget
		 * @param {string} option
		 * @return {OO.ui.FieldLayout|ext.advancedSearch.ui.OptionalElementLayout}
		 */
		createLayout: function ( widget, option ) {
			if ( option.layout ) {
				return option.layout( widget, option, this.state );
			}

			return new OO.ui.FieldLayout(
				widget,
				{
					label: mw.msg( 'advancedsearch-field-' + option.id ),
					align: 'right',
					help: getOptionHelpMessageOrFalse( option )
				}
			);
		},

		/**
		 * @param  {string} id
		 * @return {Function}
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
		 * @param {string} option
		 * @return {ext.libs.advancedSearch.ui.TextInput}
		 */
		createWidget: function ( option ) {
			var self = this,
				initializationFunction = option.init ||
				function () {
					return new mw.libs.advancedSearch.ui.TextInput(
						self.state,
						{
							id: 'advancedSearchOption-' + option.id,
							optionId: option.id
						}
					);
				};

			var widget = initializationFunction();

			if ( !option.customEventHandling ) {
				widget.on( 'change', this.createMultiSelectChangeHandler( option.id ) );
			}

			return widget;
		},

		/**
		 * Returns the general file type options
		 *
		 * @return {Array.<Object>}
		 */
		getOptions: function () {
			var self = this;
			return [
				// Text
				{
					group: 'text',
					id: 'plain',
					formatter: function ( val ) {
						return val;
					}
				},
				{
					group: 'text',
					id: 'phrase',
					formatter: function ( val ) {
						if ( Array.isArray( val ) ) {
							return $.map( val, enforceQuotes ).join( ' ' );
						}
						return enforceQuotes( val );
					},
					init: function () {
						return new mw.libs.advancedSearch.ui.ArbitraryWordInput(
							self.state,
							{
								optionId: 'phrase',
								placeholder: mw.msg( 'advancedSearch-placeholder-commas' )
							}
						);
					}
				},
				{
					group: 'text',
					id: 'not',
					formatter: function ( val ) {
						return '-' + optionalQuotes( val );
					}
				},
				{
					group: 'text',
					id: 'or',
					formatter: function ( val ) {
						if ( Array.isArray( val ) ) {
							return $.map( val, optionalQuotes ).join( ' OR ' );
						}
						return optionalQuotes( val );
					},
					init: function () {
						return new mw.libs.advancedSearch.ui.ArbitraryWordInput(
							self.state,
							{
								optionId: 'or',
								placeholder: mw.msg( 'advancedSearch-placeholder-commas' )
							}
						);
					}
				},

				// Structure
				{
					group: 'structure',
					id: 'intitle',
					formatter: function ( val ) {
						return 'intitle:' + optionalQuotes( val );
					}
				},
				{
					group: 'structure',
					id: 'hastemplate',
					formatter: function ( val ) {
						if ( Array.isArray( val ) ) {
							return $.map( val, function ( templateItem ) {
								return 'hastemplate:' + optionalQuotes( templateItem );
							} ).join( ' ' );
						}
						return 'hastemplate:' + optionalQuotes( val );
					},
					init: function () {
						return new mw.libs.advancedSearch.ui.TemplateSearch(
							self.state,
							{ optionId: 'hastemplate' }
						);
					},
					customEventHandling: true
				},

				// Files
				{
					group: 'files',
					id: 'filetype',
					formatter: function ( val ) {
						switch ( val ) {

							case 'bitmap':
							case 'vector':
							case 'audio':
							case 'drawing':
							case 'multimedia':
							case 'office':
							case 'video':
								return 'filetype:' + val;
							default:
								return 'filemime:' + val;
						}
					},
					init: function () {
						return new mw.libs.advancedSearch.ui.FileTypeSelection(
							self.state,
							new mw.libs.advancedSearch.dm.FileTypeOptionProvider( mw.config.get( 'advancedSearch.mimeTypes' ) ),
							{
								optionId: 'filetype',
								name: 'advancedSearchOption-filetype'
							}
						);
					},
					requiredNamespace: 6
				},
				{
					group: 'files',
					id: 'filew',
					formatter: function ( val ) {
						return formatSizeConstraint( 'filew:', val );
					},
					requiredNamespace: 6,
					init: function () {
						return new mw.libs.advancedSearch.ui.ImageDimensionInput(
							self.state,
							{
								optionId: 'filew'
							}
						);
					},
					layout: this.createOptionalFieldLayout
				},
				{
					group: 'files',
					id: 'fileh',
					formatter: function ( val ) {
						return formatSizeConstraint( 'fileh:', val );
					},
					requiredNamespace: 6,
					init: function () {
						return new mw.libs.advancedSearch.ui.ImageDimensionInput(
							self.state,
							{
								optionId: 'fileh'
							}
						);
					},
					layout: this.createOptionalFieldLayout
				}

				// Ideas for Version 2.0:
				// * Ordering ( prefer-recent:,  boost-templates: )
				// * Meta ( linksto:, neartitle:, morelike: )
			];
		}
	} );
}( mediaWiki, jQuery ) );
