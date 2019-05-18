'use strict';
const Page = require( 'wdio-mediawiki/Page' );
const url = require( 'url' );

class TextInputField {
	constructor( selector ) {
		this.selector = selector;
	}

	put( content ) {
		browser.element( this.selector + ' input' ).setValue( content );
	}

	getPlaceholderText() {
		return browser.element( this.selector + ' input' ).getAttribute( 'placeholder' ) || '';
	}

	isVisible() {
		return browser.element( this.selector + ' input' ).isVisible();
	}
}

class PillField {
	constructor( selector ) {
		this.selector = selector;
	}

	put( content ) {
		browser.element( this.selector ).click();
		browser.keys( content );
	}

	getPlaceholderText() {
		return browser.element( this.selector + ' input' ).getAttribute( 'placeholder' ) || '';
	}

	getTagLabels() {
		return browser.elements( this.selector + ' .oo-ui-tagItemWidget > .oo-ui-labelElement-label' ).value.map( ( elem ) => elem.getText() );
	}
}

class DropdownField {
	constructor( selector ) {
		this.selector = selector;
	}

	choose( fieldName ) {
		let fieldElement = browser.element( '.mw-advancedSearch-inlanguage-' + fieldName );
		browser.element( this.selector ).click(); // open inlanguage dropdown
		browser.execute( 'arguments[0].scrollIntoView(true);', fieldElement.value ); // scroll to the option to get it into view
		fieldElement.click();
	}

