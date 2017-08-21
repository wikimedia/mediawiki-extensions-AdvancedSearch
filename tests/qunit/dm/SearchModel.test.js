( function ( mw ) {
	var SearchModel,
		sandbox;

	QUnit.testStart( function () {
		SearchModel = mw.libs.advancedSearch.dm.SearchModel;
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.dm.SearchModel' );

	QUnit.test( 'Default model has no options', 1, function ( assert ) {
		var model = new SearchModel();
		assert.deepEqual( model.getOptions(), {} );
	} );

	QUnit.test( 'Default model has article namespace', 1, function ( assert ) {
		var model = new SearchModel();
		assert.deepEqual( model.getNamespaces(), [ '0' ] );
	} );

	QUnit.test( 'Options that were set can be retrieved', 1, function ( assert ) {
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

	QUnit.test( 'Setting empty JSON string does nothing', 2, function ( assert ) {
		var model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '' );

		assert.deepEqual( model.getOptions(), expected.getOptions() );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting invalid JSON string does nothing', 2, function ( assert ) {
		var model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '{ "unclosed_string": "str }' );

		assert.deepEqual( model.getOptions(), expected.getOptions() );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting valid JSON overrides previous state', 2, function ( assert ) {
		var model = createModelWithValues();
		model.setAllFromJSON( '{"options":{"or":[ "fish", "turtle" ],"prefix":"Sea"},"namespaces":["0","2"]}' );

		assert.deepEqual( model.getOptions(), {
			or: [ 'fish', 'turtle' ],
			prefix: 'Sea'
		} );
		assert.deepEqual( model.getNamespaces(), [ '0', '2' ] );
	} );

	QUnit.test( 'Namespaces default to main namespace out of the box', 1, function ( assert ) {
		var model = new SearchModel();
		assert.deepEqual( model.getNamespaces(), [ SearchModel.MAIN_NAMESPACE ] );
	} );

	QUnit.test( 'Setting namespaces to empty keeps default namespace', 1, function ( assert ) {
		var model = new SearchModel();
		model.setNamespaces( [] );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.MAIN_NAMESPACE ] );
	} );

	QUnit.test( 'Adding filetype option forces file namespace', 1, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'filetype', 'image' );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.MAIN_NAMESPACE, SearchModel.FILE_NAMESPACE ] );
	} );

	QUnit.test( 'When filetype option is set, file namespace cannot be removed', 1, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'filetype', 'image' );
		model.setNamespaces( [] );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.FILE_NAMESPACE ] );
	} );

	QUnit.test( 'File dimension data is reset on filetype change', 2, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'filetype', 'jpeg' );
		model.storeOption( 'filew', [ '>', '1500' ] );
		model.storeOption( 'fileh', [ '', '800' ] );

		model.storeOption( 'filetype', 'random' );

		assert.deepEqual( model.getOption( 'filew' ), [ '>', '' ] );
		assert.deepEqual( model.getOption( 'fileh' ), [ '>', '' ] );
	} );

	QUnit.test( 'File dimension data containers reset on filetype remove', 2, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'filetype', 'video' );
		model.storeOption( 'filew', [ '', '800' ] );
		model.storeOption( 'fileh', [ '', '600' ] );

		model.removeOption( 'filetype' );

		assert.deepEqual( model.getOption( 'filew' ), [ '>', '' ] );
		assert.deepEqual( model.getOption( 'fileh' ), [ '>', '' ] );
	} );

	QUnit.test( 'File types support dimensions configured', 5, function ( assert ) {
		var model = new SearchModel();

		model.storeOption( 'filetype', 'bitmap' );
		assert.ok( model.filetypeSupportsDimensions() );

		model.storeOption( 'filetype', 'video' );
		assert.ok( model.filetypeSupportsDimensions() );

		model.storeOption( 'filetype', 'jpeg' );
		assert.ok( model.filetypeSupportsDimensions() );

		model.storeOption( 'filetype', 'tiff' );
		assert.ok( model.filetypeSupportsDimensions() );

		model.storeOption( 'filetype', 'random' );
		assert.notOk( model.filetypeSupportsDimensions() );
	} );

	QUnit.test( 'Setting namespace to existing value does not trigger emitUpdate', 1, function ( assert ) {
		var model = new SearchModel();
		model.setNamespaces( [ '1', '2', '3' ] );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );
		model.setNamespaces( [ '1', '2', '3' ] );

		assert.notOk( updateSpy.called );
	} );

	QUnit.test( 'Changing namespaces triggers emitUpdate', 2, function ( assert ) {
		var model = new SearchModel();
		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.setNamespaces( [ '1', '2', '3' ] );
		assert.ok( updateSpy.calledOnce );

		model.setNamespaces( [ '1', '2' ] );
		assert.ok( updateSpy.calledTwice );
	} );

	QUnit.test( 'Storing an option triggers emitUpdate', 1, function ( assert ) {
		var model = new SearchModel();
		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeOption( 'aaa', 'fff' );

		assert.ok( updateSpy.calledOnce );
	} );

	QUnit.test( 'Storing an option with the same scalar value does not trigger emitUpdate', 1, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'lorem', 'ipsum' );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeOption( 'lorem', 'ipsum' );

		assert.notOk( updateSpy.called );
	} );

	QUnit.test( 'Storing an option with the same array value does not trigger emitUpdate', 1, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'lorem', [ 'hakuna', 'matata' ] );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeOption( 'lorem', [ 'hakuna', 'matata' ] );

		assert.notOk( updateSpy.called );
	} );

	QUnit.test( 'Removing an option triggers emitUpdate', 1, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'lorem', 'ipsum' );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.removeOption( 'lorem' );

		assert.ok( updateSpy.calledOnce );
	} );

	QUnit.test( 'Removing an unset option does not trigger emitUpdate', 1, function ( assert ) {
		var model = new SearchModel();
		model.storeOption( 'lorem', 'ipsum' );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.removeOption( 'amet' );

		assert.notOk( updateSpy.called );
	} );

}( mediaWiki ) );
