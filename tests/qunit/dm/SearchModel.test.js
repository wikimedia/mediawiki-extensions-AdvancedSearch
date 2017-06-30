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
		model.setNamespaces( [ '1', '3' ] );
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
		model.setAllFromJSON( '{"options":{"or":[ "fish", "turtle" ],"prefix":"Sea"},"namespaces":["0","2"]}' );

		assert.deepEqual( model.getOptions(), {
			or: [ 'fish', 'turtle' ],
			prefix: 'Sea'
		} );
		assert.deepEqual( model.getNamespaces(), [ '0', '2' ] );
	} );

	QUnit.test( 'Namespaces default to main namespace out of the box', function ( assert ) {
		var model = new SearchModel();
		assert.deepEqual( model.getNamespaces(), [ SearchModel.MAIN_NAMESPACE ] );
	} );

	QUnit.test( 'Setting namespaces to empty keeps default namespace', function ( assert ) {
		var model = new SearchModel();
		model.setNamespaces( [] );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.MAIN_NAMESPACE ] );
	} );

	QUnit.test( 'Adding filetype option forces file namespace', function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'filetype', 'image' );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.MAIN_NAMESPACE, SearchModel.FILE_NAMESPACE ] );
	} );

	QUnit.test( 'When filetype option is set, file namespace cannot be removed', function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'filetype', 'image' );
		model.setNamespaces( [] );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.FILE_NAMESPACE ] );
	} );

	QUnit.test( 'Setting namespace to existing setting does not trigger emitUpdate', function ( assert ) {
		var model = new SearchModel(),
			emitUpdateCalls = 0;
		model.emitUpdate = function () { emitUpdateCalls++; };
		model.setNamespaces( [] );
		model.setNamespaces( [ SearchModel.MAIN_NAMESPACE ] );

		assert.equal( emitUpdateCalls, 0 );
	} );

	QUnit.test( 'Changing namespacs triggers emitUpdate', function ( assert ) {
		var model = new SearchModel(),
			emitUpdateCalls = 0;
		model.emitUpdate = function () { emitUpdateCalls++; };
		model.setNamespaces( [ '1', '2', '3' ] );
		assert.equal( emitUpdateCalls, 1 );

		model.setNamespaces( [ '1', '2' ] );
		assert.equal( emitUpdateCalls, 2 );
	} );

}( mediaWiki ) );
