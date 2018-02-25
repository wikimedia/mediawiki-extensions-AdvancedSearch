'use strict';

let assert = require( 'assert' );
let SearchPage = require( '../pageobjects/search.page' );

describe( 'AdvancedSearch', function () {

	it( 'inserts advanced search icon elements', function () {

		SearchPage.open();

		SearchPage.toggleInputFields();

		assert( SearchPage.searchInfoIcons.isVisible() );

	} );

	it( 'inserts content in icon popups', function () {

		SearchPage.open();

		SearchPage.toggleInputFields();
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

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'old,' );
		SearchPage.searchNotTheseWords.put( 'new ' );
		SearchPage.searchOneWord.put( 'big enormous giant' );
		SearchPage.searchTitle.put( 'house' );
		SearchPage.searchSubpageof.put( 'Wikimedia' );
		SearchPage.searchTemplate.put( 'Main Page\uE007' );
		SearchPage.searchFileType.selectImageType();
		SearchPage.searchImageWidth.put( '40' );
		SearchPage.searchImageHeight.put( '40' );

		SearchPage.searchButton.click();

		assert.equal( SearchPage.getSearchQueryFromUrl(), 'old -new big OR enormous OR giant intitle:house subpageof:Wikimedia hastemplate:"Main Page" filemime:image/gif filew:>40 fileh:>40' );
	} );

	it( 'adds the namespace "File" and dimension fields are visible when searching for files of type image', function () {

		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchFileType.selectImageType();
		assert( SearchPage.namespaceTags.value.filter( function ( tag ) {
			return tag.getText() === 'File';
		} ).length !== 0 );

		assert( SearchPage.searchImageWidth.isVisible() );
		assert( SearchPage.searchImageHeight.isVisible() );

	} );

	it( 'hides dimension fields when searching for files of type audio', function () {

		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchFileType.selectAudioType();

		assert( !SearchPage.searchImageWidth.isVisible() );
		assert( !SearchPage.searchImageHeight.isVisible() );

	} );

	it( 'selects all namespaces when clicking "All" preset', function () {

		SearchPage.open();

		SearchPage.allNamespacesPreset.click();

		const allLabels = SearchPage.namespaces.getAllLabelsFromMenu();
		const selectedNamespaceLabels = SearchPage.namespaces.getAllTagLabels();
		assert.deepEqual( selectedNamespaceLabels, allLabels );

	} );

	it( 'can\'t select namespaces from the dropdown which are already present as tags', function () {

		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchFileType.selectImageType(); // make test more "interesting" by selecting image file type to force "File" namespace
		SearchPage.toggleInputFields();

		const disabledMenuLabels = SearchPage.namespaces.getAllLabelsForDisabledItemsInMenu().sort();
		const selectedNamespaceLabels = SearchPage.namespaces.getAllTagLabels().sort();
		assert.deepEqual( disabledMenuLabels, selectedNamespaceLabels );

	} );

	it( 'unselects "All" preset when a single namespace is unselected after preset had been clicked', function () {

		SearchPage.open();

		SearchPage.allNamespacesPreset.click();
		SearchPage.namespaces.removeFileNamespace();

		assert( !SearchPage.allNamespacesPreset.isSelected() );
	} );

	it( 'automatically selects "All" preset when selecting all namespaces from the list of all namespaces', function () {

		SearchPage.open();

		SearchPage.namespaces.selectAll();

		assert( SearchPage.allNamespacesPreset.isSelected() );

	} );

} );