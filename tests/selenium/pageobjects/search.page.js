'use strict';
const Page = require( 'wdio-mediawiki/Page' );
const url = require( 'url' );

class TextInputField {
	constructor( selector ) {
		this.selector = selector;
	}

	put( content ) {
		$( this.selector + ' input' ).setValue( content );
	}

	getPlaceholderText() {
		return $( this.selector + ' input' ).getAttribute( 'placeholder' ) || '';
	}

	isDisplayed() {
		return $( this.selector + ' input' ).isDisplayed();
	}
}

class PillField {
	constructor( selector ) {
		this.selector = selector;
	}

	put( content ) {
		$( this.selector ).click();
		browser.keys( content );
	}

	getPlaceholderText() {
		return $( this.selector + ' input' ).getAttribute( 'placeholder' ) || '';
	}

	getTagLabels() {
		return $$( this.selector + ' .oo-ui-tagItemWidget > .oo-ui-labelElement-label' ).map( ( elem ) => elem.getText() );
	}
}

class DropdownField {
	constructor( selector ) {
		this.selector = selector;
	}

	choose( fieldName ) {
		const fieldElement = $( '.mw-advancedSearch-inlanguage-' + fieldName );
		$( this.selector ).click(); // open inlanguage dropdown
		browser.execute( 'arguments[0].scrollIntoView(true);', fieldElement ); // scroll to the option to get it into view
		fieldElement.click();
	}

	isDisplayed() {
		return $( this.selector ).isDisplayed();
	}
}

class SearchPage extends Page {

	constructor() {
		super();

		this.searchTheseWords = new PillField( '#advancedSearchField-plain' );
		this.searchExactText = new TextInputField( '#advancedSearchField-phrase' );
		this.searchNotTheseWords = new PillField( '#advancedSearchField-not' );
		this.searchOneWord = new PillField( '#advancedSearchField-or' );

		this.searchTitle = new TextInputField( '#advancedSearchField-intitle' );
		this.searchSubpageof = new TextInputField( '#advancedSearchField-subpageof' );
		this.searchCategory = new PillField( '#advancedSearchField-deepcategory' );
		this.searchTemplate = new PillField( '#advancedSearchField-hastemplate' );
		this.searchInLanguage = new DropdownField( '#advancedSearchField-inlanguage' );

		this.searchImageWidth = new TextInputField( '#advancedSearchField-filew' );
		this.searchImageHeight = new TextInputField( '#advancedSearchField-fileh' );

	}

	get FILE_NAMESPACE() { return '6'; }

	get searchContainer() { return $( '.mw-advancedSearch-container' ); }

