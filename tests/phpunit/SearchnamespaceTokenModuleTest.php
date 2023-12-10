<?php

namespace AdvancedSearch\Tests;

use AdvancedSearch\SearchnamespaceTokenModule;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\User\User;
use PHPUnit\Framework\TestCase;

/**
 * @covers \AdvancedSearch\SearchnamespaceTokenModule
 *
 * @license GPL-2.0-or-later
 * @author Thiemo Kreuz
 */
class SearchnamespaceTokenModuleTest extends TestCase {

	public function testResourceLoaderModule() {
		$module = new SearchnamespaceTokenModule();

		$user = $this->createMock( User::class );
		$user->method( 'getEditToken' )->with( 'searchnamespace' )->willReturn( '<TOKEN>' );

		$context = $this->createMock( Context::class );
		$context->method( 'getUserObj' )->willReturn( $user );

		$script = $module->getScript( $context );
		$this->assertStringContainsString( 'searchnamespaceToken', $script, 'token name is set' );
		$this->assertStringContainsString( '\u003CTOKEN\u003E', $script, 'token is escaped' );

		$this->assertFalse( $module->supportsURLLoading(), 'supportsURLLoading' );
		$this->assertSame( 'private', $module->getGroup(), 'getGroup' );
	}

}
