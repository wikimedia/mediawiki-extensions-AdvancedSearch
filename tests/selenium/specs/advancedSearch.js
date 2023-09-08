'use strict';

const SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', () => {

	beforeEach( async () => {
		await SearchPage.open();
	} );

	it( 'inserts advanced search elements on search page', async () => {
		await expect( await SearchPage.searchContainer ).toBeDisplayed();

		await SearchPage.toggleInputFields();

		await expect( await SearchPage.searchInfoIcon ).toBeDisplayed( ( { message: 'Info icons are visible' } ) );
		await expect( await SearchPage.searchTheseWords.getPlaceholderText() ).toBe( '' );
		await expect( await SearchPage.searchExactText.getPlaceholderText() ).not.toBe( '' );
		await expect( await SearchPage.searchNotTheseWords.getPlaceholderText() ).toBe( '' );
		await expect( await SearchPage.searchOneWord.getPlaceholderText() ).toBe( '' );

		// Test pill creation
		await SearchPage.searchTheseWords.put( 'these1 these2, these3\n' );

		await expect(
			await SearchPage.searchTheseWords.getTagLabels() ).toStrictEqual(
			[ 'these1', 'these2', 'these3' ],
			{ message: 'Pill field creates pills from spaces and line breaks' }
		);

		// Add more content
		await SearchPage.searchNotTheseWords.put( 'not1 not2,' );
		await SearchPage.searchOneWord.put( 'one1 one2' );
		await SearchPage.searchExactText.put( '"exact test"' );
		await SearchPage.searchTitle.put( 'intitle' );
		await SearchPage.searchSubpageof.put( 'Subpage' );

		// Don't show dimension on audio input
		await SearchPage.searchFileType().selectAudioType();
		await expect( await SearchPage.searchImageWidth ).not.toBeDisplayed();
		await expect( await SearchPage.searchImageHeight ).not.toBeDisplayed();

		// Add image
		await SearchPage.searchFileType().selectImageType();
		await SearchPage.searchImageWidth.put( '40' );
		await SearchPage.searchImageHeight.put( '40' );

		await expect( await SearchPage.getSelectedNamespaceIDs() ).toContain( SearchPage.FILE_NAMESPACE );

		await expect( await SearchPage.searchPreviewItems ).toHaveLength( 0, { message: 'No preview pill elements should exist' } );

		// Test autocompletion
		await SearchPage.addCategory( 'Existing Category' );
		await SearchPage.addTemplate( 'Existing Template' );

		await SearchPage.searchCategory.put( 'Existing Category' );
		await SearchPage.categorySuggestionsBox.waitForDisplayed();
		await expect(
			await SearchPage.categorySuggestionsBox ).toBeDisplayed(
			{ message: 'suggest exiting category when typing' }
		);
		await SearchPage.searchCategory.put( '\nCategory2\n' );

		await SearchPage.searchTemplate.put( 'Existing Template' );
		await SearchPage.templateSuggestionsBox.waitForDisplayed();
		await expect(
			await SearchPage.templateSuggestionsBox ).toBeDisplayed(
			{ message: 'suggest exiting template when typing' }
		);
		await SearchPage.searchTemplate.put( '\nTemplate2\n' );

		// Test red linking
		await SearchPage.assertPillLinkMarkedRed( SearchPage.getCategoryPillLink( 'Category2' ) );
		await SearchPage.assertPillLinkMarkedRed( SearchPage.getTemplatePillLink( 'Template2' ) );

		// Test preview pills
		await SearchPage.toggleInputFields();
		await browser.waitUntil( await SearchPage.advancedSearchIsCollapsed );

		await expect( await SearchPage.searchPreviewItems[ 0 ] ).toExist( { message: 'Preview pills should be shown' } );
		await expect(
			await SearchPage.searchPreviewItems ).toHaveLength(
			11,
			{ message: 'Number of preview pills must match number of filled fields' }
		);

		// Test the namespace preview
		await SearchPage.expandNamespacesPreview();
		await SearchPage.expandNamespacesMenu();
		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		await expect( await SearchPage.namespacePreviewItems ).not.toExist( { message: 'No preview pill elements should exist' } );

		await SearchPage.namespacesPreview.click();
		await SearchPage.namespacesMenu.waitForDisplayed( { reverse: true } );

		await expect( await SearchPage.namespacePreviewItems ).toExist( { message: 'Preview pills should be shown' } );

		// Test submitting with double enter
		await SearchPage.toggleInputFields();
		await SearchPage.searchTheseWords.put( '\n\n' );

		await expect( await SearchPage.formWasSubmitted() ).toBe( true, { message: 'form was submitted on double enter in "These Words" field' } );

		await SearchPage.waitForAdvancedSearchToLoad();
		await expect( await SearchPage.advancedSearchIsCollapsed() ).toBe( true, { message: 'Search preview is collapsed after submission' } );
		await expect( await SearchPage.namespacesMenu ).not.toBeDisplayed( { message: 'Namespaces preview is collapsed after submission' } );

		// Test query composition
		await expect(
			await SearchPage.getSearchQueryFromUrl() ).toStrictEqual(
			'these1 these2 these3 "exact test" -not1 -not2 one1 OR one2 intitle:intitle subpageof:Subpage deepcat:"Existing Category" deepcat:Category2 hastemplate:"Existing Template" hastemplate:Template2 filemime:image/gif filew:>40 fileh:>40'
		);
	} );
} );
