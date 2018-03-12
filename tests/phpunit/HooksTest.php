<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\Hooks;
use ExtensionRegistry;
use HashConfig;
use MediaWikiTestCase;
use MimeAnalyzer;
use OutputPage;
use RequestContext;
use ResourceLoader;
use SpecialPage;
use User;

/**
 * @covers \AdvancedSearch\Hooks
 */
class HooksTest extends MediaWikiTestCase {

	protected function setUp() {
		parent::setUp();

		// Dummy language code makes sure no actual localization is loaded
		$this->setUserLang( 'qqx' );

		$this->overrideMwServices( new HashConfig( [
			'AdvancedSearchBetaFeature' => true,
			// Intentional dummy values just to make sure they appear in the assertions below
			'AdvancedSearchNamespacePresets' => '<NAMESPACEPRESETS>',
			'ExtensionAssetsPath' => '<PATH>',
			'FileExtensions' => [ '<EXT>' ],
		] ) );
	}

	public function testGetBetaFeaturePreferencesHookHandler() {
		$prefs = [];
		Hooks::getBetaFeaturePreferences( $this->newUser(), $prefs );

		$this->assertArrayHasKey( 'advancedsearch', $prefs );
		$this->assertStringStartsWith( '<PATH>/', $prefs['advancedsearch']['screenshot']['ltr'] );
		$this->assertStringStartsWith( '<PATH>/', $prefs['advancedsearch']['screenshot']['rtl'] );
	}

	public function testResourceLoaderTestModulesHookHandler() {
		$rl = $this->getMockBuilder( ResourceLoader::class )->disableOriginalConstructor()->getMock();

		$testModules = [];
		Hooks::onResourceLoaderTestModules( $testModules, $rl );

		$this->assertNotEmpty( $testModules );
	}

	public function testSpecialPageBeforeExecuteHookHandler() {
		if ( ExtensionRegistry::getInstance()->isLoaded( 'BetaFeatures' ) ) {
			$this->setMwGlobals( 'BetaFeaturesWhitelist', [ 'advancedsearch' ] );
		}

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
		// Act like the user has all options enabled
		$mock->method( 'getOption' )->willReturn( '1' );
		return $mock;
	}

}
