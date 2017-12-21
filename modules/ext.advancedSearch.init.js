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

	if ( mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Search' ) {
		return;
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

	/**
	 * @param {ext.libs.advancedSearch.dm.SearchModel} state
	 * @param {Array.<Object>} advancedOptions
	 * @return {string[]}
	 */
	function formatSearchOptions( state, advancedOptions ) {
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

	function setTrackingEvents( $search, state ) {
		$search.on( 'submit', function () {
			var trackingEvent = new mw.libs.advancedSearch.dm.trackingEvents.SearchRequest();
			trackingEvent.populateFromStoreOptions( state.getOptions() );
			mw.track( 'event.' + trackingEvent.getEventName(), trackingEvent.getEventData() );
		} );
	}

	function setSearchSubmitTrigger( $search, $searchField, state, advancedOptionsBuilder ) {
		$search.on( 'submit', function () {
			var compiledQuery = $.trim( $searchField.val() + ' ' + formatSearchOptions( state, advancedOptionsBuilder.getOptions() ).join( ' ' ) ),
				$compiledSearchField = $( '<input>' ).prop( {
					name: $searchField.prop( 'name' ),
					type: 'hidden'
				} ).val( compiledQuery );

			$searchField.prop( 'name', 'advancedSearchOption-original' )
				.after( $compiledSearchField );
		} );
	}

	function updateSearchResultLinks( currentState ) {
		$( '.mw-prevlink, .mw-nextlink, .mw-numlink' ).attr( 'href', function ( i, href ) {
			return href + '&advancedSearch-current=' + currentState.toJSON();
		} );
	}

	function buildPaneElement( state, advancedOptionsBuilder ) {
		var searchPreview = new mw.libs.advancedSearch.ui.SearchPreview( state, {
			label: mw.msg( 'advancedsearch-options-pane-head' ),
			previewOptions: $.map( advancedOptionsBuilder.getOptions(), function ( option ) {
				return option.id;
			} )
		} );

		var pane = new mw.libs.advancedSearch.ui.ExpandablePane( {
			$paneContent: advancedOptionsBuilder.buildAllOptionsElement(),
			$buttonLabel: searchPreview.$element,
			tabIndex: 0
		} );
		pane.on( 'change', function () {
			if ( pane.isOpen() ) {
				searchPreview.hidePreview();
			} else {
				searchPreview.showPreview();
			}
		} );

		return pane.$element;
	}

	function initState() {
		var state = new mw.libs.advancedSearch.dm.SearchModel();
		state.setAllFromJSON( mw.util.getParamValue( 'advancedSearch-current' ) || '' );

		return state;
	}

	var state = initState(),
		advancedOptionsBuilder = new mw.libs.advancedSearch.AdvancedOptionsBuilder( state );

	var $search = $( 'form#search, form#powersearch' ),
		$advancedSearch = $( '<div>' ).addClass( 'mw-advancedSearch-container' ),
		$searchField = $search.find( 'input[name="search"]' ),
		$profileField = $search.find( 'input[name="profile"]' );

	$search.append( $advancedSearch );

	$searchField.val( getSearchOriginal() );
	$searchField.focus();

	$profileField.val( 'advanced' );

	setTrackingEvents( $search, state );
	setSearchSubmitTrigger( $search, $searchField, state, advancedOptionsBuilder );

	$advancedSearch.append( buildPaneElement( state, advancedOptionsBuilder ) );

	updateSearchResultLinks( state );

	var currentSearch = new mw.libs.advancedSearch.ui.FormState( state, {
		name: 'advancedSearch-current'
	} );

	$advancedSearch.append( currentSearch.$element );

	var namespaceSelection = new mw.libs.advancedSearch.ui.NamespaceFilters( state, {
			namespaces: prepareNamespaces(),
			placeholder: mw.msg( 'advancedSearch-namespaces-placeholder' )
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
		namespaceSelectionPreview = $( '<div>' ).addClass( 'mw-advancedSearch-namespace-selection' );

	$advancedSearch.append( namespaceSelectionPreview );
	namespaceSelectionPreview
		.after( namespaceSelection.$element )
		.append( $( '<strong>' ).text( mw.msg( 'advancedSearch-namespaces-search-in' ) ) )
		.append( namespacePresets.$element );

	// remove old namespace selection item to avoid double ns parameters
	$( '#mw-searchoptions' ).remove();

}( mediaWiki, jQuery ) );
