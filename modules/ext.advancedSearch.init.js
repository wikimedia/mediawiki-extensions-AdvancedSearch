( function ( mw, $ ) {
	'use strict';

	function isLoaded() {
		if ( !mw.libs ) {
			mw.libs = {};
		}
		if ( !mw.libs.advancedSearch ) {
			mw.libs.advancedSearch = {};
		}

		if ( mw.libs.advancedSearch.advancedOptionsLoaded ) {
			return true;
		}

		mw.libs.advancedSearch.advancedOptionsLoaded = true;

		return false;
	}

	if ( isLoaded() ) {
		return;
	}

	var state = new mw.libs.advancedSearch.dm.SearchModel();
	state.setAllFromJSON( mw.util.getParamValue( 'advancedSearch-current' ) || '' );

	if ( mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Search' ) {
		return;
	}

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
		if ( !$.isArray( val ) || val.length < 2 || $.trim( val[ 1 ] ) === '' ) {
			return '';
		}
		return prefix + val.join( '' );
	}

	/**
	 * @param  {string} id
	 * @return {Function}
	 */
	function createMultiSelectChangeHandler( id ) {
		return function ( newValue ) {

			if ( typeof newValue !== 'object' ) {
				state.storeOption( id, newValue );
				return;
			}

			state.storeOption( id, $.map( newValue, function ( $valueObj ) {
				if ( typeof $valueObj === 'string' ) {
					return $valueObj;
				}
				return $valueObj.data;
			} ) );
		};
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

	function createOptionalFieldLayout( widget, option ) {
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
	}

	function prepareNamespaces() {
		var namespaces = mw.config.get( 'wgFormattedNamespaces' );
		// Article namespace has no name by default
		namespaces[ '0' ] = mw.msg( 'advancedSearch-namespaces-articles' );
		$.each( Object.keys( namespaces ), function ( _, key ) {
			if ( parseInt( key, 10 ) < 0 ) {
				delete namespaces[ key ];
			}
		} );
		return namespaces;
	}

	var advancedOptions = [
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
					state,
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
					state,
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
					state,
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
					state,
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
					state,
					{
						optionId: 'filew'
					}
				);
			},
			layout: createOptionalFieldLayout
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
					state,
					{
						optionId: 'fileh'
					}
				);
			},
			layout: createOptionalFieldLayout
		}

		// Ideas for Version 2.0:
		// * Ordering ( prefer-recent:,  boost-templates: )
		// * Meta ( linksto:, neartitle:, morelike: )
	];

	/**
	 * @return {string[]}
	 */
	function formatSearchOptions() {
		var queryElements = [],
			greedyQuery = null;

		advancedOptions.forEach( function ( option ) {
			var val = state.getOption( option.id ),
				formattedQueryElement = val ? option.formatter( val ) : '';

			if ( !formattedQueryElement ) {
				return;
			}

			// FIXME: Should fail if there is more than one greedy option!
			if ( option.greedy && !greedyQuery ) {
				greedyQuery = option.formatter( val );
			} else {
				queryElements.push( formattedQueryElement );
			}

		} );

		if ( greedyQuery ) {
			queryElements.push( greedyQuery );
		}

		return queryElements;
	}

	/**
	 * @return {string}
	 */
	function getSearchOriginal() {
		var searchFieldOriginal = mw.util.getParamValue( 'search' ),
			advancedSearchOriginal = mw.util.getParamValue( 'advancedSearchOption-original' );

		return advancedSearchOriginal === null ? searchFieldOriginal : advancedSearchOriginal;
	}

	var $search = $( 'form#search, form#powersearch' ),
		$advancedSearch = $( '<div>' ).addClass( 'mw-advancedSearch-container' ),
		$searchField = $search.find( 'input[name="search"]' ),
		optionSets = {};

	$search.append( $advancedSearch );

	$searchField.val( getSearchOriginal() );
	$searchField.focus();

	function createWidget( option ) {
		var initializationFunction = option.init ||
			function () {
				return new mw.libs.advancedSearch.ui.TextInput(
					state,
					{
						id: 'advancedSearchOption-' + option.id,
						optionId: option.id
					}
				);
			};

		var widget = initializationFunction();

		if ( !option.customEventHandling ) {
			widget.on( 'change', createMultiSelectChangeHandler( option.id ) );
		}

		return widget;
	}

	function createLayout( widget, option ) {
		if ( option.layout ) {
			return option.layout( widget, option );
		}

		return new OO.ui.FieldLayout(
			widget,
			{
				label: mw.msg( 'advancedsearch-field-' + option.id ),
				align: 'right',
				help: getOptionHelpMessageOrFalse( option )
			}
		);
	}

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
			createLayout( createWidget( option ), option )
		] );
	} );

	var $allOptions = $( '<div>' ).prop( { 'class': 'mw-advancedSearch-fieldContainer' } );

	for ( var group in optionSets ) {
		$allOptions.append( optionSets[ group ].$element );
	}

	var searchPreview = new mw.libs.advancedSearch.ui.SearchPreview( state, {
		label: mw.msg( 'advancedsearch-options-pane-head' ),
		previewOptions: $.map( advancedOptions, function ( option ) {
			return option.id;
		} )
	} );

	var pane = new mw.libs.advancedSearch.ui.ExpandablePane( {
		$paneContent: $allOptions,
		$buttonLabel: searchPreview.$element
	} );
	pane.on( 'change', function () {
		if ( pane.isOpen() ) {
			searchPreview.hidePreview();
		} else {
			searchPreview.showPreview();
		}
	} );
	$advancedSearch.append( pane.$element );

	$search.on( 'submit', function () {
		var compiledQuery = $.trim( $searchField.val() + ' ' + formatSearchOptions().join( ' ' ) ),
			$compiledSearchField = $( '<input>' ).prop( {
				name: $searchField.prop( 'name' ),
				type: 'hidden'
			} ).val( compiledQuery );

		$searchField.prop( 'name', 'advancedSearchOption-original' )
			.after( $compiledSearchField );
	} );

	var currentSearch = new mw.libs.advancedSearch.ui.FormState( state, {
		name: 'advancedSearch-current'
	} );

	$advancedSearch.append( currentSearch.$element );

	var namespaceSelection = new mw.libs.advancedSearch.ui.NamespaceFilters( state, {
			namespaces: prepareNamespaces()
		} ),
		namespacePresets = new mw.libs.advancedSearch.ui.NamespacePresets( state, {
			classes: [ 'mw-advancedSearch-namespacePresets' ],
			presets: {
				all: {
					namespaces: Object.keys( prepareNamespaces() ),
					label: mw.msg( 'advancedSearch-namespaces-preset-all' )
				}
			}
		} ),
		namespaceSelectionPreview = $( '<div class="mw-advancedSearch-namespace-selection"></div>' );

	$advancedSearch.append( namespaceSelectionPreview );
	namespaceSelectionPreview
		.after( namespaceSelection.$element )
		.append( $( '<strong></strong>' ).text( mw.msg( 'advancedSearch-namespaces-search-in' ) ) )
		.append( namespacePresets.$element );

	// remove old namespace selection item to avoid double ns parameters
	$( '#mw-searchoptions' ).remove();

}( mediaWiki, jQuery ) );