	isVisible() {
		return browser.element( this.selector ).isVisible();
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

	get searchContainer() { return browser.element( '.mw-advancedSearch-container' ); }

	get searchFileType() {
		return {
			selectImageType: function () {
				browser.element( '#advancedSearchField-filetype .oo-ui-dropdownWidget-handle' ).click();
				browser.element( '.mw-advancedSearch-filetype-image-gif' ).click();
			},
			selectAudioType: function () {
				browser.element( '#advancedSearchField-filetype .oo-ui-dropdownWidget-handle' ).click();
				browser.element( '.mw-advancedSearch-filetype-audio' ).click();
			}
		};
	}
	get namespaces() {
		return {
			removeFileNamespace: function () {
				browser.element( '.mw-advancedSearch-namespaceFilter .mw-advancedSearch-namespace-6 .oo-ui-buttonWidget' ).click();
			},
			selectAll: function () {
				browser.elements( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]:not(.oo-ui-optionWidget-selected)' )
					.value.forEach( ( element ) => {
						browser.execute( 'arguments[0].scrollIntoView(true);', element );
						element.waitForVisible();
						element.click();
					} );
				browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
			},
			toggleNamespacesMenu() {
				browser.element( '.mw-advancedSearch-namespaceFilter .oo-ui-inputWidget-input' ).click();
			},
			toggleNamespacesPreview() {
				browser.element( '.mw-advancedSearch-expandablePane-namespaces .mw-advancedSearch-expandablePane-button a' ).click();
			},
			clickOnNamespace: function ( nsId ) {
				const menuItem = browser.element( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget .mw-advancedSearch-namespace-' + nsId );
				menuItem.waitForVisible();
				menuItem.click();
			},
			getAllLabelsFromMenu: function () {
				const labels = browser.elements( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]' )
					.value.map(
						( el ) => el.element( '.oo-ui-labelElement-label' ).getText()
					);
				browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
				return labels;
			},
			getAllLabelsForDisabledItemsInMenu: function () {
				// open the menu to insert the items in the DOM
				browser.element( '.mw-advancedSearch-namespaceFilter .oo-ui-inputWidget-input' ).click();
				const labels = browser.elements( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]' ).value.reduce(
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
				return browser.elements( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-content div[class^="mw-advancedSearch-namespace-"]' ).value.map(
					( element ) => { return element.getText(); }
				);
			}
		};
	}
	get searchPaginationLinks() { return browser.elements( '.mw-search-pager-bottom a' ); }
	get searchPreviewItems() { return browser.elements( '.mw-advancedSearch-searchPreview .mw-advancedSearch-searchPreview-previewPill' ); }
	get namespacePreviewItems() { return browser.elements( '.mw-advancedSearch-namespacesPreview .mw-advancedSearch-namespacesPreview-previewPill' ); }
	get searchInfoIcons() { return browser.elements( '.mw-advancedSearch-container .oo-ui-fieldLayout:not(.oo-ui-element-hidden) .oo-ui-buttonElement-button' ); }
	get infoPopup() { return browser.elements( '.oo-ui-popupWidget-popup' ); }
	get searchButton() { return browser.element( '#mw-search-top-table button' ); }
	get namespaceTags() { return browser.elements( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-group span' ); }
	get namespaceTagsInCollapsedMode() { return browser.elements( '.mw-advancedSearch-namespacesPreview .mw-advancedSearch-namespacesPreview-previewPill .oo-ui-labelElement-label span' ); }
	get allNamespacesPreset() { return browser.element( '.mw-advancedSearch-namespace-selection input[value="all"]' ); }
	get generalHelpPreset() { return browser.element( '.mw-advancedSearch-namespace-selection input[value="generalHelp"]' ); }
	get rememberSelection() { return browser.element( '.mw-advancedSearch-namespace-selection input[name="nsRemember"]' ); }
	get default() { return browser.element( '.mw-advancedSearch-namespace-selection input[value="defaultNamespaces"]' ); }
	get categorySuggestionsBox() { return browser.element( '.mw-advancedSearch-deepCategory div[role="listbox"]' ); }
	get templateSuggestionsBox() { return browser.element( '.mw-advancedSearch-template div[role="listbox"]' ); }
	get inputIcon() { return browser.element( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-input .oo-ui-iconElement-icon' ); }
	get logOut() { return browser.element( '#pt-logout a' ); }

	formWasSubmitted() {
		return Object.prototype.hasOwnProperty.call( this.getQueryFromUrl(), 'advancedSearch-current' );
	}

	advancedSearchIsCollapsed() {
		return browser.element( '.mw-advancedSearch-expandablePane-options > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
	}

	namespacePreviewIsCollapsed() {
		return browser.element( '.mw-advancedSearch-expandablePane-namespaces > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
	}

	getSearchQueryFromUrl() {
		return this.getQueryFromUrl().search;
	}

	getQueryFromUrl() {
		return url.parse( browser.getUrl(), true ).query;
	}

	getInfoPopupContent( popup ) {
		return popup.element( 'dl' );
	}

	getSelectedNamespaceIDs() {
		return browser.elements( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-group .oo-ui-tagItemWidget' ).value.reduce( ( acc, widget ) => {
			const widgetClass = widget.getAttribute( 'class' );
			let classMatches;
			if ( !widgetClass ) {
				return acc;
			}
			classMatches = widgetClass.match( /(?:^| )mw-advancedSearch-namespace-(\d+)(?:$| )/ );
			if ( classMatches ) {
				acc.push( classMatches[ 1 ] );
			}
			return acc;
		}, [] );
	}

	getCategoryPillLink( category ) {
		return browser.elements( '.oo-ui-tagMultiselectWidget-group a[title^="Category:' + category + '"]' );
	}

	getTemplatePillLink( template ) {
		return browser.elements( '.oo-ui-tagMultiselectWidget-group a[title="Template:' + template + '"]' );
	}

	open( params ) {
		let pageName = 'Special:Search';
		super.openTitle( pageName, params );
		this.waitForAdvancedSearchToLoad();
	}

	waitForAdvancedSearchToLoad() {
		browser.waitForVisible( '.mw-advancedSearch-container', 5000 );
	}

	submitForm() {
		this.searchButton.click();
		this.waitForAdvancedSearchToLoad();
	}

	toggleInputFields() {
		browser.element( '.mw-advancedSearch-expandablePane-options .mw-advancedSearch-expandablePane-button a' ).click();
		this.waitForSearchFieldsToLoad();
	}

	waitForSearchFieldsToLoad() {
		// Wait for the last search field to be visible as an indicator that all search field widgets have been built
		browser.waitForExist( '#advancedSearchField-filetype', 5000 );
	}
}
module.exports = new SearchPage();
