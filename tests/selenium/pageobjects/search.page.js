'use strict';
const Page = require( '../../../../../tests/selenium/pageobjects/page' );

class SearchPage extends Page {

	get searchContainer() { return browser.element( '.mw-advancedSearch-container' ); }
	get searchTheseWords() { return browser.element( '#advancedSearchOption-plain' ); }
	get searchTheseWordsTagLabel() { return browser.element( '#advancedSearchOption-plain .oo-ui-tagItemWidget > .oo-ui-labelElement-label' ); }
	get searchExactText() { return browser.element( '#advancedSearchOption-phrase input' ); }
	get searchNotTheseWords() { return browser.element( '#advancedSearchOption-not' ); }
	get searchNotTheseWordsTagLabel() { return browser.element( '#advancedSearchOption-not .oo-ui-tagItemWidget > .oo-ui-labelElement-label' ); }
	get searchOneWord() { return browser.element( '#advancedSearchOption-or' ); }
	get searchOneWordTagLabel() { return browser.element( '#advancedSearchOption-or .oo-ui-tagItemWidget > .oo-ui-labelElement-label' ); }
	get searchExpandablePane() { return browser.element( '.mw-advancedSearch-expandablePane' ); }
	get searchPaginationLinks() { return browser.elements( '.mw-search-pager-bottom a' ); }
	get searchPreview() { return browser.element( '.mw-advancedSearch-searchPreview' ); }
	get searchPreviewItems() { return browser.elements( '.mw-advancedSearch-searchPreview .mw-advancedSearch-searchPreview-previewPill' ); }

	formWasSubmitted() { return browser.getUrl().match( /\?advancedSearchOption-original=/ ) !== null; }

	advancedSearchIsCollapsed() {
		return browser.element( '.mw-advancedSearch-expandablePane > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
	}
	get searchInfoIcons() { return browser.elements( '.mw-advancedSearch-container .oo-ui-fieldLayout:not(.oo-ui-element-hidden) .oo-ui-icon-info' ); }
	get infoPopup() { return browser.elements( '.oo-ui-popupWidget-popup' ); }

	get searchTitle() { return browser.element( '#advancedSearchOption-intitle input' ); }
	get searchTemplate() { return browser.element( '#advancedSearchOption-hastemplate input' ); }
	get searchFileType() { return browser.element( '#advancedSearchOption-filetype .oo-ui-indicator-down' ); }
	get searchImageWidth() { return browser.element( '#advancedSearchOption-filew input' ); }
	get searchImageHeight() { return browser.element( '#advancedSearchOption-fileh input' ); }
	get fileTypeImage() { return browser.element( '.mw-advancedSearch-filetype-image-gif' ); }
	get fileTypeAudio() { return browser.element( '.mw-advancedSearch-filetype-audio' ); }
	get searchButton() { return browser.element( '.oo-ui-fieldLayout-body button' ); }
	get namespaceTags() { return browser.elements( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-group span' ); }
	get multiSelectAll() { return browser.element( '.mw-advancedSearch-namespace-selection input' ); }
	get namespaceOptionsInMenu() { return browser.elements( '.mw-advancedSearch-namespaceFilter .oo-ui-menuSelectWidget[role="listbox"] > div > span:nth-child(2)' ); }
	get namespacesExpandablePane() { return browser.element( '.oo-ui-menuTagMultiselectWidget .oo-ui-indicator-down' ); }
	get fileNamespaceTag() { return browser.element( '.oo-ui-menuSelectWidget .mw-advancedSearch-namespace-6' ); }
	get dropdownNamespaceTags() { return browser.elements( '.oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]' ); }
	get fileNamespaceTagClose() {
		return browser.element( '.oo-ui-tagMultiselectWidget-group > div:nth-child(7) > span:nth-child(2)' );
	}

	getSearchURL() {
		let search = browser.getUrl().split( '&' ).filter( function ( part ) {
			return part.match( /^search=/ );
		} );
		return decodeURIComponent( search[ 0 ] );
	}

	getInfoPopupContent( popup ) {
		return popup.element( 'dl' );
	}

	getAllNamespaceNames() {
		let namespaces = this.namespaceOptionsInMenu.value.reduce(
			function ( acc, tag ) {
				acc.push( tag.getText() );
				return acc;
			},
			[] );
		return namespaces;
	}

	getDisabledNamespaceNames() {
		let disabledNamespaces = this.namespaceOptionsInMenu.value.reduce(
			function ( acc, tag ) {
				if ( tag.isEnabled() ) {
					acc.push( tag.getText() );
				}
				return acc;
			}, [] );
		return disabledNamespaces;
	}

	open() {
		super.open( 'Special:Search' );
		this.waitForAdvancedSearchToLoad();
	}

	waitForAdvancedSearchToLoad() {
		browser.waitForVisible( '.mw-advancedSearch-container', 5000 );
	}

	submitForm() {
		browser.element( '#mw-search-top-table button' ).click();
		this.waitForAdvancedSearchToLoad();
	}

	toggleInputFields() {
		browser.element( '.mw-advancedSearch-expandablePane-button .oo-ui-indicatorElement-indicator' ).click();
	}
}
module.exports = new SearchPage();
