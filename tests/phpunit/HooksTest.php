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
		Hooks::onGetPreferences( $this->newUser(), $preferences );

		$this->assertArrayHasKey( 'advancedsearch-disable', $preferences );
		$this->assertFalse( $preferences['advancedsearch-disable']['default'] );
	}

	public function testSpecialSearchResultsPrependHandler() {
		$output = new OutputPage( new RequestContext() );
		$context = new RequestContext();
		$context->setOutput( $output );
		$context->setUser( $this->newUser() );
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

		$output = new OutputPage( new RequestContext() );
		$context = new RequestContext();
		$context->setOutput( $output );
		$context->setUser( $this->newUser() );
		$special = new SpecialPage( 'Search' );
		$special->setContext( $context );

		Hooks::onSpecialPageBeforeExecute( $special, '' );

		$vars = $output->getJsConfigVars();

		$this->assertArrayHasKey( 'advancedSearch.mimeTypes', $vars );
		// Integration test only, see MimeTypeConfiguratorTest for the full unit test
		$this->assertSame( [ '<EXT>' => '' ], $vars['advancedSearch.mimeTypes'] );

		$this->assertArrayHasKey( 'advancedSearch.tooltips', $vars );
		// Integration test only, see TooltipGeneratorTest for the full unit test
		$this->assertContainsOnly( 'string', $vars['advancedSearch.tooltips'] );

		$this->assertArrayHasKey( 'advancedSearch.namespacePresets', $vars );
		$this->assertSame( '<NAMESPACEPRESETS>', $vars['advancedSearch.namespacePresets'] );
	}

	/**
	 * @return User
	 */
	private function newUser() {
		$mock = $this->getMockBuilder( User::class )->disableOriginalConstructor()->getMock();
		// Act like the user has all options disabled
		$mock->method( 'getBoolOption' )->willReturn( false );
		return $mock;
	}

}
