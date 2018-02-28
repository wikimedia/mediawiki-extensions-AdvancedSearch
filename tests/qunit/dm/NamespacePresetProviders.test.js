( function ( mw ) {
	var namespaces = new mw.libs.advancedSearch.dm.SearchableNamespaces( {
			0: 'Article',
			1: 'Talk',
			2: 'User',
			12: 'Help',
			911: 'Emergency Talk'
		} ),
		sandbox;

	QUnit.testStart( function () {
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.dm.NamespacePresetProviders' );

	QUnit.test( 'Provider function for all namespaces returns/selects all namespace IDs', function ( assert ) {
		var presetProviders = new mw.libs.advancedSearch.dm.NamespacePresetProviders( namespaces );

		assert.deepEqual( presetProviders.getNamespaceIdsFromProvider( 'all' ), [ '0', '1', '2', '12', '911' ] );
	} );

	QUnit.test( 'Provider function for discussion namespaces selects all odd IDs', function ( assert ) {
		var presetProviders = new mw.libs.advancedSearch.dm.NamespacePresetProviders( namespaces );

		assert.deepEqual( presetProviders.getNamespaceIdsFromProvider( 'discussion' ), [ '1', '911' ] );
	} );

	QUnit.test( 'New provider functions can be added and are called with namespace IDs', function ( assert ) {
		var providerFunction = sinon.stub(),
			providerInitializationFunction = function ( providerFunctions ) {
				providerFunctions[ 'my-new-func' ] = providerFunction;
			},
			namespaceIDs = [ '1', '2', '12' ],
			hook = mw.hook( 'advancedSearch.initNamespacePresetProviders' ),
			namespaceIdResult, presetProviders;
		hook.add( providerInitializationFunction );
		presetProviders = new mw.libs.advancedSearch.dm.NamespacePresetProviders( namespaces );
		hook.remove( providerInitializationFunction );
		providerFunction.returns( namespaceIDs );
		namespaceIdResult = presetProviders.getNamespaceIdsFromProvider( 'my-new-func' );

		assert.ok( providerFunction.calledOnce );
		assert.deepEqual( providerFunction.firstCall.args[ 0 ], [ '0', '1', '2', '12', '911' ] );
		assert.notEqual( namespaceIdResult, namespaceIDs );
		assert.deepEqual( namespaceIdResult, namespaceIDs );
	} );

	QUnit.test( 'When provider functions return invalid IDs, a warning is logged and empty array is returned', function ( assert ) {
		var warningLogger = sandbox.stub( mw.log, 'warn' ),
			providerFunction = sinon.stub(),
			providerInitializationFunction = function ( providerFunctions ) {
				providerFunctions.invalid = providerFunction;
			},
			namespaceIDs = [ '0', '1', '4711' ],
			hook = mw.hook( 'advancedSearch.initNamespacePresetProviders' ),
			namespaceIdResult, presetProviders;
		hook.add( providerInitializationFunction );
		presetProviders = new mw.libs.advancedSearch.dm.NamespacePresetProviders( namespaces );
		hook.remove( providerInitializationFunction );
		providerFunction.returns( namespaceIDs );
		namespaceIdResult = presetProviders.getNamespaceIdsFromProvider( 'invalid' );

		assert.ok( providerFunction.calledOnce );
		assert.deepEqual( namespaceIdResult, [] );
		assert.ok( warningLogger.calledWith( 'AdvancedSearch namespace preset provider "invalid" returned invalid namespace ID' ) );
	} );

	QUnit.test( 'Numeric IDs from provider are converted to string IDs', function ( assert ) {
		var providerFunction = sinon.stub(),
			providerInitializationFunction = function ( providerFunctions ) {
				providerFunctions.invalid = providerFunction;
			},
			namespaceIDs = [ 0, 1, 12 ],
			hook = mw.hook( 'advancedSearch.initNamespacePresetProviders' ),
			namespaceIdResult, presetProviders;
		hook.add( providerInitializationFunction );
		presetProviders = new mw.libs.advancedSearch.dm.NamespacePresetProviders( namespaces );
		hook.remove( providerInitializationFunction );
		providerFunction.returns( namespaceIDs );
		namespaceIdResult = presetProviders.getNamespaceIdsFromProvider( 'invalid' );

		assert.ok( providerFunction.calledOnce );
		assert.deepEqual( namespaceIdResult, [ '0', '1', '12' ] );
	} );

}( mediaWiki ) );
