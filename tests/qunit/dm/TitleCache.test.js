( function () {
	var TitleCache = mw.libs.advancedSearch.dm.TitleCache;

	QUnit.module( 'ext.advancedSearch.dm.TitleCache' );

	QUnit.test( 'Getting and setting page names allows lowercase', function ( assert ) {
		var cache = new TitleCache();
		cache.set( 'foo', 'OK' );

		assert.strictEqual( cache.get( 'foo' ), 'OK' );
		assert.strictEqual( cache.get( 'Foo' ), 'OK' );
	} );

	QUnit.test( 'Checking for value existence allows lowercase', function ( assert ) {
		var cache = new TitleCache();
		cache.set( 'foo', 'OK' );

		assert.ok( cache.has( 'foo' ) );
		assert.ok( cache.has( 'Foo' ) );
		assert.notOk( cache.has( 'bar' ) );
	} );

	QUnit.test( 'Different namespace does make a difference', function ( assert ) {
		var cache = new TitleCache();
		cache.set( 'Template:Foo', 'OK' );

		assert.ok( cache.has( 'Template:Foo' ) );
		assert.notOk( cache.has( 'User:Foo' ) );
	} );

	QUnit.test( 'Different file name extension does make a difference', function ( assert ) {
		var cache = new TitleCache();
		cache.set( 'File name.jpg', 'OK' );

		assert.ok( cache.has( 'File name.jpg' ) );
		assert.notOk( cache.has( 'File name.svg' ) );
	} );

}() );
