( function ( mw ) {
	var NamespacePresets = mw.libs.advancedSearch.ui.NamespacePresets,
		Model = mw.libs.advancedSearch.dm.SearchModel;

	QUnit.module( 'ext.advancedSearch.ui.NamespacePresets' );

	function getDummyCheckbox( selected ) {
		return {
			getData: function () { return 'all'; },
			selected: selected
		};
	}

	QUnit.test( 'Selecting namespace adds its preset', function ( assert ) {
		assert.expect( 1 );

		var model = new Model(),
			presets = new NamespacePresets( model, {
				presets: {
					all: {
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
						namespaces: [ '3', '5', '7', '9', '11', '13', '711' ],
						label: 'Discussion'
					},
					generalHelp: {
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
						namespaces: [ '3', '5', '7', '9', '11', '13', '711' ],
						label: 'Discussion'
					},
					generalHelp: {
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
