( function ( mw ) {
	var NamespacePresets = mw.libs.advancedSearch.ui.NamespacePresets,
		Model = mw.libs.advancedSearch.dm.SearchModel,
		sandbox
	;

	QUnit.module( 'ext.advancedSearch.ui.NamespacePresets' );

	QUnit.testStart( function () {
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	function getDummyCheckbox( selected ) {
		return {
			getData: function () { return 'all'; },
			selected: selected
		};
	}

	QUnit.test( 'Passing a provider function creates namespace presets from the provider', function ( assert ) {
		assert.expect( 1 );

		mw.libs.advancedSearch.dm.NamespacePresetProviders.justatest = function () { return [ '0', '1', '2' ]; };
		var presets = new NamespacePresets( new Model(), {
			presets: {
				justatest: {
					enabled: true,
					label: 'testing a provider',
					provider: 'justatest'
				}
			}
		} );
		delete mw.libs.advancedSearch.dm.NamespacePresetProviders.justatest;

		assert.deepEqual( [ '0', '1', '2' ], presets.presets.justatest.namespaces );
	} );

	QUnit.test( 'Passing a nonexisting provider function creates no namespace preset', function ( assert ) {
		assert.expect( 2 );

		var warningLogger = sandbox.stub( mw.log, 'warn' );
		var presets = new NamespacePresets( new Model(), {
			presets: {
				blackhole: {
					enabled: true,
					label: 'testing a provider',
					provider: 'blackhole'
				}
			}
		} );

		assert.ok( warningLogger.calledWith( 'Provider function blackhole not found in mw.libs.advancedSearch.dm.NamespacePresetProviders' ) );
		assert.notOk( presets.presets.hasOwnProperty( 'blackhole' ) );
	} );

	QUnit.test( 'Passing a malformed preset config creates no namespace preset', function ( assert ) {
		assert.expect( 2 );

		var warningLogger = sandbox.stub( mw.log, 'warn' );
		var presets = new NamespacePresets( new Model(), {
			presets: {
				borken: {
					enabled: true,
					label: 'testing broken config'
				}
			}
		} );

		assert.ok( warningLogger.calledWith( 'No defined namespaces or provider function for borken in $wgAdvancedSearchNamespacePresets' ) );
		assert.notOk( presets.presets.hasOwnProperty( 'borken' ) );
	} );

	QUnit.test( 'Passing a disabled preset config creates no namespace preset', function ( assert ) {
		assert.expect( 1 );

		var presets = new NamespacePresets( new Model(), {
			presets: {
				turnedoff: {
					enabled: false,
					namespaces: [ '0', '1', '2' ],
					label: 'disabled config'
				}
			}
		} );

		assert.notOk( presets.presets.hasOwnProperty( 'turnedoff' ) );
	} );

	QUnit.test( 'Passing a preset config omitting "enabled" creates no namespace preset', function ( assert ) {
		assert.expect( 1 );

		var presets = new NamespacePresets( new Model(), {
			presets: {
				undecided: {
					namespaces: [ '2', '4', '6', '8' ],
					label: 'config skipping enabled'
				}
			}
		} );

		assert.notOk( presets.presets.hasOwnProperty( 'undecided' ) );
	} );

	QUnit.test( 'Selecting namespace adds its preset', function ( assert ) {
		assert.expect( 1 );

		var model = new Model(),
			presets = new NamespacePresets( model, {
				presets: {
					all: {
						enabled: true,
						label: 'All',
						namespaces: [ '0', '1', '2' ]
					}
				}
			} );
		presets.updateStoreFromPresets( getDummyCheckbox( true ) );
		assert.deepEqual( [ '0', '1', '2' ], model.getNamespaces() );
	} );

	QUnit.test( 'Added namespaces of a preset mark the preset as selected', function ( assert ) {
		assert.expect( 1 );
		var model = new Model(),
			presets = new NamespacePresets( model, {
				presets: {
					discussions: {
						enabled: true,
						namespaces: [ '3', '5', '7', '9', '11', '13', '711' ],
						label: 'Discussion'
					},
					generalHelp: {
						enabled: true,
						namespaces: [ '4', '12' ],
						label: 'General Help'
					}
				}
			} );
		model.setNamespaces( [ '4', '12' ] );
		assert.deepEqual( presets.getValue(), [ 'generalHelp' ] );
	} );

	QUnit.test( 'Added namespaces of two presets mark both presets as selected', function ( assert ) {
		assert.expect( 1 );
		var model = new Model(),
			presets = new NamespacePresets( model, {
				presets: {
					discussions: {
						enabled: true,
						namespaces: [ '3', '5', '7', '9', '11', '13', '711' ],
						label: 'Discussion'
					},
					generalHelp: {
						enabled: true,
						namespaces: [ '4', '12' ],
						label: 'General Help'
					}
				}
			} );
		model.setNamespaces( [ '4', '12', '3', '5', '7', '9', '11', '13', '711' ] );
		assert.deepEqual( presets.getValue(), [ 'discussions', 'generalHelp' ] );
	} );

	QUnit.test( 'Unselecting namespace removes its preset', function ( assert ) {
		assert.expect( 1 );

		var model = new Model(),
			presets = new NamespacePresets( model, {
				presets: {
					all: {
						enabled: true,
						label: 'All',
						namespaces: [ '0', '1', '2' ]
					}
				}
			} );
		model.setNamespaces( [ '0', '1', '2', '3' ] );
		presets.updateStoreFromPresets( getDummyCheckbox( false ) );
		assert.deepEqual( [ '3' ], model.getNamespaces() );
	} );

	QUnit.test( 'Changing the store namespaces to the preset namespaces, selects preset irrespective of order', function ( assert ) {
		assert.expect( 4 );

		var model = new Model(),
			presets = new NamespacePresets( model, {
				presets: {
					all: {
						enabled: true,
						label: 'All',
						namespaces: [ '0', '1', '-1200' ]
					}
				}
			} );
		assert.deepEqual( presets.getValue(), [] );
		model.setNamespaces( [ '0', '1', '-1200' ] );
		assert.deepEqual( presets.getValue(), [ 'all' ] );
		model.setNamespaces( [ '0', '-1200', '1' ] );
		assert.deepEqual( presets.getValue(), [ 'all' ] );
		model.setNamespaces( [ '0', '1' ] );
		assert.deepEqual( presets.getValue(), [] );
	} );

}( mediaWiki ) );
