<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\SearchableNamespaceListBuilder;
use PHPUnit\Framework\TestCase;

/**
 * @covers \AdvancedSearch\SearchableNamespaceListBuilder
 *
 * @license GPL-2.0-or-later
 */
class SearchableNamespaceListBuilderTest extends TestCase {

	public function testGetCuratedNamespaces() {
		$configNamespaces = [
			0 => '',
			1 => 'Some Namespace',
			5 => '',
			123 => 'Some other namespace',
			500 => 'Yet another namespace',
			550 => ''
		];
		$expected = [
			0 => '(Main)',
			1 => 'Some Namespace',
			123 => 'Some other namespace',
			500 => 'Yet another namespace'
		];

		$actual = SearchableNamespaceListBuilder::getCuratedNamespaces( $configNamespaces );
		$this->assertSame( $expected, $actual );
	}

}
