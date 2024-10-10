( function () {
	const { SearchModel } = require( 'ext.advancedSearch.elements' );
	let sandbox;

	QUnit.testStart( () => {
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( () => {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.dm.SearchModel' );

	QUnit.test( 'Default model has no fields', ( assert ) => {
		const model = new SearchModel();
		assert.deepEqual( model.searchFields, {} );
	} );

	QUnit.test( 'There is no hardcoded namespace preset', ( assert ) => {
		const model = new SearchModel();
		assert.deepEqual( model.getNamespaces(), [] );
	} );

	QUnit.test( 'Fields that were set can be retrieved', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'not', 'octopi' );
		model.storeField( 'prefix', 'Page' );
		assert.deepEqual( model.searchFields, {
			not: 'octopi',
			prefix: 'Page'
		} );
	} );

	QUnit.test( 'Retrieving an unset field with a default returns the default', ( assert ) => {
		const model = new SearchModel( [], { not: [], prefix: '' } );

		assert.deepEqual( model.getField( 'not' ), [] );
		assert.strictEqual( model.getField( 'prefix' ), '' );
		assert.strictEqual( typeof model.getField( 'prefix' ), 'string' );
		assert.strictEqual( typeof model.getField( 'nonexisting' ), 'undefined' );
	} );

	QUnit.test( 'Retrieving reference type value gives a copy, to avoid modification', ( assert ) => {
		const model = new SearchModel();
		const fileHeightValuePair = [ '>', '2' ];
		const someObject = { foo: 42 };

		model.storeField( 'fileh', fileHeightValuePair );
		model.storeField( 'someObject', someObject );

		assert.notStrictEqual( model.getField( 'fileh' ), fileHeightValuePair, 'Arrays must be different references' );
		assert.notStrictEqual( model.getField( 'someObject' ), someObject, 'Objects must be different references' );
	} );

	QUnit.test( 'When checking with undefined or empty value, hasOptionChange returns true for unset properties without defaults', ( assert ) => {
		const model = new SearchModel();

		assert.false( model.hasFieldChanged( 'not', undefined ) );
		assert.false( model.hasFieldChanged( 'not', '' ) );
		assert.true( model.hasFieldChanged( 'not', 'not empty' ) );
	} );

	QUnit.test( 'When checking with unset value, hasOptionChange compares to default value', ( assert ) => {
		const model = new SearchModel( [], { not: 'something' } );

		assert.false( model.hasFieldChanged( 'not', 'something' ) );
		assert.true( model.hasFieldChanged( 'not', 'anything' ) );
	} );

	QUnit.test( 'When there is no change, hasOptionChange returns false', ( assert ) => {
		const model = new SearchModel();

		model.storeField( 'not', 'something' );

		assert.false( model.hasFieldChanged( 'not', 'something' ) );
		assert.true( model.hasFieldChanged( 'not', 'anything' ) );
	} );

	const createModelWithValues = function () {
		const model = new SearchModel();
		model.storeField( 'not', 'octopi' );
		model.storeField( 'prefix', 'Page' );
		model.setNamespaces( [ '1', '3' ] );
		return model;
	};

	QUnit.test( 'Setting values from empty JSON string does nothing', ( assert ) => {
		const model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '' );

		assert.deepEqual( model.searchFields, expected.searchFields );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting invalid JSON string does nothing', ( assert ) => {
		const model = createModelWithValues(),
			expected = createModelWithValues();
		model.setAllFromJSON( '{ "unclosed_string": "str }' );

		assert.deepEqual( model.searchFields, expected.searchFields );
		assert.deepEqual( model.getNamespaces(), expected.getNamespaces() );
	} );

	QUnit.test( 'Setting valid JSON overrides previous state', ( assert ) => {
		const model = createModelWithValues();
		model.setAllFromJSON( '{"fields":{"or":[ "fish", "turtle" ],"prefix":"Sea"}}' );

		assert.deepEqual( model.searchFields, {
			or: [ 'fish', 'turtle' ],
			prefix: 'Sea'
		} );
	} );

	QUnit.test( 'Options are serialized to JSON', ( assert ) => {
		const model = createModelWithValues();

		assert.strictEqual(
			model.toJSON(),
			'{"fields":{"not":"octopi","prefix":"Page"}}'
		);
	} );

	QUnit.test( 'Empty fields are not serialized to JSON', ( assert ) => {
		assert.strictEqual(
			new SearchModel().toJSON(),
			''
		);
	} );

	QUnit.test( 'Setting namespaces to empty does not keep default namespace', ( assert ) => {
		const model = new SearchModel();
		model.setNamespaces( [] );

		assert.deepEqual( model.getNamespaces(), [] );
	} );

	QUnit.test( 'File dimension data is reset on filetype change', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'filetype', 'jpeg' );
		model.storeField( 'filew', [ '>', '1500' ] );
		model.storeField( 'fileh', [ '', '800' ] );

		model.storeField( 'filetype', 'random' );

		assert.deepEqual( model.getField( 'filew' ), undefined );
		assert.deepEqual( model.getField( 'fileh' ), undefined );
	} );

	QUnit.test( 'File dimension data containers reset on filetype remove', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'filetype', 'video' );
		model.storeField( 'filew', [ '', '800' ] );
		model.storeField( 'fileh', [ '', '600' ] );

		model.removeField( 'filetype' );

		assert.deepEqual( model.getField( 'filew' ), undefined );
		assert.deepEqual( model.getField( 'fileh' ), undefined );
	} );

	QUnit.test( 'Image and Video file types support dimensions', ( assert ) => {
		const model = new SearchModel();

		assert.false( model.filetypeSupportsDimensions(), 'Images are not supported when filetype is not set' );

		model.storeField( 'filetype', 'image' );
		assert.true( model.filetypeSupportsDimensions(), 'General image type must be supported' );

		model.storeField( 'filetype', 'video' );
		assert.true( model.filetypeSupportsDimensions(), 'General video type must be supported' );

		model.storeField( 'filetype', 'bitmap' );
		assert.true( model.filetypeSupportsDimensions(), 'File type of bitmap must be supported' );

		model.storeField( 'filetype', 'drawing' );
		assert.true( model.filetypeSupportsDimensions(), 'File type of drawing must be supported' );

		model.storeField( 'filetype', 'image/jpeg' );
		assert.true( model.filetypeSupportsDimensions(), 'Image MIME type must be supported' );

		model.storeField( 'filetype', 'image/svg+xml', 'Complex image MIME types must be supported' );
		assert.true( model.filetypeSupportsDimensions() );

		model.storeField( 'filetype', 'video/ogg', 'Video MIME types must be supported' );
		assert.true( model.filetypeSupportsDimensions() );

		model.storeField( 'filetype', 'audio', 'Audio must not support dimensions' );
		assert.false( model.filetypeSupportsDimensions() );

		model.storeField( 'filetype', 'audio/wav', 'Audio MIME types must not support dimensions' );
		assert.false( model.filetypeSupportsDimensions() );
	} );

	QUnit.test( 'Setting namespace to existing value does not trigger emitUpdate', ( assert ) => {
		const model = new SearchModel();
		model.setNamespaces( [ '1', '2', '3' ] );

		const updateSpy = sandbox.spy( model, 'emitUpdate' );
		model.setNamespaces( [ '1', '2', '3' ] );

		assert.false( updateSpy.called );
	} );

	QUnit.test( 'Changing namespaces triggers emitUpdate', ( assert ) => {
		const model = new SearchModel();
		const updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.setNamespaces( [ '1', '2', '3' ] );
		assert.true( updateSpy.calledOnce );

		model.setNamespaces( [ '1', '2' ] );
		assert.true( updateSpy.calledTwice );
	} );

	QUnit.test( 'Storing an option triggers emitUpdate', ( assert ) => {
		const model = new SearchModel();
		const updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeField( 'aaa', 'fff' );

		assert.true( updateSpy.calledOnce );
	} );

	QUnit.test( 'Storing an option with the same scalar value does not trigger emitUpdate', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'lorem', 'ipsum' );

		const updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeField( 'lorem', 'ipsum' );

		assert.false( updateSpy.called );
	} );

	QUnit.test( 'Storing an option with the same array value does not trigger emitUpdate', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'lorem', [ 'hakuna', 'matata' ] );

		const updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.storeField( 'lorem', [ 'hakuna', 'matata' ] );

		assert.false( updateSpy.called );
	} );

	QUnit.test( 'Removing an option triggers emitUpdate', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'lorem', 'ipsum' );

		const updateSpy = sandbox.spy( model, 'emitUpdate' );

		model.removeField( 'lorem' );

		assert.true( updateSpy.calledOnce );
	} );
}() );
