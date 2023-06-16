'use strict';

const assert = require( 'assert' ),
	SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	beforeEach( function () {
		SearchPage.open();
	} );

	it( 'inserts advanced search elements on search page', function () {
		assert( SearchPage.searchContainer.isDisplayed() );

		SearchPage.toggleInputFields();

		assert( SearchPage.searchInfoIcon.isDisplayed(), 'Info icons are visible' );
		assert( SearchPage.searchTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchExactText.getPlaceholderText() !== '' );
		assert( SearchPage.searchNotTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchOneWord.getPlaceholderText() === '' );

		// Test pill creation
		SearchPage.searchTheseWords.put( 'these1 these2, these3\n' );

		assert.deepStrictEqual(
			SearchPage.searchTheseWords.getTagLabels(),
			[ 'these1', 'these2', 'these3' ],
			'Pill field creates pills from spaces and line breaks'
		);

		// Add more content
		SearchPage.searchNotTheseWords.put( 'not1 not2,' );
		SearchPage.searchOneWord.put( 'one1 one2' );
		SearchPage.searchExactText.put( '"exact test"' );
		SearchPage.searchTitle.put( 'intitle' );
		SearchPage.searchSubpageof.put( 'Subpage' );

		// Don't show dimension on audio input
		SearchPage.searchFileType.selectAudioType();
		assert( !SearchPage.searchImageWidth.isDisplayed() );
		assert( !SearchPage.searchImageHeight.isDisplayed() );

		// Add image
		SearchPage.searchFileType.selectImageType();
		SearchPage.searchImageWidth.put( '40' );
		SearchPage.searchImageHeight.put( '40' );

		assert(
			SearchPage.namespaceTagsInCollapsedMode.filter(
				( tag ) => { return tag.getText() === 'File'; }
			).length !== 0,
			'File namespace is selected '
		);

		assert( !SearchPage.searchPreviewItem.isExisting(), 'No preview pill elements should exist' );

		// Test autocompletion
		SearchPage.addCategory( 'Existing Category' );
		SearchPage.addTemplate( 'Existing Template' );

		SearchPage.searchCategory.put( 'Existing C' );
		SearchPage.categorySuggestionsBox.waitForDisplayed();
		assert(
			SearchPage.categorySuggestionsBox.isDisplayed(),
			'suggest exiting category when typing'
		);
		SearchPage.searchCategory.put( '\nCategory2\n' );

		SearchPage.searchTemplate.put( 'Existing T' );
		SearchPage.templateSuggestionsBox.waitForDisplayed();
		assert(
			SearchPage.templateSuggestionsBox.isDisplayed(),
			'suggest exiting template when typing'
		);
		SearchPage.searchTemplate.put( '\nTemplate2\n' );

		// Test red linking
		assert(
			SearchPage.getCategoryPillLink( 'Category2' ).getAttribute( 'class' ).includes( 'new' ),
			'Pill field marks non-existent categories in red'
		);
		assert(
			SearchPage.getTemplatePillLink( 'Template2' ).getAttribute( 'class' ).includes( 'new' ),
			'Pill field marks non-existent templates in red'
		);

		// Test preview pills
		SearchPage.toggleInputFields();
		browser.waitUntil( SearchPage.advancedSearchIsCollapsed );

		assert( SearchPage.searchPreviewItem.isExisting(), 'Preview pills should be shown' );
		assert.strictEqual(
			SearchPage.searchPreviewItems.length,
			12,
			'Number of preview pills must match number of filled fields + 1 (default sorting)'
		);

		// Test the namespace preview
		SearchPage.expandNamespacesPreview();
		SearchPage.expandNamespacesMenu();
		SearchPage.namespaces.clickOnNamespace( 4 );

		assert( !SearchPage.namespacePreviewItems.isExisting(), 'No preview pill elements should exist' );

		SearchPage.namespacesPreview.click();
		SearchPage.namespacesMenu.waitForDisplayed( { reverse: true } );

		assert( SearchPage.namespacePreviewItems.isExisting(), 'Preview pills should be shown' );

		// Test submitting with double enter
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( '\n\n' );

		assert( SearchPage.formWasSubmitted(), 'form was submitted on double enter in "These Words" field' );

		SearchPage.waitForAdvancedSearchToLoad();
		assert( SearchPage.advancedSearchIsCollapsed(), 'Search preview is collapsed after submission' );
		assert( !SearchPage.namespacesMenu.isDisplayed(), 'Namespaces preview is collapsed after submission' );

		// Test query composition
		assert.strictEqual(
			SearchPage.getSearchQueryFromUrl(),
			'these1 these2 these3 "exact test" -not1 -not2 one1 OR one2 intitle:intitle subpageof:Subpage deepcat:"Existing Category" deepcat:Category2 hastemplate:"Existing Template" hastemplate:Template2 filemime:image/gif filew:>40 fileh:>40'
		);
	} );
} );
