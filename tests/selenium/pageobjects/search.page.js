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
	get searchExpandablePane() { return browser.element( '.mw-advancedSearch-expandablePane-button' ); }
	get searchPreview() { return browser.element( '.mw-advancedSearch-searchPreview' ); }
	get searchPreviewItems() { return browser.elements( '.mw-advancedSearch-searchPreview .mw-advancedSearch-searchPreview-previewPill' ); }

	formWasSubmitted() { return browser.getUrl().match( /\?advancedSearchOption-original=/ ) !== null; }

	advancedSearchIsCollapsed() {
		return browser.element( '.mw-advancedSearch-expandablePane > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
	}

	getSearchURL() {
		let search = browser.getUrl().split( '&' ).filter( function ( part ) {
			return part.match( /^search=/ );
		} );
		return decodeURIComponent( search[ 0 ] );
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
}
module.exports = new SearchPage();
