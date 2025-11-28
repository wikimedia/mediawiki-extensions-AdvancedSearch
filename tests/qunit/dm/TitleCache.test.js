'use strict';
( function () {
	const { TitleCache } = require( 'ext.advancedSearch.SearchFieldUI' );

	QUnit.module( 'ext.advancedSearch.dm.TitleCache' );

	QUnit.test( 'Getting and setting page names allows lowercase', ( assert ) => {
		const cache = new TitleCache();
		cache.set( 'foo', false );

		assert.strictEqual( cache.exists( 'foo' ), false );
		assert.strictEqual( cache.exists( 'Foo' ), false );
	} );

	QUnit.test( 'Checking for value existence allows lowercase', ( assert ) => {
		const cache = new TitleCache();
		cache.set( 'foo' );

		assert.true( cache.has( 'foo' ) );
		assert.true( cache.has( 'Foo' ) );
		assert.false( cache.has( 'bar' ) );
	} );

	QUnit.test( 'Different namespace does make a difference', ( assert ) => {
		const cache = new TitleCache();
		cache.set( 'Template:Foo' );

		assert.true( cache.has( 'Template:Foo' ) );
		assert.false( cache.has( 'User:Foo' ) );
	} );

	QUnit.test( 'Different file name extension does make a difference', ( assert ) => {
		const cache = new TitleCache();
		cache.set( 'File name.jpg' );

		assert.true( cache.has( 'File name.jpg' ) );
		assert.false( cache.has( 'File name.svg' ) );
	} );
}() );
