( function ( mw ) {
	var NamespaceFilters = mw.libs.advancedSearch.ui.NamespaceFilters,
		Model = mw.libs.advancedSearch.dm.SearchModel;

	QUnit.module( 'ext.advancedSearch.ui.NamespaceFilters' );

	QUnit.test( 'User namespace icons are set by default', function ( assert ) {
		assert.expect( 2 );

		var filter = new NamespaceFilters( new Model(), {} );
		assert.equal( filter.getNamespaceIcon( 2 ), 'userAvatar' );
		assert.equal( filter.getNamespaceIcon( 3 ), 'userTalk' );
	} );

	QUnit.test( 'When namespace icons are not set, default icons are returned', function ( assert ) {
		assert.expect( 2 );

		var filter = new NamespaceFilters( new Model(), {
			namespaceIcons: {}
		} );
		assert.equal( filter.getNamespaceIcon( 2 ), 'article' );
		assert.equal( filter.getNamespaceIcon( 3 ), 'stripeSummary' );
	} );

	QUnit.test( 'Namespace object key-value-pairs are appended to menu options', function ( assert ) {
		assert.expect( 5 );

		var filter = new NamespaceFilters( new Model(), {
				options: [ {
					data: 'test',
					label: 'first item'
				} ],
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} ),
			menu = filter.getMenu();
		assert.equal( menu.getItemCount(), 5 );

		var firstItem = menu.findItemFromData( 'test' ),
			lastItem = menu.findItemFromData( '3' );
		assert.ok( firstItem );
		assert.ok( lastItem );
		assert.equal( menu.getItemIndex( firstItem ), 0 );
		assert.equal( menu.getItemIndex( lastItem ), 4 );
	} );

	QUnit.test( 'Namespaces without labels are skipped', function ( assert ) {
		assert.expect( 3 );

		var filter = new NamespaceFilters( new Model(), {
				namespaces: {
					0: '',
					1: '',
					2: 'User',
					3: 'UserTalk'
				}
			} ),
			menu = filter.getMenu();
		assert.equal( menu.getItemCount(), 2 );
		assert.notOk( menu.findItemFromData( '0' ) );
		assert.notOk( menu.findItemFromData( '1' ) );
	} );

	QUnit.assert.namespaceElementsPresent = function ( element, expectedNamespaces, message ) {
		var actualNamespaces = [];
		element.find( 'input' ).each( function () {
			actualNamespaces.push( $( this ).prop( 'name' ).replace( /^ns/, '' ) );
		} );
		this.deepEqual( actualNamespaces, expectedNamespaces, message );
	};

	QUnit.test( 'StoreUpdate event handler updates hidden namespace fields', function ( assert ) {
		assert.expect( 2 );

		var model = new Model(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		assert.namespaceElementsPresent( filter.$namespaceContainer, [ '0' ], 'Article namespace should be initialized out of the box' );
		model.setNamespaces( [ '1', '3' ] );
		assert.namespaceElementsPresent( filter.$namespaceContainer, [ '1', '3' ] );
	} );

	QUnit.test( 'Lonely namespace can not be removed', function ( assert ) {
		assert.expect( 1 );

		var model = new Model(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		model.setNamespaces( [ '2' ] );
		assert.equal( filter.getItems()[ 0 ].isDisabled(), true );
	} );

	QUnit.test( 'On multiple namespaces either one can be removed', function ( assert ) {
		assert.expect( 3 );

		var model = new Model(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		model.setNamespaces( [ '1', '2', '3' ] );
		assert.equal( filter.getItems()[ 0 ].isDisabled(), false );
		assert.equal( filter.getItems()[ 1 ].isDisabled(), false );
		assert.equal( filter.getItems()[ 2 ].isDisabled(), false );
	} );

	QUnit.test( 'Value update propagates to model', function ( assert ) {
		assert.expect( 1 );

		var model = new Model(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		model.setNamespaces = function ( namespaces ) {
			assert.deepEqual( namespaces, [ '1', '2' ] );
		};
		filter.getValue = function () {
			return [ '1', '2' ];
		};

		filter.onValueUpdate();
	} );

	QUnit.test( 'Selected namespaces are disabled in menu', function ( assert ) {
		assert.expect( 1 );

		var model = new Model(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		model.setNamespaces( [ '1' ] );
		assert.equal( filter.getMenu().getItems()[ 1 ].isDisabled(), true );
	} );

	QUnit.test( 'Unselected namespaces are not disabled in menu', function ( assert ) {
		assert.expect( 1 );

		var model = new Model(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		model.setNamespaces( [ '1', '2', '3' ] );
		assert.equal( filter.getMenu().getItems()[ 0 ].isDisabled(), false );
	} );

	QUnit.test( 'Choosing a namespace from the menu clears the input field', function ( assert ) {
		var model = new Model(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		model.setNamespaces( [ '0' ] );
		filter.input.setValue( 'Use' );
		filter.getMenu().chooseItem( filter.getMenu().getItems()[ 0 ] );
		assert.equal( filter.input.getValue(), '' );
	} );

}( mediaWiki ) );
