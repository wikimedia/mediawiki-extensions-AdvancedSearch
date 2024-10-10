( function () {
	const { NamespaceFilters, SearchModel } = require( 'ext.advancedSearch.elements' );

	QUnit.module( 'ext.advancedSearch.ui.NamespaceFilters' );

	QUnit.assert.namespaceElementsPresent = function ( element, expectedNamespaces, message ) {
		const actualNamespaces = [];
		element.find( 'input' ).each( function () {
			actualNamespaces.push( $( this ).prop( 'name' ).replace( /^ns/, '' ) );
		} );
		this.deepEqual( actualNamespaces, expectedNamespaces, message );
	};

	QUnit.test( 'StoreUpdate event handler updates hidden namespace fields', ( assert ) => {
		const model = new SearchModel(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		assert.namespaceElementsPresent( filter.$namespaceContainer, [], 'There is no hardcoded namespace preset' );
		model.setNamespaces( [ '1', '3' ] );
		assert.namespaceElementsPresent( filter.$namespaceContainer, [ '1', '3' ] );
	} );

	QUnit.test( 'Value update propagates to model', ( assert ) => {
		const model = new SearchModel(),
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

	QUnit.test( 'Choosing a namespace from the menu clears the input field', ( assert ) => {
		const model = new SearchModel(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		filter.input.setValue( 'Use' );
		filter.getMenu().chooseItem( filter.getMenu().getItems()[ 0 ] );
		assert.strictEqual( filter.input.getValue(), '' );
	} );

	QUnit.test( 'On multiple namespaces either one can be removed', ( assert ) => {
		const model = new SearchModel(),
			filter = new NamespaceFilters( model, {
				namespaces: {
					0: 'Article',
					1: 'Talk',
					2: 'User',
					3: 'UserTalk'
				}
			} );

		model.setNamespaces( [ '1', '2', '3' ] );
		assert.false( filter.getMenu().getItemFromLabel( 'Article' ).isSelected() );
		assert.true( filter.getMenu().getItemFromLabel( 'Talk' ).isSelected() );
		assert.true( filter.getMenu().getItemFromLabel( 'User' ).isSelected() );
		assert.true( filter.getMenu().getItemFromLabel( 'UserTalk' ).isSelected() );
	} );
}() );
