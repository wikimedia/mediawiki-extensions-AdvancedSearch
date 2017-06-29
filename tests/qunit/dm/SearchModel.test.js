( function ( mw ) {
	var SearchModel = mw.libs.advancedSearch.dm.SearchModel;

	QUnit.module( 'ext.advancedSearch.dm.SearchModel' );

	QUnit.test( 'Default model is has no options', function ( assert ) {
		var model = new SearchModel();
		assert.deepEqual( model.getOptions(), {} );
	} );

	QUnit.test( 'Default model has article namespace', function ( assert ) {
		var model = new SearchModel();
		assert.deepEqual( model.getNamespaces(), [ '0' ] );
	} );

	QUnit.test( 'Setting options works', function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'not', 'octopi' );
		model.storeOption( 'prefix', 'Page' );
		assert.deepEqual( model.getOptions(), {
			not: 'octopi',
			prefix: 'Page'
		} );
	} );

	function createModelWithValues() {
		var model = new SearchModel();
		model.storeOption( 'not', 'octopi' );
		model.storeOption( 'prefix', 'Page' );
		model.setNamespaces( [ 1, 3 ] );
		return model;
	}

	QUnit.test( 'Setting empty JSON string does nothing', function ( assert ) {
		var model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '' );

		assert.deepEqual( model.getOptions(), expected.getOptions() );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting invalid JSON string does nothing', function ( assert ) {
		var model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '{ "unclosed_string": "str }' );

		assert.deepEqual( model.getOptions(), expected.getOptions() );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting valid JSON overrides previous state', function ( assert ) {
		var model = createModelWithValues();
		model.setAllFromJSON( '{"options":{"or":[ "fish", "turtle" ],"prefix":"Sea"},"namespaces":[0,2]}' );

		assert.deepEqual( model.getOptions(), {
			or: [ 'fish', 'turtle' ],
			prefix: 'Sea'
		} );
		assert.deepEqual( model.getNamespaces(), [ 0, 2 ] );
	} );

}( mediaWiki ) );
