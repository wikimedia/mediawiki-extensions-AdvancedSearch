( function ( mw ) {
	var DeepCategory = mw.libs.advancedSearch.ui.DeepCategoryFilter,
		Model = mw.libs.advancedSearch.dm.SearchModel,
		store = new Model(),
		config = {
			optionId: 'deepcat',
			id: 'advancedSearch-deepcat'
		};

	QUnit.module( 'ext.advancedSearch.ui.DeepCategoryFilter' );

	QUnit.test( 'Placeholder is empty', function ( assert ) {

		var deepcat = new DeepCategory( store, config ),
			plcHolder = deepcat.$input.attr( 'placeholder' );

		assert.equal( plcHolder, '' );
	} );

	QUnit.test( 'Categories are set correctly', function ( assert ) {

		var deepcat = new DeepCategory( store, config ),
			categories = [ 'Help', 'Drawings' ];

		deepcat.setValue( categories );

		assert.deepEqual( deepcat.getValue(), categories );
	} );

	QUnit.test( 'Field updates when store changes', function ( assert ) {
		var deepcat = new DeepCategory( store, config );

		store.storeOption( 'deepcat', [ 'Bla' ] );
		assert.deepEqual( deepcat.getValue(), [ 'Bla' ] );

		store.storeOption( 'deepcat', [] );
		assert.deepEqual( deepcat.getValue(), [] );
	} );

}( mediaWiki ) );
