<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\MimeTypeConfigurator;
use MimeAnalyzer;
use PHPUnit\Framework\TestCase;

/**
 * @covers \AdvancedSearch\MimeTypeConfigurator
 *
 * @license GPL-2.0-or-later
 */
class MimeTypeConfiguratorTest extends TestCase {

	private const EXT_SINGLE_MIMETYPE = 'singletype';
	private const EXT_MULTIPLE_MIMETYPES = 'multitype';
	private const EXT_SAME_MIMETYPE = 'same1';
	private const OTHER_EXT_SAME_MIMETYPE = 'same2';

	public function testConfiguratorReturnsMimeTypeForFileExtension() {
		$configurator = new MimeTypeConfigurator( $this->newMimeAnalyzerMock() );
		$this->assertSame(
			[ self::EXT_SINGLE_MIMETYPE => 'test' ],
			$configurator->getMimeTypes( [ self::EXT_SINGLE_MIMETYPE ] )
		);
	}

	public function testConfiguratorAlwaysUsesTheFirstMimeType() {
		$configurator = new MimeTypeConfigurator( $this->newMimeAnalyzerMock() );
		$this->assertSame(
			[ self::EXT_MULTIPLE_MIMETYPES => 'one' ],
			$configurator->getMimeTypes( [ self::EXT_MULTIPLE_MIMETYPES ] )
		);
	}

	public function testConfiguratorDoesNotAllowRedundantEntries() {
		$configurator = new MimeTypeConfigurator( $this->newMimeAnalyzerMock() );
		$this->assertSame(
			[ self::EXT_SAME_MIMETYPE => 'mime' ],
			$configurator->getMimeTypes( [ self::EXT_SAME_MIMETYPE, self::OTHER_EXT_SAME_MIMETYPE ] )
		);
	}

	/**
	 * @return MimeAnalyzer
	 */
	private function newMimeAnalyzerMock() {
		$mock = $this->getMockBuilder( MimeAnalyzer::class )->disableOriginalConstructor()->getMock();
		$mock->method( 'getMimeTypeFromExtensionOrNull' )->will(
			$this->returnValueMap( [
				[ self::EXT_SINGLE_MIMETYPE, 'test' ],
				[ self::EXT_MULTIPLE_MIMETYPES, 'one' ],
				[ self::EXT_SAME_MIMETYPE, 'mime' ],
				[ self::OTHER_EXT_SAME_MIMETYPE, 'mime' ]
			] )
		);
		return $mock;
	}

}
