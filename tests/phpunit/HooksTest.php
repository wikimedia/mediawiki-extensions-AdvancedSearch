<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\Hooks;
use ExtensionRegistry;
use MediaWiki\Config\HashConfig;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\FauxRequest;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;
use MediaWikiIntegrationTestCase;
use MimeAnalyzer;
use RequestContext;
use Wikimedia\TestingAccessWrapper;

/**
 * @covers \AdvancedSearch\Hooks
 *
 * @group Database
 * @license GPL-2.0-or-later
 */
class HooksTest extends MediaWikiIntegrationTestCase {

	protected function setUp(): void {
		parent::setUp();

		// Dummy language code makes sure no actual localization is loaded
		$this->setUserLang( 'qqx' );

		$this->setMwGlobals( [
			'wgLanguageCode' => 'qqx',
			'wgNamespacesToBeSearchedDefault' => [ NS_MAIN => true ],
			'wgServer' => '//hooks.test'
		] );
	}

	public function testGetPreferencesHookHandler() {
		$preferences = [];

		( new Hooks() )->onGetPreferences( $this->newRegisteredUser(), $preferences );

		$this->assertArrayHasKey( 'advancedsearch-disable', $preferences );
	}

	public static function getDefaultNamespacesRespectsTrueFalseProvider() {
		return [
			'anonymous user' => [
				'expected' => [ NS_MAIN ],
				'isNamed' => false,
				'userOptionsns' => [],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => true, NS_TALK => false ],
			],
			'registered user, no user options' => [
				'expected' => [ NS_TALK ],
				'isNamed' => true,
				'userOptions' => [],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => false, NS_TALK => true ],
			],
			'registered user, with options' => [
				'expected' => [ NS_FILE ],
				'isNamed' => true,
				'userOptions' => [ 'searchNs6' => 1, 'searchNs0' => 0, 'searchNs1' => 0 ],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => false, NS_TALK => true ],
			],
		];
	}

	/**
	 * @dataProvider getDefaultNamespacesRespectsTrueFalseProvider
	 */
	public function testGetDefaultNamespacesRespectsTrueFalse(
		$expected, $isNamed, $userOptions, $namespacesToBeSearchedDefault
	) {
		if ( !$isNamed && $userOptions ) {
			$this->fail( 'Anonymous users cant have user options' );
		}

		$this->setMwGlobals( [
			'wgNamespacesToBeSearchedDefault' => $namespacesToBeSearchedDefault,
		] );

		$user = $isNamed ? $this->getTestUser()->getUser() : new User();
		$userOptionsManager = $this->getServiceContainer()->getUserOptionsManager();
		foreach ( $userOptions as $option => $value ) {
			$userOptionsManager->setOption( $user, $option, $value );
		}

		$this->assertSame( $expected, Hooks::getDefaultNamespaces( $user ) );
	}

	public function testSpecialSearchResultsPrependHandler() {
		$output = new OutputPage( new RequestContext() );
		$context = new RequestContext();
		$context->setOutput( $output );
		$context->setUser( $this->newAnonymousUser() );

		$special = \MediaWiki\MediaWikiServices::getInstance()
			->getSpecialPageFactory()
			->getPage( 'Search' );
		$special->setContext( $context );

		( new Hooks() )->onSpecialSearchResultsPrepend( $special, $output, '' );

		$this->assertStringContainsString( 'mw-search-spinner', $output->getHTML() );
	}

	public function testSpecialPageHookHandler_wrongSpecialPage() {
		$specialPage = $this->createMock( SpecialPage::class );
		$specialPage->expects( $this->never() )->method( 'getUser' );
		( new Hooks() )->onSpecialPageBeforeExecute( $specialPage, null );
	}

	public function testSpecialPageHookHandler_userOptedOut() {
		$user = $this->createMock( User::class );
		$userOptionsLookup = $this->createMock( UserOptionsLookup::class );
		$userOptionsLookup->method( 'getBoolOption' )->willReturn( true );
		$this->setService( 'UserOptionsLookup', $userOptionsLookup );
		$specialPage = $this->createMock( SpecialPage::class );
		$specialPage->method( 'getUser' )->willReturn( $user );
		$specialPage->expects( $this->never() )->method( 'getOutput' );
		( new Hooks() )->onSpecialPageBeforeExecute( $specialPage, null );
	}

	public function testGetJsConfigVars() {
		$this->mockMimeAnalyser();

		$extensionRegistry = $this->createMock( ExtensionRegistry::class );
		$extensionRegistry->method( 'isLoaded' )
			->with( 'Translate' )
			->willReturn( true );

		/** @var Hooks $hook */
		$hook = TestingAccessWrapper::newFromObject( new Hooks() );
		$vars = $hook->getJsConfigVars(
			new RequestContext(),
			new HashConfig( [
				'AdvancedSearchNamespacePresets' => '<NAMESPACEPRESETS>',
				'ExtensionAssetsPath' => '<PATH>',
				'FileExtensions' => [ '<EXT>' ],
				'AdvancedSearchDeepcatEnabled' => true
			] ),
			$extensionRegistry,
			$this->getServiceContainer()
		);

		// Integration test only, see MimeTypeConfiguratorTest for the full unit test
		$this->assertSame( [ '<EXT>' => '<MIME>' ], $vars['advancedSearch.mimeTypes'] );
		// Integration test only, see TooltipGeneratorTest for the full unit test
		$this->assertContainsOnly( 'string', $vars['advancedSearch.tooltips'] );

		$this->assertSame( '<NAMESPACEPRESETS>', $vars['advancedSearch.namespacePresets'] );
		$this->assertSame( true, $vars['advancedSearch.deepcategoryEnabled'] );

		$this->assertArrayHasKey( 'advancedSearch.languages', $vars );
	}

	public function testAdvancedSearchNoNamespaceRedirect() {
		$this->mockMimeAnalyser();

		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go&ns0=1',
			[ 'ns0' => 1 ]
		);

		( new Hooks() )->onSpecialPageBeforeExecute( $special, null );

		// Ensure that no namespace-related redirect was performed
		$this->assertSame( '', $special->getOutput()->getRedirect() );
	}

	public function testAdvancedSearchForcesNamespacedUrls() {
		$this->mockMimeAnalyser();

		// Search is missing namespace GET parameters like "&ns0=1"
		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go',
			[ 'search' => 'test' ]
		);

		$ret = ( new Hooks() )->onSpecialPageBeforeExecute( $special, null );
		$this->assertFalse( $ret );
		$this->assertSame(
			'http://hooks.test/w/index.php?search=test&title=Special%3ASearch&go=Go&ns0=1',
			$special->getOutput()->getRedirect()
		);
	}

	public function testAdvancedSearchForcesNamespacedUrlsForDirectPageAccess() {
		$this->mockMimeAnalyser();

		// Search is missing namespace GET parameters like "&ns0=1"
		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/wiki/Special%3ASearch',
			[ 'search' => 'test' ]
		);

		$ret = ( new Hooks() )->onSpecialPageBeforeExecute( $special, null );
		$this->assertFalse( $ret );

		$this->assertSame(
			'http://hooks.test/wiki/Special%3ASearch?ns0=1',
			$special->getOutput()->getRedirect()
		);
	}

	public function testAdvancedSearchForcesUserSpecificNamespacedUrls() {
		$this->mockMimeAnalyser();

		// Search is missing namespace GET parameters like "&ns0=1"
		$special = $this->newSpecialSearchPage(
			$this->newRegisteredUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go',
			[ 'search' => 'test' ]
		);

		$ret = ( new Hooks() )->onSpecialPageBeforeExecute( $special, null );
		$this->assertFalse( $ret );

		$this->assertSame(
			'http://hooks.test/w/index.php?search=test&title=Special%3ASearch&go=Go&ns0=1&ns6=1&ns10=1',
			$special->getOutput()->getRedirect()
		);
	}

	/**
	 * @param User $user
	 * @param string $url
	 * @param array $requestValues
	 * @return SpecialPage
	 */
	private function newSpecialSearchPage( User $user, $url, $requestValues = [] ) {
		$output = new OutputPage( new RequestContext() );
		$request = new FauxRequest( $requestValues );
		$request->setRequestURL( $url );
		$context = new RequestContext();
		$context->setOutput( $output );
		$context->setUser( $user );
		$context->setRequest( $request );
		$special = new SpecialPage( 'Search' );
		$special->setContext( $context );
		return $special;
	}

	/**
	 * @return User
	 */
	private function newAnonymousUser() {
		return new User();
	}

	/**
	 * @return User
	 */
	private function newRegisteredUser() {
		$user = new User();
		$userOptionsManager = $this->getServiceContainer()->getUserOptionsManager();
		$userOptionsManager->setOption( $user, 'searchNs0', true );
		$userOptionsManager->setOption( $user, 'searchNs6', true );
		$userOptionsManager->setOption( $user, 'searchNs10', true );
		return $user;
	}

	private function mockMimeAnalyser() {
		$mock = $this->createNoOpMock( MimeAnalyzer::class, [ 'getMimeTypeFromExtensionOrNull' ] );
		$mock->method( 'getMimeTypeFromExtensionOrNull' )->willReturn( '<MIME>' );
		$this->setService( 'MimeAnalyzer', $mock );
	}
}
