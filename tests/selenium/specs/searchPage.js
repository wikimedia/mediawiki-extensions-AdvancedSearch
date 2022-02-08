'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' ),
	UserLoginPage = require( 'wdio-mediawiki/LoginPage' );

describe( 'AdvancedSearch', function () {
	const NAMESPACE_USER = '2';

	beforeEach( function () {
		browser.deleteCookies();
		SearchPage.open();
	} );

	it( 'inserts advanced search icon elements', function () {
		SearchPage.toggleInputFields();

		assert( SearchPage.searchInfoIcon.isDisplayed() );
	} );

	it( 'inserts content in icon popups', function () {
		SearchPage.toggleInputFields();
		const infoPopups = SearchPage.infoPopup;
		SearchPage.searchInfoIcons.forEach( function ( popupIcon, idx ) {
			if ( !popupIcon.isDisplayed() ) {
				return;
			}
			browser.execute( function ( selector, i ) {
				document.querySelectorAll( selector )[ i ].scrollIntoView( true ); // eslint-disable-line no-undef
			}, popupIcon.selector, idx );
			popupIcon.click();
			const popupContent = infoPopups[ idx ];
			popupContent.waitForDisplayed();

			assert( popupContent.isDisplayed() );
			assert( SearchPage.getInfoPopupContent( popupContent ).getText() !== '' );

			popupIcon.click();
		} );
	} );

	it( 'submits the search taking into consideration all entered criteria', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'old,' );
		SearchPage.searchNotTheseWords.put( 'new ' );
		SearchPage.searchOneWord.put( 'big enormous giant' );
		SearchPage.searchTitle.put( 'house' );
		SearchPage.searchSubpageof.put( 'Wikimedia' );
		SearchPage.searchTemplate.put( 'Main Page' );
		SearchPage.searchFileType.selectImageType();
		SearchPage.searchImageWidth.put( '40' );
		SearchPage.searchImageHeight.put( '40' );

		SearchPage.submitForm();

		assert.strictEqual( SearchPage.getSearchQueryFromUrl(), 'old -new big OR enormous OR giant intitle:house subpageof:Wikimedia hastemplate:"Main Page" filemime:image/gif filew:>40 fileh:>40' );
	} );

	it( 'adds the namespace "File" and dimension fields are visible when searching for files of type image', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchFileType.selectImageType();

		assert( SearchPage.namespaceTagsInCollapsedMode.filter( function ( tag ) {
			return tag.getText() === 'File';
		} ).length !== 0 );
		assert( SearchPage.searchImageWidth.isDisplayed() );
		assert( SearchPage.searchImageHeight.isDisplayed() );
	} );

	it( 'hides dimension fields when searching for files of type audio', function () {
		SearchPage.toggleInputFields();
		SearchPage.searchFileType.selectAudioType();

		assert( !SearchPage.searchImageWidth.isDisplayed() );
		assert( !SearchPage.searchImageHeight.isDisplayed() );
	} );

	it( 'selects all namespaces when clicking "All" preset', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.allNamespacesPreset.click();
		SearchPage.expandNamespacesMenu();

		assert.deepStrictEqual(
			SearchPage.namespaces.getAllTagLabels(),
			SearchPage.namespaces.getAllLabelsFromMenu()
		);
	} );

	it( 'de-selects all namespaces when clicking "All" preset twice', function () {
		SearchPage.expandNamespacesPreview();
		// clears the namespace bar
		SearchPage.allNamespacesPreset.click();
		SearchPage.allNamespacesPreset.click();

		assert.deepStrictEqual(
			SearchPage.namespaces.getAllTagLabels(),
			[]
		);
	} );

	it( 'unselects "All" preset when a single namespace is unselected after preset had been clicked', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.allNamespacesPreset.click();
		SearchPage.namespaces.removeFileNamespace();

		assert( !SearchPage.allNamespacesPreset.isSelected() );
	} );

	it( 'automatically selects "All" preset when selecting all namespaces from the list of all namespaces', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.selectAll();

		assert( SearchPage.allNamespacesPreset.isSelected() );
	} );

	it( 'does not allow to remember the selection of namespaces for anonymous users', function () {
		SearchPage.expandNamespacesPreview();

		assert( !SearchPage.rememberSelection.isExisting() );
	} );

	it( 'allows logged-in users to remember the selection of namespaces for future searches', function () {
		UserLoginPage.loginAdmin();
		SearchPage.open();

		SearchPage.expandNamespacesPreview();
		SearchPage.generalHelpPreset.click();
		SearchPage.rememberSelection.click();
		const cache = SearchPage.getSelectedNamespaceIDs();

		SearchPage.submitForm();

		assert.deepStrictEqual( cache, SearchPage.getSelectedNamespaceIDs() );
	} );

	it( 're-adds filetype namespace after search when file type option has been selected but namespace has been removed', function () {
		SearchPage.toggleInputFields();

		SearchPage.searchTheseWords.put( 'dog' );
		SearchPage.searchFileType.selectImageType();
		SearchPage.expandNamespacesPreview();
		// clears the namespace bar
		SearchPage.allNamespacesPreset.click();
		SearchPage.allNamespacesPreset.click();

		SearchPage.submitForm();

		assert( SearchPage.getSelectedNamespaceIDs().includes( SearchPage.FILE_NAMESPACE ) );
	} );

	it( 'marks a namespace preset checkbox when all namespaces behind it are present in the namespace search bar', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.generalHelpPreset.click();

		SearchPage.submitForm();

		assert( SearchPage.generalHelpPreset.isSelected() );
	} );

	it( 'adds/removes the namespace tag when the namespace option is clicked', function () {
		SearchPage.expandNamespacesPreview();
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( NAMESPACE_USER );

		assert( SearchPage.namespaceTags.filter( function ( tag ) {
			return tag.getText() === 'User';
		} ).length !== 0 );

		SearchPage.namespaces.clickOnNamespace( NAMESPACE_USER );

		assert( SearchPage.namespaceTags.filter( function ( tag ) {
			return tag.getText() === 'User';
		} ).length === 0 );
	} );

	it( 'changes the namespace filter input icon when menu is toggled', function () {
		SearchPage.expandNamespacesPreview();

		assert( SearchPage.inputIcon.getAttribute( 'class' ).includes( 'oo-ui-icon-menu' ) );

		SearchPage.expandNamespacesMenu();

		assert( SearchPage.inputIcon.getAttribute( 'class' ).includes( 'oo-ui-icon-search' ) );
	} );

} );
