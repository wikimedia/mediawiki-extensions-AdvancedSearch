( function ( mw, $ ) {
	'use strict';

	/**
	 * @return {boolean}
	 */
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

	/**
	 * @return {Object}
	 */
	function prepareNamespaces() {
		var rawNamespaces = mw.config.get( 'wgFormattedNamespaces' ),
			namespaces = {};
		// Article namespace has no name by default
		$.each( Object.keys( rawNamespaces ), function ( _, key ) {
			if ( parseInt( key, 10 ) >= 0 ) {
				namespaces[ key ] = rawNamespaces[ key ];
			}
		} );
		namespaces[ '0' ] = mw.msg( 'advancedsearch-namespaces-articles' );
		return namespaces;
	}

	/**
	 * @param {ext.libs.advancedSearch.dm.SearchModel} state
	 * @param {Object[]} advancedOptions
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

	/**
	 * @param {jQuery} $search
	 * @param {mw.libs.advancedSearch.dm.SearchModel} state
	 */
	function setTrackingEvents( $search, state ) {
		$search.on( 'submit', function () {
			var trackingEvent = new mw.libs.advancedSearch.dm.trackingEvents.SearchRequest();
			trackingEvent.populateFromStoreOptions( state.getOptions() );
			mw.track( 'event.' + trackingEvent.getEventName(), trackingEvent.getEventData() );
		} );
	}

	/**
	 * @param {jQuery} $search
	 * @param {jQuery} $searchField
	 * @param {mw.libs.advancedSearch.dm.SearchModel} state
	 * @param {mw.libs.advancedSearch.AdvancedOptionsBuilder} advancedOptionsBuilder
	 */
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

	/**
	 * @param {mw.libs.advancedSearch.dm.SearchModel} currentState
	 */
	function updateSearchResultLinks( currentState ) {
		$( '.mw-prevlink, .mw-nextlink, .mw-numlink' ).attr( 'href', function ( i, href ) {
			return href + '&advancedSearch-current=' + currentState.toJSON();
		} );
	}

	/**
	 * @param {mw.libs.advancedSearch.dm.SearchModel} state
	 * @param {mw.libs.advancedSearch.AdvancedOptionsBuilder} advancedOptionsBuilder
	 * @return {jQuery}
	 */
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

	/**
	 * @return {string[]}
	 */
	function getNamespacesFromUrl() {
		var url = new mw.Uri(),
			namespaces = [],
			allowedNamespaces = Object.keys( prepareNamespaces() );
		$.each( url.query, function ( param ) {
			var nsMatch = param.match( /^ns(\d+)$/ );
			if ( nsMatch ) {
				namespaces.push( nsMatch[ 1 ] );
			}
		} );
		return namespaces.filter( function ( id ) {
			return allowedNamespaces.indexOf( id ) !== -1;
		} );
	}

	/**
	 * @return {mw.libs.advancedSearch.dm.SearchModel}
	 */
	function initState() {
		var state = new mw.libs.advancedSearch.dm.SearchModel(
				mw.libs.advancedSearch.dm.getDefaultNamespaces( mw.user.options.values )
			),
			stateFromUrl = mw.util.getParamValue( 'advancedSearch-current' ),
			namespacesInUrl = getNamespacesFromUrl();
		state.setAllFromJSON( stateFromUrl || '' );
		// allow URL params to define selected namespaces when no AdvancedSearch has occurred before
		if ( !stateFromUrl && namespacesInUrl.length > 0 ) {
			state.setNamespaces( namespacesInUrl );
		}

		return state;
	}

	$( function () {
		var state = initState(),
			advancedOptionsBuilder = new mw.libs.advancedSearch.AdvancedOptionsBuilder( state );

		var $search = $( 'form#search, form#powersearch' ),
			$title = $( 'h1#firstHeading' ),
			$advancedSearch = $( '<div>' ).addClass( 'mw-advancedSearch-container' ),
			$searchField = $search.find( 'input[name="search"]' ),
			$profileField = $search.find( 'input[name="profile"]' );

		var feedbackMessage = mw.message( 'advancedsearch-ask-feedback', 'https://www.mediawiki.org/wiki/Help_talk:Extension:AdvancedSearch' ).parse();

		$search.append( $advancedSearch );
		$title.after( '<span class="feedback">' + feedbackMessage + '</span>' );
		$( '.feedback a' ).attr( 'target', '_blank' );
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
				placeholder: mw.msg( 'advancedsearch-namespaces-placeholder' ),
				$overlay: true
			} ),
			namespacePresets = new mw.libs.advancedSearch.ui.NamespacePresets( state, {
				classes: [ 'mw-advancedSearch-namespacePresets' ],
				presets: mw.config.get( 'advancedSearch.namespacePresets' )
			} ),
			namespaceSelectionPreview = $( '<div>' ).addClass( 'mw-advancedSearch-namespace-selection' );

		$advancedSearch.append( namespaceSelectionPreview );
		namespaceSelectionPreview
			.after( namespaceSelection.$element )
			.append( $( '<strong>' ).text( mw.msg( 'advancedsearch-namespaces-search-in' ) ) )
			.append( namespacePresets.$element );

		// remove old namespace selection item to avoid double ns parameters
		$( '#mw-searchoptions' ).remove();

		// TODO this is workaround to fix a toggle true event fired after the DOM is loaded
		setTimeout( function () {
			namespaceSelection.getMenu().toggle( false );
		}, 0 );
	} );

}( mediaWiki, jQuery ) );
