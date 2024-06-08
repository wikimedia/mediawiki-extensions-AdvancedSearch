<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\TooltipGenerator;
use MediaWiki\Message\Message;
use MediaWikiIntegrationTestCase;
use MessageLocalizer;

/**
 * @covers \AdvancedSearch\TooltipGenerator
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class TooltipGeneratorTest extends MediaWikiIntegrationTestCase {

	public function testGenerateToolTips() {
		$messageLocalizer = $this->createMock( MessageLocalizer::class );
		$messageLocalizer->method( 'msg' )->willReturnCallback( function ( $key ) {
			$msg = $this->createMock( Message::class );
			$msg->method( 'parse' )->willReturn( "($key)" );
			return $msg;
		} );

		$tooltips = ( new TooltipGenerator( $messageLocalizer ) )->generateTooltips();

		$this->assertNotEmpty( $tooltips );
		foreach ( $tooltips as $messageKey => $html ) {
			$this->assertStringStartsWith( 'advancedsearch-help-', $messageKey );
			$this->assertSame( "($messageKey)", $html );
		}
	}

}
