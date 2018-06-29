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
	 * @param {string[]} val
	 * @return {string}
	 */
	function formatSizeConstraint( prefix, val ) {
		if ( !Array.isArray( val ) || val.length < 2 || $.trim( val[ 1 ] ) === '' ) {
			return '';
		}
		return prefix + val.join( '' );
	}

	/**
	 * @param {string} messageKey
	 * @return {string}
	 */
	function getMessage( messageKey ) {
		// use prepared tooltip because of mw.message deficiencies
		var tooltips = mw.config.get( 'advancedSearch.tooltips' );
		return tooltips[ messageKey ] || '';
	}

	/**
	 * @param {object} option
	 * @return {string|boolean}
	 */
	function getOptionHelpMessage( option ) {
		var message = getMessage( 'advancedsearch-help-' + option.id );
		var head = mw.msg( 'advancedsearch-field-' + option.id );
		if ( !message || !head ) {
			return false;
		}

		return new OO.ui.HtmlSnippet( '<h6 class="mw-advancedSearch-tooltip-head">' + head + '</h6>' + message );
	}

	/**
	 * @param {OO.ui.Widget} widget
	 * @param {Object} option
	 * @return {OO.ui.FieldLayout}
	 */
	function createDefaultLayout( widget, option ) {
		return new OO.ui.FieldLayout(
			widget,
			{
				label: mw.msg( 'advancedsearch-field-' + option.id ),
				align: 'right',
				help: getOptionHelpMessage( option ),
				$overlay: true
			}
		);
	}

	/**
	 * Create a layout widget that can react to state changes
	 *
	 * @param {OO.ui.Widget} widget Widget to wrap in a OO.ui.FieldLayout
	 * @param {Object} option Options for OO.ui.FieldLayout
	 * @param {ext.libs.advancedSearch.dm.SearchModel} state
	 * @return {ext.advancedSearch.ui.OptionalElementLayout}
	 */
	function createOptionalFieldLayout( widget, option, state ) {
		return new mw.libs.advancedSearch.ui.OptionalElementLayout(
			state,
			widget,
			{
				label: mw.msg( 'advancedsearch-field-' + option.id ),
				align: 'right',
				checkVisibility: function () {
					return state.filetypeSupportsDimensions();
				},
				help: getOptionHelpMessage( option ),
				$overlay: true
			}
		);
	}

	/**
	 * @class
	 * @constructor
	 */
	mw.libs.advancedSearch.AdvancedOptionsConfig = [
		// Text
		{
			group: 'text',
			id: 'plain',
			defaultValue: [],
			formatter: function ( val ) {
				if ( Array.isArray( val ) ) {
					return val.join( ' ' );
				}
				return val;
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.ArbitraryWordInput(
					state,
					{
						optionId: 'plain',
						id: 'advancedSearchOption-plain'
					}
				);
			},
			layout: createDefaultLayout
		},
		{
			group: 'text',
			id: 'phrase',
			defaultValue: '',
			formatter: function ( val ) {
				return val;
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.TextInput(
					state,
					{
						id: 'advancedSearchOption-phrase',
						optionId: 'phrase',
						placeholder: mw.msg( 'advancedsearch-placeholder-exact-text' )
					}
				);
			},
			layout: createDefaultLayout
		},
		{
			group: 'text',
			id: 'not',
			defaultValue: [],
			formatter: function ( val ) {
				if ( Array.isArray( val ) ) {
					return val.map( function ( el ) {
						return '-' + el;
					} ).join( ' ' );
				}
				return '-' + val;
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.ArbitraryWordInput(
					state,
					{
						optionId: 'not',
						id: 'advancedSearchOption-not'
					}
				);
			},
			layout: createDefaultLayout
		},
		{
			group: 'text',
			id: 'or',
			defaultValue: [],
			formatter: function ( val ) {
				if ( Array.isArray( val ) ) {
					return $.map( val, optionalQuotes ).join( ' OR ' );
				}
				return optionalQuotes( val );
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.ArbitraryWordInput(
					state,
					{
						optionId: 'or',
						id: 'advancedSearchOption-or'
					}
				);
			},
			layout: createDefaultLayout
		},

		// Structure
		{
			group: 'structure',
			id: 'intitle',
			defaultValue: '',
			formatter: function ( val ) {
				return 'intitle:' + optionalQuotes( val );
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.TextInput(
					state,
					{
						id: 'advancedSearchOption-intitle',
						optionId: 'intitle'
					}
				);
			},
			layout: createDefaultLayout
		},
		{
			group: 'structure',
			id: 'subpageof',
			defaultValue: '',
			formatter: function ( val ) {
				return 'subpageof:' + optionalQuotes( val );
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.TextInput(
					state,
					{
						id: 'advancedSearchOption-subpageof',
						optionId: 'subpageof'
					}
				);
			},
			layout: createDefaultLayout
		},
		{
			group: 'structure',
			id: 'deepcategory',
			formatter: function ( val ) {
				var keyword = mw.config.get( 'advancedSearch.deepcategoryEnabled' ) ? 'deepcat:' : 'incategory:';
				if ( Array.isArray( val ) ) {
					return $.map( val, function ( templateItem ) {
						return keyword + optionalQuotes( templateItem );
					} ).join( ' ' );
				}
				return keyword + optionalQuotes( val );
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.DeepCategoryFilter(
					state,
					{
						optionId: 'deepcategory',
						lookupId: 'category',
						id: 'advancedSearch-deepcategory'
					}
				);
			},
			layout: createDefaultLayout
		},
		{
			group: 'structure',
			id: 'hastemplate',
			defaultValue: [],
			formatter: function ( val ) {
				if ( Array.isArray( val ) ) {
					return $.map( val, function ( templateItem ) {
						return 'hastemplate:' + optionalQuotes( templateItem );
					} ).join( ' ' );
				}
				return 'hastemplate:' + optionalQuotes( val );
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.TemplateSearch(
					state,
					{
						optionId: 'hastemplate',
						lookupId: 'template',
						id: 'advancedSearchOption-hastemplate'
					}
				);
			},
			customEventHandling: true,
			layout: createDefaultLayout
		},
		{
			group: 'structure',
			id: 'inlanguage',
			defaultValue: '',
			formatter: function ( val ) {
				return 'inlanguage:' + val;
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.LanguageSelection(
					state,
					new mw.libs.advancedSearch.dm.LanguageOptionProvider( mw.config.get( 'advancedSearch.languages' ) ),
					{
						optionId: 'inlanguage',
						id: 'advancedSearchOption-inlanguage',
						dropdown: { $overlay: true }
					}
				);
			},
			enabled: function () {
				return mw.config.get( 'advancedSearch.languages' ) !== null;
			},
			layout: createDefaultLayout
		},

		// Files
		{
			group: 'files',
			id: 'filetype',
			defaultValue: '',
			formatter: function ( val ) {
				switch ( val ) {
					case 'bitmap':
					case 'audio':
					case 'drawing':
					case 'office':
					case 'video':
						return 'filetype:' + val;
					default:
						return 'filemime:' + val;
				}
			},
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.FileTypeSelection(
					state,
					new mw.libs.advancedSearch.dm.FileTypeOptionProvider( mw.config.get( 'advancedSearch.mimeTypes' ) ),
					{
						optionId: 'filetype',
						id: 'advancedSearchOption-filetype',
						dropdown: { $overlay: true }
					}
				);
			},
			requiredNamespace: 6,
			layout: createDefaultLayout
		},
		{
			group: 'files',
			id: 'filew',
			defaultValue: [ '>', '' ],
			formatter: function ( val ) {
				return formatSizeConstraint( 'filew:', val );
			},
			requiredNamespace: 6,
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.ImageDimensionInput(
					state,
					{
						optionId: 'filew',
						id: 'advancedSearchOption-filew'
					}
				);
			},
			layout: createOptionalFieldLayout
		},
		{
			group: 'files',
			id: 'fileh',
			defaultValue: [ '>', '' ],
			formatter: function ( val ) {
				return formatSizeConstraint( 'fileh:', val );
			},
			requiredNamespace: 6,
			init: function ( state ) {
				return new mw.libs.advancedSearch.ui.ImageDimensionInput(
					state,
					{
						optionId: 'fileh',
						id: 'advancedSearchOption-fileh'
					}
				);
			},
			layout: createOptionalFieldLayout
		}

		// Ideas for Version 2.0:
		// * Ordering ( prefer-recent:,  boost-templates: )
		// * Meta ( linksto:, neartitle:, morelike: )
	];

}( mediaWiki, jQuery ) );
