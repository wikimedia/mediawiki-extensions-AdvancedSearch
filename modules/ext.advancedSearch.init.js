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
	 * @param {jQuery} $search The search form element
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
	 * @param {jQuery} $search The search form element
	 * @param {jQuery} $searchField The search fields inside the forms
	 * @param {mw.libs.advancedSearch.dm.SearchModel} state
	 * @param {mw.libs.advancedSearch.QueryCompiler} queryCompiler
	 */
	function setSearchSubmitTrigger( $search, $searchField, state, queryCompiler ) {
		$search.on( 'submit', function () {
			var compiledQuery = $.trim( $searchField.val() + ' ' + queryCompiler.compileSearchQuery( state ) ),
				$compiledSearchField = $( '<input>' ).prop( {
					name: $searchField.prop( 'name' ),
					type: 'hidden'
				} ).val( compiledQuery );

			$searchField.prop( 'name', '' )
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
	 * @param {object} allowedNamespaces Object returned from SearchableNamespaces.getNamespaces
	 * @return {string[]}
	 */
	function getNamespacesFromUrl( allowedNamespaces ) {
		var url = new mw.Uri(),
			namespaces = [];
		$.each( url.query, function ( param ) {
			var nsMatch = param.match( /^ns(\d+)$/ );
			if ( nsMatch && nsMatch[ 1 ] in allowedNamespaces ) {
				namespaces.push( nsMatch[ 1 ] );
			}
		} );
		return namespaces;
	}

	/**
	 * @param {mw.libs.advancedSearch.dm.SearchableNamespaces} searchableNamespaces
	 * @return {mw.libs.advancedSearch.dm.SearchModel}
	 */
	function initState( searchableNamespaces ) {
		var state = new mw.libs.advancedSearch.dm.SearchModel(
				mw.libs.advancedSearch.dm.getDefaultNamespaces( mw.user.options.values )
			),
			namespacesFromUrl = getNamespacesFromUrl( searchableNamespaces.getNamespaces() ),
			stateFromUrl = mw.util.getParamValue( 'advancedSearch-current' );

		if ( namespacesFromUrl.length ) {
			state.setNamespaces( namespacesFromUrl );
		}

		// If AdvancedSearch has occurred before, it's options have the highest precedence
		if ( stateFromUrl ) {
			state.setAllFromJSON( stateFromUrl );
		}

		return state;
	}

	$( function () {
		var searchableNamespaces = new mw.libs.advancedSearch.dm.SearchableNamespaces( mw.config.get( 'wgFormattedNamespaces' ) ),
			state = initState( searchableNamespaces ),
			advancedOptionsBuilder = new mw.libs.advancedSearch.AdvancedOptionsBuilder( state ),
			queryCompiler = new mw.libs.advancedSearch.QueryCompiler( advancedOptionsBuilder.getOptions() );

		var $search = $( 'form#search, form#powersearch' ),
			$title = $( 'h1#firstHeading' ),
			$advancedSearch = $( '<div>' ).addClass( 'mw-advancedSearch-container' ),
			$searchField = $search.find( 'input[name="search"]' ),
			$profileField = $search.find( 'input[name="profile"]' );

		var feedbackMessage = mw.message( 'advancedsearch-ask-feedback', 'https://www.mediawiki.org/wiki/Help_talk:Extension:AdvancedSearch' ).parse();

		$search.append( $advancedSearch );
		$title.after( '<span class="feedback">' + feedbackMessage + '</span>' );
		$( '.feedback a' ).attr( 'target', '_blank' );
		$searchField.val( queryCompiler.removeCompiledQueryFromSearch( $searchField.val(), state ) );
		$searchField.focus();

		$profileField.val( 'advanced' );

		setTrackingEvents( $search, state );
		setSearchSubmitTrigger( $search, $searchField, state, queryCompiler );

		$advancedSearch.append( buildPaneElement( state, advancedOptionsBuilder ) );

		updateSearchResultLinks( state );

		var currentSearch = new mw.libs.advancedSearch.ui.FormState( state, {
			name: 'advancedSearch-current'
		} );

		$advancedSearch.append( currentSearch.$element );
		var namespaceSelection = new mw.libs.advancedSearch.ui.NamespaceFilters( state, {
				namespaces: searchableNamespaces.getNamespaces(),
				placeholder: mw.msg( 'advancedsearch-namespaces-placeholder' ),
				$overlay: true
			} ),
			namespacePresets = new mw.libs.advancedSearch.ui.NamespacePresets(
				state,
				new mw.libs.advancedSearch.dm.NamespacePresetProviders( searchableNamespaces ),
				{
					classes: [ 'mw-advancedSearch-namespacePresets' ],
					presets: mw.config.get( 'advancedSearch.namespacePresets' )
				}
			),
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
