( function () {
	const { ArbitraryWordInput } = require( 'ext.advancedSearch.SearchFieldUI' );
	const { SearchModel } = require( 'ext.advancedSearch.elements' );
	let sandbox;

	QUnit.testStart( () => {
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( () => {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.ui.ArbitraryWordInput' );

	QUnit.test( 'Input initially gets set from store', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'myid', [ 'lorem', 'ipsum', 'something with spaces' ] );
		const input = new ArbitraryWordInput( model, { fieldId: 'myid' } );

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
	QUnit.test( 'Changes on input cause update event', ( assert ) => {
		const input = new ArbitraryWordInput( new SearchModel(), {} );
		const onChangeSpy = sandbox.spy();
		input.on( 'change', onChangeSpy );

		input.input.setValue( 'scalar, octopus' );
		input.buildTagsFromInput();

		assert.strictEqual( onChangeSpy.callCount, 2 );

		assert.strictEqual( onChangeSpy.getCall( 0 ).args[ 0 ][ 0 ].data, 'scalar' );

		assert.strictEqual( onChangeSpy.getCall( 1 ).args[ 0 ][ 0 ].data, 'scalar' );
		assert.strictEqual( onChangeSpy.getCall( 1 ).args[ 0 ][ 1 ].data, 'octopus' );
	} );

	QUnit.test( 'Placeholder text presented if no content', ( assert ) => {
		const input = new ArbitraryWordInput( new SearchModel(), { placeholder: 'lorem ipsum' } );

		assert.strictEqual( input.getTextForPlaceholder(), 'lorem ipsum' );
	} );

	QUnit.test( 'Placeholder text empty if content gets set', ( assert ) => {
		const input = new ArbitraryWordInput( new SearchModel(), { placeholder: 'lorem ipsum' } );
		input.setValue( [ 'asinus' ] );

		assert.strictEqual( input.getTextForPlaceholder(), '' );
	} );

	QUnit.test( 'Placeholder text empty if content set from the start', ( assert ) => {
		const model = new SearchModel();
		model.storeField( 'somekey', [ 'gaudiamus' ] );
		const input = new ArbitraryWordInput( model, { placeholder: 'lorem ipsum', fieldId: 'somekey' } );

		assert.strictEqual( input.getTextForPlaceholder(), '' );
	} );

	QUnit.test( 'Text with commas and spaces gets turned into tags', ( assert ) => {
		const input = new ArbitraryWordInput( new SearchModel(), {} );
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

	QUnit.test( 'Extra commas and spaces do not cause empty tag creation', ( assert ) => {
		const input = new ArbitraryWordInput( new SearchModel(), {} );
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
