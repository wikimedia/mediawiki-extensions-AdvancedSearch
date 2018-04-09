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

	QUnit.test( 'Default model has no options', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		assert.deepEqual( model.getOptions(), {} );
	} );

	QUnit.test( 'There is no hardcoded namespace preset', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		assert.deepEqual( model.getNamespaces(), [] );
	} );

	QUnit.test( 'Options that were set can be retrieved', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.storeOption( 'not', 'octopi' );
		model.storeOption( 'prefix', 'Page' );
		assert.deepEqual( model.getOptions(), {
			not: 'octopi',
			prefix: 'Page'
		} );
	} );

	QUnit.test( 'Retrieving an unset option with a default returns the default', function ( assert ) {
		var model = new SearchModel( [], { not: [], prefix: '' } );

		assert.deepEqual( model.getOption( 'not' ), [] );
		assert.strictEqual( model.getOption( 'prefix' ), '' );
		assert.equal( typeof model.getOption( 'prefix' ), 'string' );
		assert.equal( typeof model.getOption( 'nonexisting' ), 'undefined' );
	} );

	QUnit.test( 'Retrieving reference type value gives a copy, to avoid modification', function ( assert ) {
		var model = new SearchModel();
		var fileHeightValuePair = [ '>', '2' ];
		var someObject = { foo: 42 };

		model.storeOption( 'fileh', fileHeightValuePair );
		model.storeOption( 'someObject', someObject );

		assert.ok( model.getOption( 'fileh' ) !== fileHeightValuePair, 'Arrays must be different references' );
		assert.ok( model.getOption( 'someObject' ) !== someObject, 'Objects must be different references' );
	} );

	QUnit.test( 'Retrieving all values gives a copy of reference type values, to avoid modification', function ( assert ) {
		var model = new SearchModel();
		var fileHeightValuePair = [ '>', '2' ];
		var someObject = { foo: 42 };

		model.storeOption( 'fileh', fileHeightValuePair );
		model.storeOption( 'someObject', someObject );
		var options = model.getOptions();

		assert.ok( options.fileh !== fileHeightValuePair, 'Arrays must be different references' );
		assert.ok( options.someObject !== someObject, 'Objects must be different references' );
	} );

	QUnit.test( 'When checking with undefined or empty value, hasOptionChange returns true for unset properties without defaults', function ( assert ) {
		var model = new SearchModel();

		assert.notOk( model.hasOptionChanged( 'not', undefined ) );
		assert.notOk( model.hasOptionChanged( 'not', '' ) );
		assert.ok( model.hasOptionChanged( 'not', 'not empty' ) );
	} );

	QUnit.test( 'When checking with unset value, hasOptionChange compares to default value', function ( assert ) {
		var model = new SearchModel( [], { not: 'something' } );

		assert.notOk( model.hasOptionChanged( 'not', 'something' ) );
		assert.ok( model.hasOptionChanged( 'not', 'anything' ) );
	} );

	QUnit.test( 'When there is no change, hasOptionChange returns false', function ( assert ) {
		var model = new SearchModel();

		model.storeOption( 'not', 'something' );

		assert.notOk( model.hasOptionChanged( 'not', 'something' ) );
		assert.ok( model.hasOptionChanged( 'not', 'anything' ) );
	} );

	function createModelWithValues() {
		var model = new SearchModel();
		model.storeOption( 'not', 'octopi' );
		model.storeOption( 'prefix', 'Page' );
		model.setNamespaces( [ '1', '3' ] );
		return model;
	}

	QUnit.test( 'Setting values from empty JSON string does nothing', function ( assert ) {
		assert.expect( 2 );

		var model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '' );

		assert.deepEqual( model.getOptions(), expected.getOptions() );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting invalid JSON string does nothing', function ( assert ) {
		assert.expect( 2 );

		var model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '{ "unclosed_string": "str }' );

		assert.deepEqual( model.getOptions(), expected.getOptions() );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting valid JSON overrides previous state', function ( assert ) {
		assert.expect( 2 );

		var model = createModelWithValues();
		model.setAllFromJSON( '{"options":{"or":[ "fish", "turtle" ],"prefix":"Sea"},"namespaces":["0","2"]}' );

		assert.deepEqual( model.getOptions(), {
			or: [ 'fish', 'turtle' ],
			prefix: 'Sea'
		} );
		assert.deepEqual( model.getNamespaces(), [ '0', '2' ] );
	} );

	QUnit.test( 'Options and namespaces are serialized to JSON', function ( assert ) {
		var model = createModelWithValues();

		assert.equal(
			model.toJSON(),
			'{"options":{"not":"octopi","prefix":"Page"},"namespaces":["1","3"]}'
		);
	} );

	QUnit.test( 'Empty options and namespaces are not serialized to JSON', function ( assert ) {
		assert.equal(
			new SearchModel().toJSON(),
			'{}'
		);
	} );

	QUnit.test( 'Setting namespaces to empty does not keep default namespace', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.setNamespaces( [] );

		assert.deepEqual( model.getNamespaces(), [] );
	} );

	QUnit.test( 'Adding filetype option forces file namespace', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.storeOption( 'filetype', 'image' );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.FILE_NAMESPACE ] );
	} );

	QUnit.test( 'When filetype option is set, file namespace cannot be removed', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.storeOption( 'filetype', 'image' );
		model.setNamespaces( [] );

		assert.deepEqual( model.getNamespaces(), [ SearchModel.FILE_NAMESPACE ] );
	} );

	QUnit.test( 'File dimension data is reset on filetype change', function ( assert ) {
		assert.expect( 2 );

		var model = new SearchModel();
		model.storeOption( 'filetype', 'jpeg' );
		model.storeOption( 'filew', [ '>', '1500' ] );
		model.storeOption( 'fileh', [ '', '800' ] );

		model.storeOption( 'filetype', 'random' );

		assert.deepEqual( model.getOption( 'filew' ), undefined );
		assert.deepEqual( model.getOption( 'fileh' ), undefined );
	} );

	QUnit.test( 'File dimension data containers reset on filetype remove', function ( assert ) {
		assert.expect( 2 );

		var model = new SearchModel();
		model.storeOption( 'filetype', 'video' );
		model.storeOption( 'filew', [ '', '800' ] );
		model.storeOption( 'fileh', [ '', '600' ] );

		model.removeOption( 'filetype' );

		assert.deepEqual( model.getOption( 'filew' ), undefined );
		assert.deepEqual( model.getOption( 'fileh' ), undefined );
	} );

	QUnit.test( 'Image and Video file types support dimensions', function ( assert ) {
		assert.expect( 10 );

		var model = new SearchModel();

		assert.notOk( model.filetypeSupportsDimensions(), 'Images are not supported when filetype is not set' );

		model.storeOption( 'filetype', 'image' );
		assert.ok( model.filetypeSupportsDimensions(), 'General image type must be supported' );

		model.storeOption( 'filetype', 'video' );
		assert.ok( model.filetypeSupportsDimensions(), 'General video type must be supported' );

		model.storeOption( 'filetype', 'bitmap' );
		assert.ok( model.filetypeSupportsDimensions(), 'File type of bitmap must be supported' );

		model.storeOption( 'filetype', 'drawing' );
		assert.ok( model.filetypeSupportsDimensions(), 'File type of drawing must be supported' );

		model.storeOption( 'filetype', 'image/jpeg' );
		assert.ok( model.filetypeSupportsDimensions(), 'Image MIME type must be supported' );

		model.storeOption( 'filetype', 'image/svg+xml', 'Complex image MIME types must be supported' );
		assert.ok( model.filetypeSupportsDimensions() );

		model.storeOption( 'filetype', 'video/ogg', 'Video MIME types must be supported' );
		assert.ok( model.filetypeSupportsDimensions() );

		model.storeOption( 'filetype', 'audio', 'Audio must not support dimensions' );
		assert.notOk( model.filetypeSupportsDimensions() );

		model.storeOption( 'filetype', 'audio/wav', 'Audio MIME types must not support dimensions' );
		assert.notOk( model.filetypeSupportsDimensions() );
	} );

	QUnit.test( 'Setting namespace to existing value does not trigger emitUpdate', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.setNamespaces( [ '1', '2', '3' ] );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );
		model.setNamespaces( [ '1', '2', '3' ] );

		assert.notOk( updateSpy.called );
	} );

	QUnit.test( 'Changing namespaces triggers emitUpdate', function ( assert ) {
		assert.expect( 2 );

		var model = new SearchModel();
		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.setNamespaces( [ '1', '2', '3' ] );
		assert.ok( updateSpy.calledOnce );

		model.setNamespaces( [ '1', '2' ] );
		assert.ok( updateSpy.calledTwice );
	} );

	QUnit.test( 'Storing an option triggers emitUpdate', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeOption( 'aaa', 'fff' );

		assert.ok( updateSpy.calledOnce );
	} );

	QUnit.test( 'Storing an option with the same scalar value does not trigger emitUpdate', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.storeOption( 'lorem', 'ipsum' );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeOption( 'lorem', 'ipsum' );

		assert.notOk( updateSpy.called );
	} );

	QUnit.test( 'Storing an option with the same array value does not trigger emitUpdate', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.storeOption( 'lorem', [ 'hakuna', 'matata' ] );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeOption( 'lorem', [ 'hakuna', 'matata' ] );

		assert.notOk( updateSpy.called );
	} );

	QUnit.test( 'Removing an option triggers emitUpdate', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.storeOption( 'lorem', 'ipsum' );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.removeOption( 'lorem' );

		assert.ok( updateSpy.calledOnce );
	} );

	QUnit.test( 'Removing an unset option does not trigger emitUpdate', function ( assert ) {
		assert.expect( 1 );

		var model = new SearchModel();
		model.storeOption( 'lorem', 'ipsum' );

		var updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.removeOption( 'amet' );

		assert.notOk( updateSpy.called );
	} );

}( mediaWiki ) );
