( function ( mw ) {
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

}( mediaWiki ) );
