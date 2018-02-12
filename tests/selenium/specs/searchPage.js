'use strict';

let assert = require( 'assert' );
let SearchPage = require( '../pageobjects/search.page' );

describe( 'Search in page text block functions properly', function () {

	function assertNamespaceSelection( tags ) {
		let matchingTags = SearchPage.namespaceTags.value.filter( function ( tag ) {
			return tags.indexOf( tag.getText() ) !== -1;
		} );
		return matchingTags.length === tags.length;
	}

	it( 'inserts advanced search icon elements', function () {

		SearchPage.open();

		SearchPage.searchExpandablePane.click();

		assert( SearchPage.searchInfoIcons.isVisible() );

	} );

	it( 'inserts content in icon popups', function () {

		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchInfoIcons.value.forEach( function ( popupIcon, idx ) {
			popupIcon.click();
			let popupContent = SearchPage.infoPopup.value[ idx ];

			assert( popupContent.isVisible() );
			assert( SearchPage.getInfoPopupContent( popupContent ).getText() !== '' );

			popupIcon.click();
		} );

	} );

	it( 'submits the search taking into consideration all entered criteria', function () {

		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchTheseWords.click();
		browser.keys( 'old,' );
		SearchPage.searchNotTheseWords.click();
		browser.keys( 'new ' );
		SearchPage.searchOneWord.click();
		browser.keys( 'big enormous giant' );
		SearchPage.searchTitle.setValue( 'house' );
		SearchPage.searchTemplate.setValue( 'Main Page\uE007' );
		SearchPage.searchFileType.click();
		SearchPage.fileTypeImage.click(); // selects option gif from the dropdown
		SearchPage.searchImageWidth.click();
		browser.keys( '40' );
		SearchPage.searchImageHeight.click();
		browser.keys( '40' );
		SearchPage.searchButton.click();
		assert( SearchPage.getSearchURL() === 'search=old+-new+big+OR+enormous+OR+giant+intitle:house+hastemplate:"Main+Page"+filemime:image/gif+filew:>40+fileh:>40' );
	} );

	it( 'adds the namespace "File" and dimension fields are visible when searching for files of type image', function () {

		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchFileType.click();
		SearchPage.fileTypeImage.click();
		assert( SearchPage.namespaceTags.value.filter( function ( tag ) {
			return tag.getText() === 'File';
		} ).length !== 0 );

		assert( SearchPage.searchImageWidth.isVisible() );
		assert( SearchPage.searchImageHeight.isVisible() );

	} );

	it( 'hides dimension fields when searching for files of type audio', function () {

		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchFileType.click();
		SearchPage.fileTypeAudio.click();

		assert( !SearchPage.searchImageWidth.isVisible() );
		assert( !SearchPage.searchImageHeight.isVisible() );

	} );

	it( 'selects all namespaces when clicking "All" preset', function () {

		SearchPage.open();

		SearchPage.namespacesExpandablePane.click();
		let tags = SearchPage.getAllNamespaceNames();
		SearchPage.fileNamespaceTag.click(); // an option has to be chosen in order for the pane to close
		SearchPage.allNamespacesPreset.click();

		assert( assertNamespaceSelection( tags ) );

	} );

	it( 'can\'t select namespaces from the dropdown which are already present as tags', function () {

		SearchPage.open();

		SearchPage.searchExpandablePane.click();
		SearchPage.searchFileType.click();
		SearchPage.fileTypeImage.click();
		SearchPage.namespacesExpandablePane.click();
		let tags = SearchPage.getDisabledNamespaceNames();

		assert( assertNamespaceSelection( tags ) );

	} );

	it( 'unselects "All" preset when a single namespace is unselected after preset had been clicked', function () {

		SearchPage.open();

		SearchPage.allNamespacesPreset.click();
		SearchPage.fileNamespaceTagClose.click();

		assert( !SearchPage.allNamespacesPreset.isSelected() );
	} );

	it( 'automatically selects "All" preset when selecting all namespaces from the list of all namespaces', function () {

		SearchPage.open();

		SearchPage.namespacesExpandablePane.click();
		const FIRST_UNSELECTED_NAMESPACE_ITEM = 1;
		const tags = SearchPage.dropdownNamespaceTags.value;
		for ( let i = FIRST_UNSELECTED_NAMESPACE_ITEM; i < tags.length; i++ ) {
			SearchPage.selectNamespaceMenuItem( i );
		}

		assert( SearchPage.allNamespacesPreset.isSelected() );

	} );

} );
