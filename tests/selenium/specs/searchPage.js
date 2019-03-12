'use strict';

let assert = require( 'assert' );
let SearchPage = require( '../pageobjects/search.page' );
let LoginPage = require( '../pageobjects/login.page' );

describe( 'AdvancedSearch', function () {
	const NAMESPACE_USER = '2';

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
		this.timeout( 60000 );
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

		SearchPage.submitForm();

		assert.strictEqual( SearchPage.getSearchQueryFromUrl(), 'old -new big OR enormous OR giant intitle:house subpageof:Wikimedia hastemplate:"Main Page" filemime:image/gif filew:>40 fileh:>40' );
	} );

	it( 'adds the namespace "File" and dimension fields are visible when searching for files of type image', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchFileType.selectImageType();
		assert( SearchPage.namespaceTagsInCollapsedMode.value.filter( function ( tag ) {
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
		SearchPage.namespaces.toggleNamespacesPreview();

		SearchPage.allNamespacesPreset.click();
		SearchPage.namespaces.toggleNamespacesMenu();
		const allLabels = SearchPage.namespaces.getAllLabelsFromMenu();
		const selectedNamespaceLabels = SearchPage.namespaces.getAllTagLabels();
		assert.deepEqual( selectedNamespaceLabels, allLabels );
	} );

	it( 'de-selects all namespaces when clicking "All" preset twice', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		// clears the namespace bar
		SearchPage.allNamespacesPreset.click();
		SearchPage.allNamespacesPreset.click();

		const selectedNamespaceLabels = SearchPage.namespaces.getAllTagLabels();
		assert.deepEqual( selectedNamespaceLabels, [] );
	} );

	it( 'unselects "All" preset when a single namespace is unselected after preset had been clicked', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();

		SearchPage.allNamespacesPreset.click();
		SearchPage.namespaces.removeFileNamespace();

		assert( !SearchPage.allNamespacesPreset.isSelected() );
	} );

	it( 'automatically selects "All" preset when selecting all namespaces from the list of all namespaces', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		SearchPage.namespaces.toggleNamespacesMenu();
		SearchPage.namespaces.selectAll();

		assert( SearchPage.allNamespacesPreset.isSelected() );
	} );

	it( 'allows logged-in users to remember the selection of namespaces for future searches', function () {
		this.timeout( 60000 );
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		assert( !SearchPage.rememberSelection.isExisting() );
		LoginPage.loginAdmin();
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		SearchPage.generalHelpPreset.click();
		SearchPage.rememberSelection.click();
		let cache = SearchPage.getSelectedNamespaceIDs();
		SearchPage.submitForm();
		let current = SearchPage.getSelectedNamespaceIDs();
		assert.deepEqual( cache, current );
		SearchPage.logOut.click();
	} );

	it( 're-adds filetype namespace after search when file type option has been selected but namespace has been removed', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();

		SearchPage.searchTheseWords.put( 'dog' );
		SearchPage.searchFileType.selectImageType();
		SearchPage.namespaces.toggleNamespacesPreview();
		// clears the namespace bar
		SearchPage.allNamespacesPreset.click();
		SearchPage.allNamespacesPreset.click();

		SearchPage.submitForm();

		assert( SearchPage.getSelectedNamespaceIDs().indexOf( SearchPage.FILE_NAMESPACE ) !== -1 );
	} );

	it( 'marks a namespace preset checkbox when all namespaces behind it are present in the namespace search bar', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		SearchPage.generalHelpPreset.click();
		SearchPage.submitForm();
		assert( SearchPage.generalHelpPreset.isSelected() );
	} );

	it( 'adds/removes the namespace tag when the namespace option is clicked', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		SearchPage.namespaces.toggleNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( NAMESPACE_USER );
		assert( SearchPage.namespaceTags.value.filter( function ( tag ) {
			return tag.getText() === 'User';
		} ).length !== 0 );
		SearchPage.namespaces.clickOnNamespace( NAMESPACE_USER );
		assert( SearchPage.namespaceTags.value.filter( function ( tag ) {
			return tag.getText() === 'User';
		} ).length === 0 );
	} );

	it( 'changes the namespace filter input icon when menu is toggled', function () {
		SearchPage.open();
		SearchPage.namespaces.toggleNamespacesPreview();
		assert( SearchPage.inputIcon.getAttribute( 'class' ).split( ' ' )[ 1 ] === 'oo-ui-icon-menu' );
		SearchPage.namespaces.toggleNamespacesMenu();
		assert( SearchPage.inputIcon.getAttribute( 'class' ).split( ' ' )[ 1 ] === 'oo-ui-icon-search' );
	} );

} );
