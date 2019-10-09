<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\TooltipGenerator;
use MediaWikiTestCase;

/**
 * @covers \AdvancedSearch\TooltipGenerator
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class TooltipGeneratorTest extends MediaWikiTestCase {

	protected function setUp() : void {
		parent::setUp();

		// Dummy language code makes sure no actual localization is loaded
		$this->setUserLang( 'qqx' );
	}

	public function testGenerateToolTips() {
		$tooltips = ( new TooltipGenerator() )->generateToolTips();

		$this->assertNotEmpty( $tooltips );
		foreach ( $tooltips as $messageKey => $html ) {
			$this->assertStringStartsWith( 'advancedsearch-help-', $messageKey );
			$this->assertStringStartsWith( '(advancedsearch-help-', $html );
		}
	}

}
