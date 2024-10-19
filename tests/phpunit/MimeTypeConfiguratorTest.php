<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\MimeTypeConfigurator;
use PHPUnit\Framework\TestCase;
use Wikimedia\Mime\MimeAnalyzer;

/**
 * @covers \AdvancedSearch\MimeTypeConfigurator
 *
 * @license GPL-2.0-or-later
 */
class MimeTypeConfiguratorTest extends TestCase {

	public function testGetMimeTypes() {
		$fileExtensions = [
			// Expected to skip unknown extensions
			'unknown',
			// Expected to stick to the first extension when they have the same MIME type
			'jpg',
			'jpeg',
		];
		$fileExtensionToMimeTypeMap = [
			// The order here doesn't matter, it's just a lookup map
			'jpg' => 'MIME/jpeg',
			'jpeg' => 'MIME/jpeg',
		];
		$expected = [
			'jpg' => 'MIME/jpeg',
		];

		$analyzer = $this->createMock( MimeAnalyzer::class );
		$analyzer->method( 'getMimeTypeFromExtensionOrNull' )
			->willReturnCallback( fn ( $ext ) => $fileExtensionToMimeTypeMap[$ext] ?? null );

		$configurator = new MimeTypeConfigurator( $analyzer );
		$this->assertSame( $expected, $configurator->getMimeTypes( $fileExtensions ) );
	}

}
