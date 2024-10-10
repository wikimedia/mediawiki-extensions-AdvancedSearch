'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', () => {

	beforeEach( async () => {
		await SearchPage.open();
	} );

	it( 'inserts advanced search elements on search page', async () => {
		assert( await SearchPage.searchContainer.isDisplayed() );

		await SearchPage.toggleInputFields();

		assert( await SearchPage.searchInfoIcon.isDisplayed(), 'Info icons are visible' );
		assert( await SearchPage.searchTheseWords.getPlaceholderText() === '' );
		assert( await SearchPage.searchExactText.getPlaceholderText() !== '' );
		assert( await SearchPage.searchNotTheseWords.getPlaceholderText() === '' );
		assert( await SearchPage.searchOneWord.getPlaceholderText() === '' );

		// Test pill creation
		await SearchPage.searchTheseWords.put( 'these1 these2, these3\n' );

		assert.deepStrictEqual(
			await SearchPage.searchTheseWords.getTagLabels(),
			[ 'these1', 'these2', 'these3' ],
			'Pill field creates pills from spaces and line breaks'
		);

		// Add more content
		await SearchPage.searchNotTheseWords.put( 'not1 not2,' );
		await SearchPage.searchOneWord.put( 'one1 one2' );
		await SearchPage.searchExactText.put( '"exact test"' );
		await SearchPage.searchTitle.put( 'intitle' );
		await SearchPage.searchSubpageof.put( 'Subpage' );

		// Don't show dimension on audio input
		await SearchPage.searchFileType().selectAudioType();
		assert( !await SearchPage.searchImageWidth.isDisplayed() );
		assert( !await SearchPage.searchImageHeight.isDisplayed() );

		// Add image
		await SearchPage.searchFileType().selectImageType();
		await SearchPage.searchImageWidth.put( '40' );
		await SearchPage.searchImageHeight.put( '40' );

		assert( ( await SearchPage.getSelectedNamespaceIDs() ).includes( SearchPage.FILE_NAMESPACE ) );

		assert( !( await SearchPage.searchPreviewItems ).length, 'No preview pill elements should exist' );

		// Test autocompletion
		await SearchPage.addCategory( 'Existing Category' );
		await SearchPage.addTemplate( 'Existing Template' );

		await SearchPage.searchCategory.put( 'Existing Category' );
		await SearchPage.categorySuggestionsBox.waitForDisplayed();
		assert(
			await SearchPage.categorySuggestionsBox.isDisplayed(),
			'suggest exiting category when typing'
		);
		await SearchPage.searchCategory.put( '\nCategory2\n' );

		await SearchPage.searchTemplate.put( 'Existing Template' );
		await SearchPage.templateSuggestionsBox.waitForDisplayed();
		assert(
			await SearchPage.templateSuggestionsBox.isDisplayed(),
			'suggest exiting template when typing'
		);
		await SearchPage.searchTemplate.put( '\nTemplate2\n' );

		// Test red linking
		await SearchPage.assertPillLinkMarkedRed( SearchPage.getCategoryPillLink( 'Category2' ) );
		await SearchPage.assertPillLinkMarkedRed( SearchPage.getTemplatePillLink( 'Template2' ) );

		// Test preview pills
		await SearchPage.toggleInputFields();
		await browser.waitUntil( await SearchPage.advancedSearchIsCollapsed );

		assert( await SearchPage.searchPreviewItems[ 0 ].isExisting(), 'Preview pills should be shown' );
		assert.strictEqual(
			( await SearchPage.searchPreviewItems ).length,
			12,
			'Number of preview pills must match number of filled fields + 1 (default sorting)'
		);

		// Test the namespace preview
		await SearchPage.expandNamespacesPreview();
		await SearchPage.expandNamespacesMenu();
		await SearchPage.namespaces().clickOnNamespace( SearchPage.FILE_NAMESPACE );

		assert( !await SearchPage.namespacePreviewItems.isExisting(), 'No preview pill elements should exist' );

		await SearchPage.namespacesPreview.click();
		await SearchPage.namespacesMenu.waitForDisplayed( { reverse: true } );

		assert( await SearchPage.namespacePreviewItems.isExisting(), 'Preview pills should be shown' );

		// Test submitting with double enter
		await SearchPage.toggleInputFields();
		await SearchPage.searchTheseWords.put( '\n\n' );

		assert( await SearchPage.formWasSubmitted(), 'form was submitted on double enter in "These Words" field' );

		await SearchPage.waitForAdvancedSearchToLoad();
		assert( await SearchPage.advancedSearchIsCollapsed(), 'Search preview is collapsed after submission' );
		assert( !await SearchPage.namespacesMenu.isDisplayed(), 'Namespaces preview is collapsed after submission' );

		// Test query composition
		assert.strictEqual(
			await SearchPage.getSearchQueryFromUrl(),
			'these1 these2 these3 "exact test" -not1 -not2 one1 OR one2 intitle:intitle subpageof:Subpage deepcat:"Existing Category" deepcat:Category2 hastemplate:"Existing Template" hastemplate:Template2 filemime:image/gif filew:>40 fileh:>40'
		);
	} );
} );
