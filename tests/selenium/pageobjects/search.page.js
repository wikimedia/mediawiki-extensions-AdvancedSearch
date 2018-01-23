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
	formWasSubmitted() { return browser.getUrl().match( /\?advancedSearchOption-original=/ ) !== null; }
	getSearchURL() {
		let search = browser.getUrl().split( '&' ).filter( function ( part ) {
			return part.match( /^search=/ );
		} );
		return decodeURIComponent( search[ 0 ] );
	}

	open() {
		super.open( 'Special:Search' );
	}

}
module.exports = new SearchPage();
