/* eslint-disable no-jquery/no-global-selector */
( function () {
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
			trackingEvent.populateFromStoreOptions( state.getFields() );
			mw.track( 'event.' + trackingEvent.getEventName(), trackingEvent.getEventData() );
		} );
	}

	/**
	 * @desc It is possible for the namespace field to be completely empty
	 and at the same time have the file type option selected.
	 This would lead to an empty search result in most cases,
	 as the default namespaces (which are used when no namespaces are selected) do not contain files.
	 As a courtesy to the user, we're forcefully re-adding the file namespace.
	 When the search result page loads the file namespace will show up in the selected namespace list.
	 * @param {jQuery} $searchField The search fields inside the forms
	 * @param {mw.libs.advancedSearch.dm.SearchModel} state
	 */
	function forceFileTypeNamespaceWhenSearchForFileType( $searchField, state ) {
		if ( state.fileTypeIsSelected() &&
			state.fileNamespaceIsSelected()
		) {
			// Can't call state.setNamespaces with file namespace here,
			// because this function is called inside the onSubmit event
			// and the DOM update from the state change would take too long.
			var $compiledFileType = $( '<input>' ).prop( {
				name: 'ns6',
				type: 'hidden'
			} ).val( '1' );
			$( $searchField ).after( $compiledFileType );
		}
	}

	/**
	 * @param {jQuery} $search The search form element
	 * @param {jQuery} $searchField The search fields inside the forms
	 * @param {mw.libs.advancedSearch.dm.SearchModel} state
	 * @param {mw.libs.advancedSearch.QueryCompiler} queryCompiler
	 */
	function setSearchSubmitTrigger( $search, $searchField, state, queryCompiler ) {
		$search.on( 'submit', function () {
			forceFileTypeNamespaceWhenSearchForFileType( $searchField, state );
			var compiledQuery = ( $searchField.val() + ' ' + queryCompiler.compileSearchQuery( state ) ).trim(),
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
	 * @return {mw.libs.advancedSearch.FieldCollection}
	 */
	function createFieldConfiguration() {
		var fields = new mw.libs.advancedSearch.FieldCollection();
		mw.libs.advancedSearch.addDefaultFields( fields );
		fields.freezeGroups( [ 'text', 'structure', 'files' ] );
		mw.hook( 'advancedSearch.configureFields' ).fire( fields );
		return fields;
	}

	/**
	 * @param {mw.libs.advancedSearch.dm.SearchModel} state
	 * @param {mw.libs.advancedSearch.FieldCollection} fields
	 * @param {mw.libs.advancedSearch.FieldElementBuilder} advancedOptionsBuilder
	 * @return {jQuery}
	 */
	function buildPaneElement( state, fields, advancedOptionsBuilder ) {
		var searchPreview = new mw.libs.advancedSearch.ui.SearchPreview( state, {
			label: mw.msg( 'advancedsearch-options-pane-head' ),
			fieldNames: fields.getFieldIds()
		} );

		var pane = new mw.libs.advancedSearch.ui.ExpandablePane( {
			dependentPaneContentBuilder: function () {
				return advancedOptionsBuilder.buildAllFieldsElement( fields );
			},
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

		// Proactively lazy-load the pane: if the user hasn't already clicked to open the pane,
		// build it in the background.
		mw.requestIdleCallback( function () {
			mw.loader.using( 'ext.advancedSearch.SearchFieldUI' ).then( function () {
				pane.buildDependentPane();
			} );
		} );

		return pane.$element;
	}

	/**
	 * @param {Object} searchableNamespaces
	 * @return {string[]}
	 */
	function getNamespacesFromUrl( searchableNamespaces ) {
		var nsParamRegExp = /[?&]ns(\d+)\b/g,
			nsMatch,
			namespaces = [];
		while ( ( nsMatch = nsParamRegExp.exec( location.href ) ) &&
			nsMatch[ 1 ] in searchableNamespaces
		) {
			namespaces.push( nsMatch[ 1 ] );
		}
		return namespaces;
	}

	/**
	 * @param {mw.libs.advancedSearch.SearchField[]} fields
	 * @return {Object} fieldId => default value pairs
	 */
	function getDefaultsFromConfig( fields ) {
		return fields.reduce( function ( defaults, field ) {
			defaults[ field.id ] = field.defaultValue;
			return defaults;
		}, {} );
	}

	/**
	 * @param {Object} searchableNamespaces
	 * @param {mw.libs.advancedSearch.FieldCollection} fieldCollection
	 * @return {mw.libs.advancedSearch.dm.SearchModel}
	 */
	function initState( searchableNamespaces, fieldCollection ) {
		var state = new mw.libs.advancedSearch.dm.SearchModel(
				mw.libs.advancedSearch.dm.getDefaultNamespaces( mw.user.options.values ),
				getDefaultsFromConfig( fieldCollection.fields )
			),
			namespacesFromUrl = getNamespacesFromUrl( searchableNamespaces ),
			stateFromUrl = mw.util.getParamValue( 'advancedSearch-current' );

		if ( namespacesFromUrl.length ) {
			state.setNamespaces( namespacesFromUrl );
		}

		// If AdvancedSearch has occurred before, it's fields have the highest precedence
		if ( stateFromUrl ) {
			state.setAllFromJSON( stateFromUrl );
		}

		return state;
	}

	$( function () {
		var searchableNamespaces = mw.config.get( 'advancedSearch.searchableNamespaces' ),
			fieldCollection = createFieldConfiguration(),
			state = initState( searchableNamespaces, fieldCollection ),
			advancedOptionsBuilder = new mw.libs.advancedSearch.FieldElementBuilder( state ),
			queryCompiler = new mw.libs.advancedSearch.QueryCompiler( fieldCollection.fields );

		var $search = $( 'form#search, form#powersearch' ),
			$advancedSearch = $( '<div>' ).addClass( 'mw-advancedSearch-container' ),
			$searchField = $search.find( 'input[name="search"]' ),
			$profileField = $search.find( 'input[name="profile"]' );

		$search.append( $advancedSearch );
		$searchField.val( queryCompiler.removeCompiledQueryFromSearch( $searchField.val(), state ) );
		$searchField.trigger( 'focus' );

		$profileField.val( 'advanced' );

		setTrackingEvents( $search, state );
		setSearchSubmitTrigger( $search, $searchField, state, queryCompiler );

		$advancedSearch.append( buildPaneElement( state, fieldCollection, advancedOptionsBuilder ) );

		updateSearchResultLinks( state );

		var currentSearch = new mw.libs.advancedSearch.ui.FormState( state, {
			name: 'advancedSearch-current'
		} );

		$advancedSearch.append( currentSearch.$element );
		var namespaceSelection = new mw.libs.advancedSearch.ui.NamespaceFilters( state, {
				namespaces: searchableNamespaces,
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
			namespaceSelectionPreview = $( '<div>' ).addClass( 'mw-advancedSearch-namespace-selection' ),
			headerContainer = $( '<div>' ).addClass( 'mw-advancedSearch-namespace-selection-header' );

		var namespaceLabel = new OO.ui.LabelWidget( {
			label: mw.msg( 'advancedsearch-namespaces-search-in' ),
			classes: [ 'mw-advancedSearch-namespace-search-in-label' ],
			input: namespaceSelection
		} );
		headerContainer.append( namespaceLabel.$element );

		if ( !mw.user.isAnon() ) {
			var rememberNameSpaceSelection = new OO.ui.FieldLayout( new OO.ui.CheckboxInputWidget( {
				value: mw.user.tokens.get( 'searchnamespaceToken' ),
				name: 'nsRemember'
			} ), { label: mw.msg( 'advancedsearch-namespaces-remember' ), align: 'inline' } );
			headerContainer.append( rememberNameSpaceSelection.$element );
		}
		$advancedSearch.append( namespaceSelectionPreview );
		namespaceSelectionPreview
			.after( namespaceSelection.$element )
			.append( headerContainer )
			.append( namespacePresets.$element );

		$( '.mw-search-spinner' ).hide();

		// remove old namespace selection item to avoid double ns parameters
		$( '#mw-searchoptions' ).remove();

		// TODO this is workaround to fix a toggle true event fired after the DOM is loaded
		setTimeout( function () {
			namespaceSelection.getMenu().toggle( false );
		}, 0 );
	} );

}() );
