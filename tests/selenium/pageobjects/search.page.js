'use strict';
const Api = require( 'wdio-mediawiki/Api' ),
	Page = require( 'wdio-mediawiki/Page' ),
	Util = require( 'wdio-mediawiki/Util' ),
	url = require( 'url' );

class TextInputField {
	constructor( selector ) {
		this.selector = selector;
	}

	async put( content ) {
		await $( this.selector + ' input' ).setValue( content );
	}

	async getPlaceholderText() {
		return await $( this.selector + ' input' ).getAttribute( 'placeholder' ) || '';
	}

	async isDisplayed() {
		return await $( this.selector + ' input' ).isDisplayed();
	}
}

class PillField {
	constructor( selector ) {
		this.selector = selector;
	}

	async put( content ) {
		await $( this.selector ).click();
		await browser.keys( content );
	}

	async getPlaceholderText() {
		return await $( this.selector + ' input' ).getAttribute( 'placeholder' ) || '';
	}

	async getTagLabels() {
		return await $$( this.selector + ' .oo-ui-tagItemWidget > .oo-ui-labelElement-label' ).map( async ( elem ) => await elem.getText() );
	}
}

class DropdownField {
	constructor( selector ) {
		this.selector = selector;
	}

	async choose( fieldName ) {
		const fieldElement = $( '.mw-advancedSearch-inlanguage-' + fieldName );
		await $( this.selector ).click(); // open inlanguage dropdown
		await browser.execute( 'arguments[0].scrollIntoView(true);', fieldElement ); // scroll to the option to get it into view
		await fieldElement.click();
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

	get FILE_NAMESPACE() {
		return '6';
	}

	get searchContainer() {
		return $( '.mw-advancedSearch-container' );
	}

	searchFileType() {
		return {
			selectImageType: async () => {
				await $( '#advancedSearchField-filetype .oo-ui-dropdownWidget-handle' ).click();
				await $( '.mw-advancedSearch-filetype-image-gif' ).click();
			},
			selectAudioType: async () => {
				await $( '#advancedSearchField-filetype .oo-ui-dropdownWidget-handle' ).click();
				await $( '.mw-advancedSearch-filetype-audio' ).click();
			}
		};
	}

	get namespacesPreview() {
		return $( '.mw-advancedSearch-expandablePane-namespaces .mw-advancedSearch-expandablePane-button .oo-ui-indicator-down' );
	}

	get namespacesMenu() {
		return $( '.mw-advancedSearch-namespaceFilter .oo-ui-inputWidget-input' );
	}

	get namespaceOptionMain() {
		return $( '.mw-advancedSearch-namespace-0' );
	}

	async expandNamespacesPreview() {
		await this.namespacesPreview.waitForDisplayed();
		await this.namespacesPreview.click();
		await this.namespacesMenu.waitForDisplayed();
	}

	async expandNamespacesMenu() {
		await this.namespacesMenu.waitForDisplayed();
		await this.namespacesMenu.click();
		await this.namespaceOptionMain.waitForDisplayed();
	}

	namespaces() {
		return {
			selectAll: async () => {
				const namespaces = await $$( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]:not(.oo-ui-optionWidget-selected)' );
				for ( const element of namespaces ) {
					await browser.execute( 'arguments[0].scrollIntoView(true);', element );
					await element.waitForDisplayed();
					await element.click();
				}
				await browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
			},
			clickOnNamespace: async ( nsId ) => {
				const menuItem = $( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget .mw-advancedSearch-namespace-' + nsId );
				await menuItem.waitForDisplayed();
				await menuItem.click();
			},
			getAllLabelsFromMenu: async () => {
				const labels = $$( '.oo-ui-defaultOverlay .oo-ui-menuSelectWidget div[class^="mw-advancedSearch-namespace-"]' ).map(
					async ( el ) => await el.$( '.oo-ui-labelElement-label' ).getText()
				);
				await browser.keys( '\uE00C' ); // Close menu by hitting the Escape key
				return labels;
			},
			getAllTagLabels: async () => $$( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-content div[class^="mw-advancedSearch-namespace-"]' ).map(
				async ( el ) => await el.getText()
			)
		};
	}

	async getSearchPaginationLinks() {
		return $$( '.mw-search-pager-bottom a' );
	}

	get searchPreviewItems() {
		return $$( '.mw-advancedSearch-searchPreview .mw-advancedSearch-searchPreview-previewPill' );
	}

	get namespacePreviewItems() {
		return $( '.mw-advancedSearch-namespacesPreview .mw-advancedSearch-namespacesPreview-previewPill' );
	}

	get searchInfoIcon() {
		return $( '.mw-advancedSearch-container .oo-ui-fieldLayout .oo-ui-buttonElement-button' );
	}

	get searchButton() {
		return $( '#mw-search-top-table button' );
	}

	get allNamespacesPreset() {
		return $( '.mw-advancedSearch-namespace-selection input[value="all"]' );
	}

	get generalHelpPreset() {
		return $( '.mw-advancedSearch-namespace-selection input[value="generalHelp"]' );
	}

	get rememberSelection() {
		return $( '.mw-advancedSearch-namespace-selection input[name="nsRemember"]' );
	}

	get default() {
		return $( '.mw-advancedSearch-namespace-selection input[value="defaultNamespaces"]' );
	}

	get categorySuggestionsBox() {
		return $( '.mw-advancedSearch-deepCategory div[role="listbox"]' );
	}

	get templateSuggestionsBox() {
		return $( '.mw-advancedSearch-template div[role="listbox"]' );
	}

	async formWasSubmitted() {
		return Object.prototype.hasOwnProperty.call( await this.getQueryFromUrl(), 'profile' );
	}

	async advancedSearchIsCollapsed() {
		return await $( '.mw-advancedSearch-expandablePane-options > .oo-ui-indicatorElement .oo-ui-indicatorElement-indicator.oo-ui-indicator-down' ).isExisting();
	}

	async getSearchQueryFromUrl() {
		return ( await this.getQueryFromUrl() ).search;
	}

	async getQueryFromUrl() {
		// eslint-disable-next-line n/no-deprecated-api
		return url.parse( await browser.getUrl(), true ).query;
	}

	async getSelectedNamespaceIDs() {
		const nameSpaceTags = await $$( '.mw-advancedSearch-namespaceFilter .oo-ui-tagMultiselectWidget-group .oo-ui-tagItemWidget' );
		return nameSpaceTags.reduce( async ( accPromise, widget ) => {
			const acc = await accPromise;
			const widgetClass = await widget.getAttribute( 'class' );
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

	async assertPillLinkMarkedRed( $pillLink ) {
		await $pillLink.waitForExist();
		await browser.waitUntil( async () => ( await $pillLink.getAttribute( 'class' ) ).includes( 'new' ), {
			timeOutMsg: 'Pill field marks non-existent titles in red'
		} );
	}

	async open( params ) {
		const pageName = 'Special:Search';
		await super.openTitle( pageName, params );
		await this.waitForAdvancedSearchToLoad();
	}

	async waitForAdvancedSearchToLoad() {
		await Util.waitForModuleState( 'ext.advancedSearch.init' );
	}

	async submitForm() {
		await this.searchButton.click();
		await this.waitForAdvancedSearchToLoad();
	}

	async toggleInputFields() {
		await $( '.mw-advancedSearch-expandablePane-options .mw-advancedSearch-expandablePane-button a' ).click();
		// Wait for the last search field to be visible as an indicator that all search field widgets have been built
		await $( '#advancedSearchField-filetype' ).waitForExist();
	}

	async addExamplePages( num ) {
		await browser.call( async () => {
			const animals = [ 'cat', 'goat' ],
				bot = await Api.bot();

			for ( let i = 1; i <= num; i++ ) {
				await bot.edit(
					'Search Test Page ' + ( i + 1 ),
					'The big brown ' + animals[ i % 2 ] + ' jumped over the lazy dog.'
				);
			}
		} );
	}

	async setSearchNamespaceOptions( nsIds ) {
		await Util.waitForModuleState( 'mediawiki.base' );
		await browser.execute( async ( namespaceIds ) => {
			await mw.loader.using( 'mediawiki.api' );
			const api = new mw.Api();
			const data = await api.postWithToken( 'csrf',
				{
					action: 'query',
					meta: 'userinfo',
					uiprop: 'options'
				} );

			let newSearchNamespaces = namespaceIds.map( ( nsId ) => 'searchNs' + nsId + '=1' ).join( '|' );

			const userOptions = data.query.userinfo.options;
			Object.keys( userOptions ).forEach( ( key ) => {
				if ( userOptions[ key ] &&
					key.indexOf( 'searchNs' ) === 0 &&
					!newSearchNamespaces.includes( key + '=1' )
				) {
					newSearchNamespaces += '|' + key + '=0';
				}
			} );

			await api.postWithToken( 'csrf',
				{
					action: 'options',
					change: newSearchNamespaces
				} );
		}, nsIds );
	}

	async addPage( title, text ) {
		await browser.call( async () => {
			const bot = await Api.bot();
			return bot.edit(
				title,
				text
			);
		} );
	}

	async addCategory( title ) {
		await this.addPage( 'Category:' + title, 'test' );
	}

	async addTemplate( title ) {
		await this.addPage( 'Template:' + title, 'test' );
	}
}
module.exports = new SearchPage();
