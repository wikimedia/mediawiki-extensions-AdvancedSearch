'use strict';
const Page = require( '../../../../../tests/selenium/pageobjects/page' );
const url = require( 'url' );
const querystring = require( 'querystring' );

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

class SearchPage extends Page {

	constructor() {
		super();
		this.searchTheseWords = new PillField( '#advancedSearchOption-plain' );
		this.searchExactText = new TextInputField( '#advancedSearchOption-phrase' );
		this.searchNotTheseWords = new PillField( '#advancedSearchOption-not' );
		this.searchOneWord = new PillField( '#advancedSearchOption-or' );

		this.searchTitle = new TextInputField( '#advancedSearchOption-intitle' );
		this.searchTemplate = new PillField( '#advancedSearchOption-hastemplate' );
		this.searchSubpageof = new TextInputField( '#advancedSearchOption-subpageof' );

		this.searchImageWidth = new TextInputField( '#advancedSearchOption-filew' );
		this.searchImageHeight = new TextInputField( '#advancedSearchOption-fileh' );
	}

	get searchContainer() { return browser.element( '.mw-advancedSearch-container' ); }

	get searchFileType() {
		return {
			selectImageType: function () {
				browser.element( '#advancedSearchOption-filetype .oo-ui-indicator-down' ).click();
				browser.element( '.mw-advancedSearch-filetype-image-gif' ).click();
			},
			selectAudioType: function () {
				browser.element( '#advancedSearchOption-filetype .oo-ui-indicator-down' ).click();
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
				// open the menu
				browser.element( '.mw-advancedSearch-namespaceFilter .oo-ui-indicator-down' ).click();
				const menuItems = browser.elements( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"] .oo-ui-labelElement-label' ).value;
				const FIRST_UNSELECTED_NAMESPACE_ITEM = 1;
				for ( let i = FIRST_UNSELECTED_NAMESPACE_ITEM; i < menuItems.length; i++ ) {
					browser.execute( 'arguments[0].scrollIntoView(true);', menuItems[ i ] );
					menuItems[ i ].click();
				}
				browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
			},
			getAllLabelsFromMenu: function () {
				// open the menu to insert the items in the DOM
				browser.element( '.mw-advancedSearch-namespaceFilter .oo-ui-indicator-down' ).click();
				const labels = browser.elements( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]' ).value.map(
					( element ) => {
						return element.getText();
					}
				);
				browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
				return labels;
			},
			getAllLabelsForDisabledItemsInMenu: function () {
				// open the menu to insert the items in the DOM
				browser.element( '.mw-advancedSearch-namespaceFilter .oo-ui-indicator-down' ).click();
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
	get searchInfoIcons() { return browser.elements( '.mw-advancedSearch-container .oo-ui-fieldLayout:not(.oo-ui-element-hidden) .oo-ui-icon-info' ); }
	get infoPopup() { return browser.elements( '.oo-ui-popupWidget-popup' ); }
	get searchButton() { return browser.element( '.oo-ui-fieldLayout-body button' ); }
	get namespaceTags() { return browser.elements( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-group span' ); }
	get allNamespacesPreset() { return browser.element( '.mw-advancedSearch-namespace-selection input[value="all"]' ); }

	formWasSubmitted() {
		return Object.prototype.hasOwnProperty.call( this.getQueryFromUrl(), 'advancedSearchOption-original' );
	}

	advancedSearchIsCollapsed() {
		return browser.element( '.mw-advancedSearch-expandablePane > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
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

	open( params ) {
		let pageName = 'Special:Search';
		if ( typeof params === 'object' ) {
			pageName += '&' + querystring.stringify( params );
		}
		super.open( pageName );
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
