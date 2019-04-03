( function () {

	var ArbitraryWordInput = mw.libs.advancedSearch.ui.ArbitraryWordInput,
		Model = mw.libs.advancedSearch.dm.SearchModel,
		sandbox;

	QUnit.testStart( function () {
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.ui.ArbitraryWordInput' );

	QUnit.test( 'Input initially gets set from store', function ( assert ) {
		var model = new Model();
		model.storeField( 'myid', [ 'lorem', 'ipsum', 'something with spaces' ] );
		var input = new ArbitraryWordInput( model, { fieldId: 'myid' } );

		assert.deepEqual(
			input.getValue(),
			[
				'lorem',
				'ipsum',
				'something with spaces'
			]
		);
	} );

	/**
	 * Currently does not write back into store by itself but relies on createMultiSelectChangeHandler in init to do so
	 */
	QUnit.test( 'Changes on input cause update event', function ( assert ) {
		var input = new ArbitraryWordInput( new Model(), {} );
		var onChangeSpy = sandbox.spy();
		input.on( 'change', onChangeSpy );

		input.input.setValue( 'scalar, octopus' );
		input.buildTagsFromInput();

		assert.strictEqual( onChangeSpy.callCount, 2 );

		assert.strictEqual( onChangeSpy.getCall( 0 ).args[ 0 ][ 0 ].data, 'scalar' );

		assert.strictEqual( onChangeSpy.getCall( 1 ).args[ 0 ][ 0 ].data, 'scalar' );
		assert.strictEqual( onChangeSpy.getCall( 1 ).args[ 0 ][ 1 ].data, 'octopus' );
	} );

	QUnit.test( 'Placeholder text presented if no content', function ( assert ) {
		var input = new ArbitraryWordInput( new Model(), { placeholder: 'lorem ipsum' } );

		assert.strictEqual( input.getTextForPlaceholder(), 'lorem ipsum' );
	} );

	QUnit.test( 'Placeholder text empty if content gets set', function ( assert ) {
		var input = new ArbitraryWordInput( new Model(), { placeholder: 'lorem ipsum' } );
		input.setValue( [ 'asinus' ] );

		assert.strictEqual( input.getTextForPlaceholder(), '' );
	} );

	QUnit.test( 'Placeholder text empty if content set from the start', function ( assert ) {
		var model = new Model();
		model.storeField( 'somekey', [ 'gaudiamus' ] );
		var input = new ArbitraryWordInput( model, { placeholder: 'lorem ipsum', fieldId: 'somekey' } );

		assert.strictEqual( input.getTextForPlaceholder(), '' );
	} );

	QUnit.test( 'Text with commas and spaces gets turned into tags', function ( assert ) {
		var input = new ArbitraryWordInput( new Model(), {} );
		input.input.setValue( 'initial,comma,separated values' );
		input.buildTagsFromInput();

		assert.deepEqual(
			input.getValue(),
			[
				'initial',
				'comma',
				'separated',
				'values'
			]
		);
	} );

	QUnit.test( 'Extra commas and spaces do not cause empty tag creation', function ( assert ) {
		var input = new ArbitraryWordInput( new Model(), {} );
		input.input.setValue( ',initial,, comma   separated, values,,' );
		input.buildTagsFromInput();

		assert.deepEqual(
			input.getValue(),
			[
				'initial',
				'comma',
				'separated',
				'values'
			]
		);
	} );

}() );
