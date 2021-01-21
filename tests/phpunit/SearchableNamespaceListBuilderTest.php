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

	public function testMainNamespaceAddedToList() {
		$curatedNamespaces = SearchableNamespaceListBuilder::getCuratedNamespaces(
			$this->getSampleNamespaces()
		);

		$this->assertSame( '(Main)', $curatedNamespaces[0] );
	}

	public function testEmptyNamespacesAreFiltered() {
		$curatedNamespaces = SearchableNamespaceListBuilder::getCuratedNamespaces(
			$this->getSampleNamespaces()
		);

		$this->assertSame( $this->getCuratedSampleNamespaces(), $curatedNamespaces );
	}

	private function getSampleNamespaces() {
		return [
			1 => 'Some Namespace',
			5 => '',
			123 => 'Some other namespace',
			500 => 'Yet another namespace',
			550 => ''
		];
	}

	private function getCuratedSampleNamespaces() {
		return [
			0 => '(Main)',
			1 => 'Some Namespace',
			123 => 'Some other namespace',
			500 => 'Yet another namespace'
		];
	}
}
