<?php

namespace AdvancedSearch;

use MimeAnalyzer;
use PHPUnit\Framework\TestCase;
use PHPUnit_Framework_MockObject_MockObject;

/**
 * @covers \AdvancedSearch\MimeTypeConfigurator
 */
class MimeTypeConfiguratorTest extends TestCase {

	const EXT_SINGLE_MIMETYPE = 'singletype';
	const EXT_MULTIPLE_MIMETYPES = 'multitype';
	const EXT_SAME_MIMETYPE = 'same1';
	const OTHER_EXT_SAME_MIMETYPE = 'same2';

	public function testConfiguratorReturnsMimeTypeForFileExtension() {
		$configurator = new MimeTypeConfigurator( $this->newMimeAnalyzerMock() );
		$this->assertEquals(
			[ self::EXT_SINGLE_MIMETYPE => 'test' ],
			$configurator->getMimeTypes( [ self::EXT_SINGLE_MIMETYPE ] )
		);
	}

	public function testConfiguratorAlwaysUsesTheFirstMimeType() {
		$configurator = new MimeTypeConfigurator( $this->newMimeAnalyzerMock() );
		$this->assertEquals(
			[ self::EXT_MULTIPLE_MIMETYPES => 'one' ],
			$configurator->getMimeTypes( [ self::EXT_MULTIPLE_MIMETYPES ] )
		);
	}

	public function testConfiguratorDoesNotAllowRedundantEntries() {
		$configurator = new MimeTypeConfigurator( $this->newMimeAnalyzerMock() );
		$this->assertEquals(
			[ self::EXT_SAME_MIMETYPE => 'mime' ],
			$configurator->getMimeTypes( [ self::EXT_SAME_MIMETYPE, self::OTHER_EXT_SAME_MIMETYPE ] )
		);
	}

	/**
	 * @return MimeAnalyzer|PHPUnit_Framework_MockObject_MockObject
	 */
	private function newMimeAnalyzerMock() {
		$mock = $this->getMockBuilder( MimeAnalyzer::class )->disableOriginalConstructor()->getMock();
		$mock->method( 'getTypesForExtension' )->will(
			$this->returnValueMap( [
				[ self::EXT_SINGLE_MIMETYPE, 'test' ],
				[ self::EXT_MULTIPLE_MIMETYPES, 'one two' ],
				[ self::EXT_SAME_MIMETYPE, 'mime' ],
				[ self::OTHER_EXT_SAME_MIMETYPE, 'mime' ]
			] )
		);
		return $mock;
	}

}
