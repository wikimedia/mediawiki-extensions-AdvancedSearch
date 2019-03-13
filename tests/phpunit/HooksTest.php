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
	}

	public function testGetPreferencesHookHandler() {
		$preferences = [];
		Hooks::onGetPreferences( $this->newRegisteredUser(), $preferences );

		$this->assertArrayHasKey( 'advancedsearch-disable', $preferences );
		$this->assertFalse( $preferences['advancedsearch-disable']['default'] );
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
		$mock = $this->getMockBuilder( User::class )->disableOriginalConstructor()->getMock();
		$mock->method( 'isAnon' )->willReturn( true );
		return $mock;
	}

	/**
	 * @return User
	 */
	private function newRegisteredUser() {
		$mock = $this->getMockBuilder( User::class )->disableOriginalConstructor()->getMock();
		// Act like the user has all fields disabled
		$mock->method( 'getBoolOption' )->willReturn( false );
		$mock->method( 'isAnon' )->willReturn( false );
		$mock->mOptions = [ 'searchNs0' => 0, 'searchNs6' => 1, 'searchNs10' => 1 ];
		return $mock;
	}
}
