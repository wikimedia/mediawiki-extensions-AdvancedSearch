( function () {
	const { NamespacePresets, NamespacePresetProviders, SearchModel } = require( 'ext.advancedSearch.elements' );
	let sandbox, presetProvider;

	QUnit.module( 'ext.advancedSearch.ui.NamespacePresets' );

	QUnit.testStart( () => {
		sandbox = sinon.sandbox.create();
		presetProvider = sinon.createStubInstance( NamespacePresetProviders );
		presetProvider.namespaceIdsAreValid.returns( true );
	} );

	QUnit.testDone( () => {
		sandbox.restore();
	} );

	const getDummyCheckbox = function ( selected ) {
		return new OO.ui.CheckboxMultioptionWidget( { data: 'all', selected: selected } );
	};

	QUnit.test( 'Passing a provider function creates namespace presets from the provider', ( assert ) => {
		presetProvider.hasProvider.returns( true );
		presetProvider.getNamespaceIdsFromProvider.returns( [ '0', '1', '2' ] );

		const presets = new NamespacePresets( new SearchModel(), presetProvider, {
			presets: {
				justatest: {
					enabled: true,
					provider: 'justatest'
				}
			}
		} );

		assert.deepEqual( [ '0', '1', '2' ], presets.presets.justatest.namespaces );
	} );

	QUnit.test( 'Passing a nonexisting provider function creates no namespace preset', ( assert ) => {
		presetProvider.hasProvider.withArgs( 'blackhole' ).returns( false );
		const warningLogger = sandbox.stub( mw.log, 'warn' );
		const presets = new NamespacePresets( new SearchModel(), presetProvider, {
			presets: {
				blackhole: {
					enabled: true,
					provider: 'blackhole'
				}
			}
		} );

		assert.true( warningLogger.calledWith( 'Provider function blackhole not registered to NamespacePresetProviders' ) );
		assert.false( Object.prototype.hasOwnProperty.call( presets.presets, 'blackhole' ) );
	} );

	QUnit.test( 'Passing a malformed preset config creates no namespace preset', ( assert ) => {
		const warningLogger = sandbox.stub( mw.log, 'warn' );
		const presets = new NamespacePresets( new SearchModel(), presetProvider, {
			presets: {
				borken: {
					enabled: true
				}
			}
		} );

		assert.true( warningLogger.calledWith( 'No defined namespaces or provider function for borken in $wgAdvancedSearchNamespacePresets' ) );
		assert.false( Object.prototype.hasOwnProperty.call( presets.presets, 'borken' ) );
	} );

	QUnit.test( 'Passing a disabled preset config creates no namespace preset', ( assert ) => {
		const presets = new NamespacePresets( new SearchModel(), presetProvider, {
			presets: {
				turnedoff: {
					enabled: false,
					namespaces: [ '0', '1', '2' ]
				}
			}
		} );

		assert.false( Object.prototype.hasOwnProperty.call( presets.presets, 'turnedoff' ) );
	} );

	QUnit.test( 'Passing a preset config omitting "enabled" creates no namespace preset', ( assert ) => {
		const presets = new NamespacePresets( new SearchModel(), presetProvider, {
			presets: {
				undecided: {
					namespaces: [ '2', '4', '6', '8' ]
				}
			}
		} );

		assert.false( Object.prototype.hasOwnProperty.call( presets.presets, 'undecided' ) );
	} );

	QUnit.test( 'Selecting namespace adds its preset', ( assert ) => {
		const model = new SearchModel(),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					all: {
						enabled: true,
						namespaces: [ '0', '1', '2' ]
					}
				}
			} );
		presets.updateStoreFromPresets( getDummyCheckbox( true ) );
		assert.deepEqual( [ '0', '1', '2' ], model.getNamespaces() );
	} );

	QUnit.test( 'Presets with empty namespace definitions log a warning', ( assert ) => {
		const warningLogger = sandbox.stub( mw.log, 'warn' ),
			model = new SearchModel(),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					emptypreset: {
						enabled: true,
						namespaces: []
					}
				}
			} );

		assert.false( Object.prototype.hasOwnProperty.call( presets.presets, 'emptypreset' ) );
		assert.true( warningLogger.calledWith( 'Empty namespaces for emptypreset in $wgAdvancedSearchNamespacePresets' ) );
	} );

	QUnit.test( 'Presets with invalid namespace definitions log a warning', ( assert ) => {
		presetProvider.namespaceIdsAreValid.returns( false );
		const warningLogger = sandbox.stub( mw.log, 'warn' ),
			model = new SearchModel(),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					notvalid: {
						enabled: true,
						namespaces: [ '1', '2' ]
					}
				}
			} );

		assert.false( Object.prototype.hasOwnProperty.call( presets.presets, 'notvalid' ) );
		assert.true( warningLogger.calledWith( 'AdvancedSearch namespace preset "notvalid" contains unknown namespace id' ) );
	} );

	QUnit.test( 'Preset is initially selected and stays when adding unrelated values', ( assert ) => {
		const model = new SearchModel( [ '1', '2' ] ),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					oneAndTwo: {
						enabled: true,
						namespaces: [ '1', '2' ]
					}
				}
			} );
		assert.deepEqual( presets.getValue(), [ 'oneAndTwo' ], 'initial selection' );
		model.setNamespaces( [ '1', '2', '3' ] );
		assert.deepEqual( presets.getValue(), [ 'oneAndTwo' ], 'added unrelated value' );
	} );

	QUnit.test( 'Preset is initially selected and stays when removing unrelated values', ( assert ) => {
		const model = new SearchModel( [ '1', '2', '3' ] ),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					oneAndTwo: {
						enabled: true,
						namespaces: [ '1', '2' ]
					}
				}
			} );
		assert.deepEqual( presets.getValue(), [ 'oneAndTwo' ], 'initial selection' );
		model.setNamespaces( [ '1', '2' ] );
		assert.deepEqual( presets.getValue(), [ 'oneAndTwo' ], 'removed unrelated value' );
	} );

	QUnit.test( 'Added namespaces of a preset mark the preset as selected', ( assert ) => {
		const model = new SearchModel(),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					discussions: {
						enabled: true,
						namespaces: [ '3', '5', '7', '9', '11', '13', '711' ]
					},
					generalHelp: {
						enabled: true,
						namespaces: [ '4', '12' ]
					}
				}
			} );
		model.setNamespaces( [ '4', '12' ] );
		assert.deepEqual( presets.getValue(), [ 'generalHelp' ] );
	} );

	QUnit.test( 'Added namespaces of two presets mark both presets as selected', ( assert ) => {
		const model = new SearchModel(),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					discussions: {
						enabled: true,
						namespaces: [ '3', '5', '7', '9', '11', '13', '711' ]
					},
					generalHelp: {
						enabled: true,
						namespaces: [ '4', '12' ]
					}
				}
			} );
		model.setNamespaces( [ '4', '12', '3', '5', '7', '9', '11', '13', '711' ] );
		assert.deepEqual( presets.getValue(), [ 'discussions', 'generalHelp' ] );
	} );

	QUnit.test( 'Unselecting namespace removes its preset', ( assert ) => {
		const model = new SearchModel(),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					all: {
						enabled: true,
						namespaces: [ '0', '1', '2' ]
					}
				}
			} );
		model.setNamespaces( [ '0', '1', '2', '3' ] );
		presets.updateStoreFromPresets( getDummyCheckbox( false ) );
		assert.deepEqual( [ '3' ], model.getNamespaces() );
	} );

	QUnit.test( 'Changing the store namespaces to the preset namespaces, selects preset irrespective of order', ( assert ) => {
		const model = new SearchModel(),
			presets = new NamespacePresets( model, presetProvider, {
				presets: {
					all: {
						enabled: true,
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
}() );
