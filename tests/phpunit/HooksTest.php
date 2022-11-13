<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\Hooks;
use HashConfig;
use MediaWiki\User\UserOptionsLookup;
use MediaWikiIntegrationTestCase;
use MimeAnalyzer;
use OutputPage;
use RequestContext;
use SpecialPage;
use User;

/**
 * @covers \AdvancedSearch\Hooks
 *
 * @license GPL-2.0-or-later
 */
class HooksTest extends MediaWikiIntegrationTestCase {

	/**
	 * @var Hooks
	 */
	private $hook;

	protected function setUp(): void {
		parent::setUp();

		// Dummy language code makes sure no actual localization is loaded
		$this->setUserLang( 'qqx' );

		$this->overrideMwServices( new HashConfig( [
			// Intentional dummy values just to make sure they appear in the assertions below
			'AdvancedSearchNamespacePresets' => '<NAMESPACEPRESETS>',
			'ExtensionAssetsPath' => '<PATH>',
			'FileExtensions' => [ '<EXT>' ],
		] ) );
		$this->setMwGlobals( [
			'wgLanguageCode' => 'qqx',
			'wgNamespacesToBeSearchedDefault' => [ NS_MAIN => true ],
			'wgServer' => '//hooks.test'
		] );
		$this->hook = new Hooks();
	}

	public function testGetPreferencesHookHandler() {
		$preferences = [];

		$this->hook->onGetPreferences( $this->newRegisteredUser(), $preferences );

		$this->assertArrayHasKey( 'advancedsearch-disable', $preferences );
	}

	public function getDefaultNamespacesRespectsTrueFalseProvider() {
		return [
			'anonymous user' => [
				'expected' => [ NS_MAIN ],
				'isRegistered' => false,
				'userOptionsns' => [],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => true, NS_TALK => false ],
			],
			'registered user, no user options' => [
				'expected' => [ NS_TALK ],
				'isRegistered' => true,
				'userOptions' => [],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => false, NS_TALK => true ],
			],
			'registered user, with options' => [
				'expected' => [ NS_FILE ],
				'isRegistered' => true,
				'userOptions' => [ 'searchNs6' => 1, 'searchNs0' => 0, 'searchNs1' => 0 ],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => false, NS_TALK => true ],
			],
		];
	}

	/**
	 * @dataProvider getDefaultNamespacesRespectsTrueFalseProvider
	 */
	public function testGetDefaultNamespacesRespectsTrueFalse(
		$expected, $isRegistered, $userOptions, $namespacesToBeSearchedDefault
	) {
		if ( !$isRegistered && $userOptions ) {
			$this->fail( 'Anonymous users cant have user options' );
		}

		$this->setMwGlobals( [
			'wgNamespacesToBeSearchedDefault' => $namespacesToBeSearchedDefault,
		] );

		$user = $isRegistered ? $this->getTestUser()->getUser() : new User();
		$userOptionsManager = $this->getServiceContainer()->getUserOptionsManager();
		foreach ( $userOptions as $option => $value ) {
			$userOptionsManager->setOption( $user, $option, $value );
		}

		$this->assertSame( $isRegistered, $user->isRegistered() );
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

		$this->hook->onSpecialSearchResultsPrepend( $special, $output, '' );

		$this->assertStringContainsString( 'mw-search-spinner', $output->getHTML() );
	}

	public function testSpecialPageHookHandler_wrongSpecialPage() {
		$specialPage = $this->createMock( SpecialPage::class );
		$specialPage->expects( $this->never() )->method( 'getUser' );
		$this->hook->onSpecialPageBeforeExecute( $specialPage, null );
	}

	public function testSpecialPageHookHandler_userOptedOut() {
		$user = $this->createMock( User::class );
		$userOptionsLookup = $this->createMock( UserOptionsLookup::class );
		$userOptionsLookup->method( 'getBoolOption' )->willReturn( true );
		$this->setService( 'UserOptionsLookup', $userOptionsLookup );
		$specialPage = $this->createMock( SpecialPage::class );
		$specialPage->method( 'getUser' )->willReturn( $user );
		$specialPage->expects( $this->never() )->method( 'getOutput' );
		$this->hook->onSpecialPageBeforeExecute( $specialPage, null );
	}

	public function testSpecialPageBeforeExecuteHookHandler() {
		$this->mockMimeAnalyser();

		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go&ns0=1',
			[ 'ns0' => 1 ]
		);

		$this->hook->onSpecialPageBeforeExecute( $special, null );

		// Ensure that no namespace-related redirect was performed
		$this->assertSame( '', $special->getOutput()->getRedirect() );

		$vars = $special->getOutput()->getJsConfigVars();

		$this->assertArrayHasKey( 'advancedSearch.mimeTypes', $vars );
		// Integration test only, see MimeTypeConfiguratorTest for the full unit test
		$this->assertSame( [ '<EXT>' => '' ], $vars['advancedSearch.mimeTypes'] );

		$this->assertArrayHasKey( 'advancedSearch.tooltips', $vars );
		// Integration test only, see TooltipGeneratorTest for the full unit test
		$this->assertContainsOnly( 'string', $vars['advancedSearch.tooltips'] );

		$this->assertArrayHasKey( 'advancedSearch.namespacePresets', $vars );
		$this->assertSame( '<NAMESPACEPRESETS>', $vars['advancedSearch.namespacePresets'] );
	}

	public function testAdvancedSearchForcesNamespacedUrls() {
		$this->mockMimeAnalyser();

		// Search is missing namespace GET parameters like "&ns0=1"
		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go',
			[ 'search' => 'test' ]
		);

		$ret = $this->hook->onSpecialPageBeforeExecute( $special, null );
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

		$ret = $this->hook->onSpecialPageBeforeExecute( $special, null );
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

		$ret = $this->hook->onSpecialPageBeforeExecute( $special, null );
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
		$request = new \FauxRequest( $requestValues );
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
		$this->setService(
			'MimeAnalyzer',
			$this->getMockBuilder( MimeAnalyzer::class )
				->onlyMethods( [ 'getMimeTypeFromExtensionOrNull' ] )
				->disableOriginalConstructor()
				->getMock()
		);
	}
}
