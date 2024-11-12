'use strict';

const SearchPage = require( '../pageobjects/search.page' );

describe( 'AdvancedSearch', () => {

	beforeEach( async () => {
		await SearchPage.open();
	} );

	it( 'namespace selection', async () => {
		await SearchPage.expandNamespacesPreview();

		// do not allow remembering the selection for anon users
		await expect( await SearchPage.rememberSelection ).not.toExist();

		// select all namespaces
		await SearchPage.allNamespacesPreset.click();
		await SearchPage.expandNamespacesMenu();

		await expect(
			await SearchPage.namespaces().getAllTagLabels() ).toStrictEqual(
			await SearchPage.namespaces().getAllLabelsFromMenu()
		);

		// deselect all namespaces
		await SearchPage.allNamespacesPreset.click();

		await expect(
			await SearchPage.namespaces().getAllTagLabels() ).toStrictEqual(
			[]
		);

		// select all namespaces manually
		await SearchPage.expandNamespacesMenu();
		await SearchPage.namespaces().selectAll();
		await expect( await SearchPage.allNamespacesPreset ).toBeSelected();

		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		await expect( await SearchPage.allNamespacesPreset ).not.toBeSelected( { message: 'preset is not checked if a namespace is missing' } );
		await expect( await SearchPage.generalHelpPreset ).toBeSelected();

		await SearchPage.submitForm();

		await SearchPage.expandNamespacesPreview();
		await expect( await SearchPage.generalHelpPreset ).toBeSelected( { message: 'marks a namespace preset checkbox after submit' } );
	} );

	it( 're-adds filetype namespace after search when file type option has been selected but namespace has been removed', async () => {
		await SearchPage.toggleInputFields();

		await SearchPage.searchTheseWords.put( 'dog' );
		await SearchPage.searchFileType().selectImageType();
		await SearchPage.expandNamespacesPreview();
		// clears the namespace bar
		await SearchPage.allNamespacesPreset.click();
		await SearchPage.allNamespacesPreset.click();

		await SearchPage.submitForm();

		await SearchPage.expandNamespacesPreview();
		await expect( await SearchPage.getSelectedNamespaceIDs() ).toContain( SearchPage.FILE_NAMESPACE );
	} );

	it( 'adds/removes the namespace tag when the namespace option is clicked', async () => {
		await SearchPage.expandNamespacesPreview();
		await SearchPage.expandNamespacesMenu();
		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		await expect( await SearchPage.getSelectedNamespaceIDs() ).toContain( SearchPage.FILE_NAMESPACE );

		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		await expect( await SearchPage.getSelectedNamespaceIDs() ).not.toContain( SearchPage.FILE_NAMESPACE );
	} );
} );
