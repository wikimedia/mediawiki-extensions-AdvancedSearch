( function () {
	const { NamespacePresetProviders } = require( 'ext.advancedSearch.elements' );
	const namespaces = {
		0: 'Article',
		1: 'Talk',
		2: 'User',
		12: 'Help',
		911: 'Emergency Talk'
	};
	let sandbox;

	QUnit.testStart( function () {
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.dm.NamespacePresetProviders' );

	QUnit.test( 'Provider function for all namespaces returns/selects all namespace IDs', function ( assert ) {
		const presetProviders = new NamespacePresetProviders( namespaces );

		assert.deepEqual( presetProviders.getNamespaceIdsFromProvider( 'all' ), [ '0', '1', '2', '12', '911' ] );
	} );

	QUnit.test( 'Provider function for discussion namespaces selects all odd IDs', function ( assert ) {
		const presetProviders = new NamespacePresetProviders( namespaces );

		assert.deepEqual( presetProviders.getNamespaceIdsFromProvider( 'discussion' ), [ '1', '911' ] );
	} );

	QUnit.test( 'New provider functions can be added and are called with namespace IDs', function ( assert ) {
		const providerFunction = sinon.stub();
		const providerInitializationFunction = function ( providerFunctions ) {
			providerFunctions[ 'my-new-func' ] = providerFunction;
		};
		const namespaceIDs = [ '1', '2', '12' ];
		const hook = mw.hook( 'advancedSearch.initNamespacePresetProviders' );
		hook.add( providerInitializationFunction );
		const presetProviders = new NamespacePresetProviders( namespaces );
		hook.remove( providerInitializationFunction );
		providerFunction.returns( namespaceIDs );
		const namespaceIdResult = presetProviders.getNamespaceIdsFromProvider( 'my-new-func' );

		assert.true( providerFunction.calledOnce );
		assert.deepEqual( providerFunction.firstCall.args[ 0 ], [ '0', '1', '2', '12', '911' ] );
		assert.false( namespaceIdResult === namespaceIDs );
		assert.deepEqual( namespaceIdResult, namespaceIDs );
	} );

	QUnit.test( 'A single invalid ID does not render the entire preset invalid', function ( assert ) {
		const providerInitializationFunction = function ( providerFunctions ) {
			providerFunctions.partlyInvalid = function () {
				return [ '0', '1', '4711' ];
			};
		};
		const hook = mw.hook( 'advancedSearch.initNamespacePresetProviders' );

		hook.add( providerInitializationFunction );
		const presetProviders = new NamespacePresetProviders( namespaces );
		hook.remove( providerInitializationFunction );
		const result = presetProviders.getNamespaceIdsFromProvider( 'partlyInvalid' );

		assert.deepEqual( result, [ '0', '1' ] );
	} );

	QUnit.test( 'When all provided IDs are invalid, a warning is logged and empty array is returned', function ( assert ) {
		const warningLogger = sandbox.stub( mw.log, 'warn' );
		const providerFunction = sinon.stub();
		const providerInitializationFunction = function ( providerFunctions ) {
			providerFunctions.invalid = providerFunction;
		};
		const namespaceIDs = [ '4709', '4710', '4711' ];
		const hook = mw.hook( 'advancedSearch.initNamespacePresetProviders' );
		hook.add( providerInitializationFunction );
		const presetProviders = new NamespacePresetProviders( namespaces );
		hook.remove( providerInitializationFunction );
		providerFunction.returns( namespaceIDs );
		const namespaceIdResult = presetProviders.getNamespaceIdsFromProvider( 'invalid' );

		assert.true( providerFunction.calledOnce );
		assert.deepEqual( namespaceIdResult, [] );
		assert.true( warningLogger.calledWith( 'AdvancedSearch namespace preset provider "invalid" returned invalid namespace ID' ) );
	} );

	QUnit.test( 'Numeric IDs from provider are converted to string IDs', function ( assert ) {
		const providerFunction = sinon.stub();
		const providerInitializationFunction = function ( providerFunctions ) {
			providerFunctions.invalid = providerFunction;
		};
		const namespaceIDs = [ 0, 1, 12 ];
		const hook = mw.hook( 'advancedSearch.initNamespacePresetProviders' );
		hook.add( providerInitializationFunction );
		const presetProviders = new NamespacePresetProviders( namespaces );
		hook.remove( providerInitializationFunction );
		providerFunction.returns( namespaceIDs );
		const namespaceIdResult = presetProviders.getNamespaceIdsFromProvider( 'invalid' );

		assert.true( providerFunction.calledOnce );
		assert.deepEqual( namespaceIdResult, [ '0', '1', '12' ] );
	} );
}() );