	get searchFileType() {
		return {
			selectImageType: function () {
				$( '#advancedSearchField-filetype .oo-ui-dropdownWidget-handle' ).click();
				$( '.mw-advancedSearch-filetype-image-gif' ).click();
			},
			selectAudioType: function () {
				$( '#advancedSearchField-filetype .oo-ui-dropdownWidget-handle' ).click();
				$( '.mw-advancedSearch-filetype-audio' ).click();
			}
		};
	}
	get namespaces() {
		return {
			removeFileNamespace: function () {
				$( '.mw-advancedSearch-namespaceFilter .mw-advancedSearch-namespace-6 .oo-ui-buttonWidget' ).click();
			},
			selectAll: function () {
				$$( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]:not(.oo-ui-optionWidget-selected)' )
					.forEach( ( element ) => {
						browser.execute( 'arguments[0].scrollIntoView(true);', element );
						element.waitForDisplayed();
						element.click();
					} );
				browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
			},
			toggleNamespacesMenu() {
				$( '.mw-advancedSearch-namespaceFilter .oo-ui-inputWidget-input' ).click();
			},
			toggleNamespacesPreview() {
				$( '.mw-advancedSearch-expandablePane-namespaces .mw-advancedSearch-expandablePane-button a' ).click();
			},
			clickOnNamespace: function ( nsId ) {
				const menuItem = $( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget .mw-advancedSearch-namespace-' + nsId );
				menuItem.waitForDisplayed();
				menuItem.click();
			},
			getAllLabelsFromMenu: function () {
				const labels = $$( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]' ).map(
					( el ) => el.$( '.oo-ui-labelElement-label' ).getText()
				);
				browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
				return labels;
			},
			getAllLabelsForDisabledItemsInMenu: function () {
				// open the menu to insert the items in the DOM
				$( '.mw-advancedSearch-namespaceFilter .oo-ui-inputWidget-input' ).click();
				const labels = $$( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]' ).reduce(
					( acc, element ) => {
						if ( element.getAttribute( 'aria-disabled' ) === 'true' ) {
							acc.push( element.getText() );
						}
						return acc;
					},
					[]
				);
				browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
				return labels;
			},
			getAllTagLabels: function () {
				return $$( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-content div[class^="mw-advancedSearch-namespace-"]' ).map(
					( element ) => { return element.getText(); }
				);
			}
		};
	}
	get searchPaginationLink() { return $( '.mw-search-pager-bottom a' ); }
	get searchPaginationLinks() { return $$( '.mw-search-pager-bottom a' ); }
	get searchPreviewItem() { return $( '.mw-advancedSearch-searchPreview .mw-advancedSearch-searchPreview-previewPill' ); }
	get searchPreviewItems() { return $$( '.mw-advancedSearch-searchPreview .mw-advancedSearch-searchPreview-previewPill' ); }
	get namespacePreviewItems() { return $( '.mw-advancedSearch-namespacesPreview .mw-advancedSearch-namespacesPreview-previewPill' ); }
	get searchInfoIcon() { return $( '.mw-advancedSearch-container .oo-ui-fieldLayout .oo-ui-buttonElement-button' ); }
	get searchInfoIcons() { return $$( '.mw-advancedSearch-container .oo-ui-fieldLayout .oo-ui-buttonElement-button' ); }
	get infoPopup() { return $$( '.oo-ui-popupWidget-popup' ); }
	get searchButton() { return $( '#mw-search-top-table button' ); }
	get namespaceTags() { return $$( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-group span' ); }
	get namespaceTagsInCollapsedMode() { return $$( '.mw-advancedSearch-namespacesPreview .mw-advancedSearch-namespacesPreview-previewPill .oo-ui-labelElement-label span' ); }
	get allNamespacesPreset() { return $( '.mw-advancedSearch-namespace-selection input[value="all"]' ); }
	get generalHelpPreset() { return $( '.mw-advancedSearch-namespace-selection input[value="generalHelp"]' ); }
	get rememberSelection() { return $( '.mw-advancedSearch-namespace-selection input[name="nsRemember"]' ); }
	get default() { return $( '.mw-advancedSearch-namespace-selection input[value="defaultNamespaces"]' ); }
	get categorySuggestionsBox() { return $( '.mw-advancedSearch-deepCategory div[role="listbox"]' ); }
	get templateSuggestionsBox() { return $( '.mw-advancedSearch-template div[role="listbox"]' ); }
	get inputIcon() { return $( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-input .oo-ui-iconElement-icon' ); }
	get logOut() { return $( '#pt-logout a' ); }

	formWasSubmitted() {
		return Object.prototype.hasOwnProperty.call( this.getQueryFromUrl(), 'advancedSearch-current' );
	}

	advancedSearchIsCollapsed() {
		return $( '.mw-advancedSearch-expandablePane-options > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
	}

	namespacePreviewIsCollapsed() {
		return $( '.mw-advancedSearch-expandablePane-namespaces > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
	}

	getSearchQueryFromUrl() {
		return this.getQueryFromUrl().search;
	}

	getQueryFromUrl() {
		return url.parse( browser.getUrl(), true ).query;
	}

	getInfoPopupContent( popup ) {
		return popup.$( 'dl' );
	}

	getSelectedNamespaceIDs() {
		return $$( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-group .oo-ui-tagItemWidget' ).reduce( ( acc, widget ) => {
			const widgetClass = widget.getAttribute( 'class' );
			if ( !widgetClass ) {
				return acc;
			}
			const classMatches = widgetClass.match( /(?:^| )mw-advancedSearch-namespace-(\d+)(?:$| )/ );
			if ( classMatches ) {
				acc.push( classMatches[ 1 ] );
			}
			return acc;
		}, [] );
	}

	getCategoryPillLink( category ) {
		return $( '.oo-ui-tagMultiselectWidget-group a[title^="Category:' + category + '"]' );
	}

	getTemplatePillLink( template ) {
		return $( '.oo-ui-tagMultiselectWidget-group a[title="Template:' + template + '"]' );
	}

	open( params ) {
		const pageName = 'Special:Search';
		super.openTitle( pageName, params );
		this.waitForAdvancedSearchToLoad();
	}

	waitForAdvancedSearchToLoad() {
		$( '.mw-advancedSearch-container' ).waitForDisplayed( 5000 );
	}

	submitForm() {
		this.searchButton.click();
		this.waitForAdvancedSearchToLoad();
	}

	toggleInputFields() {
		$( '.mw-advancedSearch-expandablePane-options .mw-advancedSearch-expandablePane-button a' ).click();
		this.waitForSearchFieldsToLoad();
	}

	waitForSearchFieldsToLoad() {
		// Wait for the last search field to be visible as an indicator that all search field widgets have been built
		$( '#advancedSearchField-filetype' ).waitForExist( 5000 );
	}
}
module.exports = new SearchPage();
