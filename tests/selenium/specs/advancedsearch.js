'use strict';

const assert = require( 'assert' );
const Bot = require( 'mwbot' ); // https://github.com/Fannon/mwbot
const SpecialPage = require( '../pageobjects/special.page' );
const SearchPage = require( '../pageobjects/search.page' );

describe( 'Advanced Search', function () {

	function addExamplePages( numPages ) {
		let client = new Bot(),
			animals = [ 'cat', 'goat' ];

		return new Promise( function ( resolve, reject ) {
			const editPage = function ( pageNumber ) {
				const content = 'The big brown ' + animals[ pageNumber % 2 ] + ' jumped over the lazy dog.\n' +
					'[[Category:Test]]';
				client.edit(
					'Test Categories Page ' + ( pageNumber + 1 ),
					content,
					'Created page with "' + content + '"'
				).then( () => {
					if ( pageNumber > numPages ) {
						return resolve();
					} else {
						return editPage( pageNumber + 1 );
					}
				} ).catch( ( err ) => {
					return reject( err );
				} );
			};
			client.loginGetEditToken( {
				username: browser.options.username,
				password: browser.options.password,
				apiUrl: browser.options.baseUrl + '/api.php'
			} ).then( () => {
				return editPage( 0 );
			} ).catch( ( err ) => {
				return reject( err );
			} );
		} );
	}

	function addCategory( name ) {
		let client = new Bot();

		return new Promise( function ( resolve, reject ) {
			const editPage = function () {
				const content = 'test';
				client.edit(
					'Category:' + name,
					content,
					'Created page with "' + content + '"'
				).then( () => {
					return resolve();
				} ).catch( ( err ) => {
					return reject( err );
				} );
			};
			client.loginGetEditToken( {
				username: browser.options.username,
				password: browser.options.password,
				apiUrl: browser.options.baseUrl + '/api.php'
			} ).then( () => {
				return editPage();
			} ).catch( ( err ) => {
				return reject( err );
			} );
		} );
	}

	function addTemplate( name, content ) {
		let client = new Bot();

		return new Promise( function ( resolve, reject ) {
			const editPage = function () {
				client.edit(
					'Template:' + name,
					content,
					'Created page with "' + content + '"'
				).then( () => {
					return resolve();
				} ).catch( ( err ) => {
					return reject( err );
				} );
			};
			client.loginGetEditToken( {
				username: browser.options.username,
				password: browser.options.password,
				apiUrl: browser.options.baseUrl + '/api.php'
			} ).then( () => {
				return editPage();
			} ).catch( ( err ) => {
				return reject( err );
			} );
		} );
	}

	it( 'has the advanced search extension installed', function () {
		SpecialPage.open();

		assert( SpecialPage.advancedSearchExtensionLink.isVisible() );
	} );

	it( 'inserts advanced search elements on search page', function () {
		SearchPage.open();

		assert( SearchPage.searchContainer.isVisible() );
	} );

	it( 'finds no placeholders for "These words" "None of these words" and "One of these words"', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();

		assert( SearchPage.searchTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchNotTheseWords.getPlaceholderText() === '' );
		assert( SearchPage.searchOneWord.getPlaceholderText() === '' );
	} );

	it( 'finds placeholder for "Exactly this text".', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();

		assert( SearchPage.searchExactText.getPlaceholderText() !== '' );
	} );

	it( 'displays "These words" as a pill field ', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test test2,' );

		assert.deepEqual( SearchPage.searchTheseWords.getTagLabels(), [ 'test', 'test2' ] );
	} );

	it( 'displays "One of these words" as a pill field', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchOneWord.put( 'testäöü test2äß, testme3\uE007' );

		assert.deepEqual( SearchPage.searchOneWord.getTagLabels(), [ 'testäöü', 'test2äß', 'testme3' ] );
	} );

	it( 'displays "None of these words" as a pill field', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchNotTheseWords.put( 'test test2,' );

		assert.deepEqual( SearchPage.searchNotTheseWords.getTagLabels(), [ 'test', 'test2' ] );
	} );

	it( 'submits the search on enter when there is no text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( '\uE007' );

		assert( SearchPage.formWasSubmitted() );
	} );

	it( 'does not submit the search on enter when there is text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test\uE007' );

		assert( !SearchPage.formWasSubmitted() );
	} );

	it( 'submits the search on double enter when there is text in "These Words" field', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test\uE007\uE007' );

		assert( SearchPage.formWasSubmitted() );
	} );

	it( 'submits the search with the correct search terms from all the pill fields', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'test,' );
		SearchPage.searchNotTheseWords.put( 'test3 ' );
		SearchPage.searchOneWord.put( 'test4 test5' );
		SearchPage.searchExactText.put( '"test1 test2"' );
		SearchPage.searchCategory.put( 'Help\uE007Me\uE007' );
		SearchPage.searchTemplate.put( 'Main Page\uE007' );
		SearchPage.submitForm();

		assert.equal( SearchPage.getSearchQueryFromUrl(), 'test "test1 test2" -test3 test4 OR test5 deepcat:Help deepcat:Me hastemplate:"Main Page"' );
	} );

	it( 'marks non-existent categories in red', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchCategory.put( 'I do not exist\uE007' );

		browser.waitUntil( function () {
			let color = SearchPage.getCategoryPillLink( 'I do not exist' ).getCssProperty( 'color' ).value;
			return color === 'rgba(186,0,0,1)';
		}, 10000, 'Timed out while waiting for the category pill link to turn red' );
	} );

	it( 'suggests existing categories when typing', function () {
		this.timeout( 60000 );
		browser.call( function () {
			return addExamplePages( 3 );
		} );

		browser.call( function () {
			return addCategory( 'Test' );
		} );

		SearchPage.open();
		SearchPage.toggleInputFields();

		SearchPage.searchCategory.put( 'Tes' );
		let suggestionBox = SearchPage.categorySuggestionsBox;
		suggestionBox.waitForVisible( 10000 );

		assert( suggestionBox.isVisible() );
	} );

	it( 'inserts inlanguage field only when the translate extension is installed', function () {
		SearchPage.open();

		if ( SpecialPage.translateExtensionLink.isVisible() ) {
			assert( SearchPage.searchInLanguage.isVisible() );
		} else {
			assert( !SearchPage.searchInLanguage.isVisible() );
		}
	} );

	it( 'submits the search with the specific chosen language', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'goat,' );
		SearchPage.searchInLanguage.choose( 'en' );
		SearchPage.submitForm();

		assert.equal( SearchPage.getSearchQueryFromUrl(), 'goat inlanguage:en' );
	} );

	it( 'submits the search without taking into consideration inlanguage if the default option is selected', function () {
		SearchPage.open();
		SearchPage.toggleInputFields();
		SearchPage.searchTheseWords.put( 'goat,' );
		SearchPage.searchInLanguage.choose( 'de' );
		SearchPage.searchInLanguage.choose( '' );
		SearchPage.submitForm();

		assert.equal( SearchPage.getSearchQueryFromUrl(), 'goat' );
	} );

	it( 'marks non-existent templates in red', function () {
		SearchPage.open();

		SearchPage.toggleInputFields();
		SearchPage.searchTemplate.put( 'Void\uE007' );

		browser.waitUntil( function () {
			let color = SearchPage.getTemplatePillLink( 'Void' ).getCssProperty( 'color' ).value;
			return color === 'rgba(186,0,0,1)';
		}, 10000, 'Timed out while waiting for the category pill link to turn red' );
	} );

	it( 'suggests existing templates when typing', function () {
		this.timeout( 60000 );

		browser.call( function () {
			return addTemplate( 'What is love?', 'Baby don\'t hurt me' );
		} );

		SearchPage.open();
		SearchPage.toggleInputFields();

		SearchPage.searchTemplate.put( 'What is lo' );
		let suggestionBox = SearchPage.templateSuggestionsBox;
		suggestionBox.waitForVisible( 10000 );

		assert( suggestionBox.isVisible() );
	} );

} );
