'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'AdvancedSearch', () => {

	beforeEach( async () => {
		await SearchPage.open();
	} );

	it( 'namespace selection', async () => {
		await SearchPage.expandNamespacesPreview();

		// do not allow remembering the selection for anon users
		assert( !await SearchPage.rememberSelection.isExisting() );

		// select all namespaces
		await SearchPage.allNamespacesPreset.click();
		await SearchPage.expandNamespacesMenu();

		assert.deepStrictEqual(
			await SearchPage.namespaces().getAllTagLabels(),
			await SearchPage.namespaces().getAllLabelsFromMenu()
		);

		// deselect all namespaces
		await SearchPage.allNamespacesPreset.click();

		assert.deepStrictEqual(
			await SearchPage.namespaces().getAllTagLabels(),
			[]
		);

		// select all namespaces manually
		await SearchPage.expandNamespacesMenu();
		await SearchPage.namespaces().selectAll();
		assert( await SearchPage.allNamespacesPreset.isSelected() );

		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		assert( !await SearchPage.allNamespacesPreset.isSelected(), 'preset is not checked if a namespace is missing' );
		assert( await SearchPage.generalHelpPreset.isSelected() );

		await SearchPage.submitForm();

		await SearchPage.expandNamespacesPreview();
		assert( await SearchPage.generalHelpPreset.isSelected(), 'marks a namespace preset checkbox after submit' );
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
		assert( ( await SearchPage.getSelectedNamespaceIDs() ).includes( SearchPage.FILE_NAMESPACE ) );
	} );

	it( 'adds/removes the namespace tag when the namespace option is clicked', async () => {
		await SearchPage.expandNamespacesPreview();
		await SearchPage.expandNamespacesMenu();
		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		assert( ( await SearchPage.getSelectedNamespaceIDs() ).includes( SearchPage.FILE_NAMESPACE ) );

		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		assert( !( await SearchPage.getSelectedNamespaceIDs() ).includes( SearchPage.FILE_NAMESPACE ) );
	} );
} );
