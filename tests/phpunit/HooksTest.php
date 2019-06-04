<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\Hooks;
use HashConfig;
use MediaWikiTestCase;
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
class HooksTest extends MediaWikiTestCase {

	protected function setUp() {
		parent::setUp();

		// Dummy language code makes sure no actual localization is loaded
		$this->setUserLang( 'qqx' );

		$this->overrideMwServices( new HashConfig( [
			// Intentional dummy values just to make sure they appear in the assertions below
			'AdvancedSearchNamespacePresets' => '<NAMESPACEPRESETS>',
			'ExtensionAssetsPath' => '<PATH>',
			'FileExtensions' => [ '<EXT>' ],
		] ) );
		$this->setMwGlobals( 'wgNamespacesToBeSearchedDefault', [ NS_MAIN => true ] );
	}

	public function testGetPreferencesHookHandler() {
		$preferences = [];
		Hooks::onGetPreferences( $this->newRegisteredUser(), $preferences );

		$this->assertArrayHasKey( 'advancedsearch-disable', $preferences );
		$this->assertFalse( $preferences['advancedsearch-disable']['default'] );
	}

	public function getDefaultNamespacesRespectsTrueFalseProvider() {
		return [
			'anonymous user' => [
				'expected' => [ NS_MAIN ],
				'isAnon' => true,
				'userOptionsns' => [],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => true, NS_TALK => false ],
			],
			'registered user, no user options' => [
				'expected' => [ NS_TALK ],
				'isAnon' => false,
				'userOptions' => [],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => false, NS_TALK => true ],
			],
			'registered user, with options' => [
				'expected' => [ NS_FILE ],
				'isAnon' => false,
				'userOptions' => [ 'searchNs6' => 1, 'searchNs0' => 0, 'searchNs1' => 0 ],
				'namespacesToBeSearchedDefault' => [ NS_MAIN => false, NS_TALK => true ],
			],
		];
	}

	/**
	 * @dataProvider getDefaultNamespacesRespectsTrueFalseProvider
	 */
	public function testGetDefaultNamespacesRespectsTrueFalse(
		$expected, $isAnon, $userOptions, $namespacesToBeSearchedDefault
	) {
		$this->setMwGlobals( [
			'wgNamespacesToBeSearchedDefault' => $namespacesToBeSearchedDefault,
		] );
		if ( $isAnon ) {
			if ( $userOptions ) {
				$this->fail( 'Anonymous users cant have user options' );
			}
			$user = new User();
		} else {
			$user = $this->getTestUser()->getUser();
			foreach ( $userOptions as $option => $value ) {
				$user->setOption( $option, $value );
			}
		}
		$this->assertEquals( $isAnon, $user->isAnon() );
		$this->assertEquals( $expected, Hooks::getDefaultNamespaces( $user ) );
	}

	public function testSpecialSearchResultsPrependHandler() {
		$output = new OutputPage( new RequestContext() );
		$context = new RequestContext();
		$context->setOutput( $output );
		$context->setUser( $this->newAnonymousUser() );
		$special = new \SpecialSearch();
		$special->setContext( $context );

		Hooks::onSpecialSearchResultsPrepend( $special, $output, '' );

		$this->assertContains( 'mw-search-spinner', $output->getHTML() );
	}

	public function testSpecialPageBeforeExecuteHookHandler() {
		$this->setService(
			'MimeAnalyzer',
			$this->getMock( MimeAnalyzer::class, [ 'getTypesForExtension' ], [], '', false )
		);

		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go&ns0=1',
			[ 'ns0' => 1 ]
		);

		Hooks::onSpecialPageBeforeExecute( $special, '' );

		// Ensure that no namespace-related redirect was performed
		$this->assertEquals( '', $special->getOutput()->getRedirect() );

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
		$this->setService(
			'MimeAnalyzer',
			$this->getMock( MimeAnalyzer::class, [ 'getTypesForExtension' ], [], '', false )
		);

		// Search is missing namespace GET parameters like "&ns0=1"
		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go',
			[]
		);

		Hooks::onSpecialPageBeforeExecute( $special, '' );

		$this->assertEquals(
			wfGetServerUrl( PROTO_CURRENT ) .
			'/w/index.php?search=test&title=Special%3ASearch&go=Go&ns0=1',
			$special->getOutput()->getRedirect()
		);
	}

	public function testAdvancedSearchForcesNamespacedUrlsForDirectPageAccess() {
		$this->setService(
			'MimeAnalyzer',
			$this->getMock( MimeAnalyzer::class, [ 'getTypesForExtension' ], [], '', false )
		);

		// Search is missing namespace GET parameters like "&ns0=1"
		$special = $this->newSpecialSearchPage(
			$this->newAnonymousUser(),
			'/wiki/Special%3ASearch',
			[]
		);

		Hooks::onSpecialPageBeforeExecute( $special, '' );

		$this->assertEquals(
			wfGetServerUrl( PROTO_CURRENT ) .
			'/wiki/Special%3ASearch?ns0=1',
			$special->getOutput()->getRedirect()
		);
	}

	public function testAdvancedSearchForcesUserSpecificNamespacedUrls() {
		$this->setService(
			'MimeAnalyzer',
			$this->getMock( MimeAnalyzer::class, [ 'getTypesForExtension' ], [], '', false )
		);

		// Search is missing namespace GET parameters like "&ns0=1"
		$special = $this->newSpecialSearchPage(
			$this->newRegisteredUser(),
			'/w/index.php?search=test&title=Special%3ASearch&go=Go',
			[]
		);

		Hooks::onSpecialPageBeforeExecute( $special, '' );

		$this->assertEquals(
			wfGetServerUrl( PROTO_CURRENT ) .
			'/w/index.php?search=test&title=Special%3ASearch&go=Go&ns0=1&ns6=1&ns10=1',
			$special->getOutput()->getRedirect()
		);
	}

	/**
	 * @param string $url
	 * @param array $requestValues
	 * @return SpecialPage
	 * @throws \MWException
	 */
	private function newSpecialSearchPage( $user, $url, $requestValues = [] ) {
		$output = new OutputPage( new RequestContext() );
		$request = new \FauxRequest();
		$request->setRequestURL( $url );
		foreach ( $requestValues as $key => $value ) {
			$request->setVal( $key, $value );
		}
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
		$user->setOption( 'searchNs0', true );
		$user->setOption( 'searchNs6', true );
		$user->setOption( 'searchNs10', true );
		return $user;
	}

}
