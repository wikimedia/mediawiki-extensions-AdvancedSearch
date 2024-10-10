'use strict';
( function () {

	const { MultiselectLookup } = require( 'ext.advancedSearch.SearchFieldUI' );

	let sandbox,
		store,
		config;

	QUnit.testStart( () => {
		const queryTemplatePages = sinon.match( ( value ) => value.action === 'query' &&
				value.prop === 'info' &&
				value.titles.startsWith( mw.config.get( 'wgFormattedNamespaces' )[ 10 ] ) );
		sandbox = sinon.sandbox.create();
		store = {
			connect: sandbox.stub(),
			getField: sandbox.stub().withArgs( 'hastemplate' ).returns( [] ),
			hasFieldChanged: sandbox.stub(),
			storeField: sandbox.stub()
		};
		config = {
			fieldId: 'hastemplate',
			lookupId: 'template',
			api: new mw.Api()
		};
		// Stub out API to avoid queries if template pages exist
		sandbox.stub( config.api, 'get' ).withArgs( queryTemplatePages ).returns( $.Deferred().resolve( { query: { pages: {} } } ).promise() );
	} );

	QUnit.testDone( () => {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.dm.MultiselectLookup' );

	QUnit.test( 'Value picked from menu is added to tags and stored', ( assert ) => {
		const lookup = new MultiselectLookup( store, config );
		lookup.addTag( 'Preexisting' );
		lookup.input.setValue( 'My Templ' );
		const item = new OO.ui.TagItemWidget();
		item.setData( 'My Template' );

		// reset storeField as is was invoked by addTag( 'Preexisting' ) before
		store.storeField = sandbox.stub();

		lookup.onLookupMenuChoose( item );

		const tags = lookup.getItems();
		assert.true( Array.isArray( tags ) );
		assert.strictEqual( tags.length, 2 );
		assert.strictEqual( tags[ 0 ].getData(), 'Preexisting' );
		assert.strictEqual( tags[ 1 ].getData(), 'My Template' );

		assert.true( store.storeField.withArgs( 'hastemplate', [ 'Preexisting', 'My Template' ] ).calledOnce );

		assert.strictEqual( lookup.input.getValue(), '' );
	} );

	QUnit.test( 'Store data subscribed to and synced initially', ( assert ) => {
		const setValueSpy = sandbox.spy( MultiselectLookup.prototype, 'setValue' );

		store.getField.withArgs( 'hastemplate' ).returns( [ 'Burg' ] );
		store.hasFieldChanged.withArgs( 'hastemplate' ).returns( true );

		const lookupField = new MultiselectLookup( store, config );

		assert.true( store.connect.calledOnce );
		assert.true( setValueSpy.withArgs( [ 'Burg' ] ).calledOnce );
		assert.deepEqual( lookupField.getValue(), [ 'Burg' ] );
	} );

	QUnit.test( 'Store update is applied', ( assert ) => {
		store.getField.withArgs( 'hastemplate' ).returns( [ 'from', 'beyond' ] );
		store.hasFieldChanged.withArgs( 'hastemplate' ).returns( true );

		const lookupField = new MultiselectLookup( store, config );

		lookupField.onStoreUpdate();

		assert.deepEqual( lookupField.getValue(), [ 'from', 'beyond' ] );
	} );

	QUnit.test( 'Mixin method overridden to prevent problems', ( assert ) => {
		const lookupField = new MultiselectLookup( store, config );
		assert.false( lookupField.isReadOnly() );
	} );

	QUnit.test( 'API response processed correctly', ( assert ) => {
		const lookupField = new MultiselectLookup( store, config );

		const apiData = [
			'j',
			[
				'Template:Jochen',
				'Template:Jens',
				'Template:Johannes'
			],
			[
				'',
				'',
				''
			],
			[
				'http://mywiki/index.php?title=Template:Jochen',
				'http://mywiki/index.php?title=Template:Jens',
				'http://mywiki/index.php?title=Template:Johannes'
			]
		];

		const result = lookupField.getLookupMenuOptionsFromData( apiData );
		assert.true( Array.isArray( result ) );
		assert.strictEqual( result.length, 3 );

		assert.strictEqual( result[ 0 ].getLabel(), 'Jochen' );
		assert.strictEqual( result[ 0 ].getData(), 'Jochen' );

		assert.strictEqual( result[ 1 ].getLabel(), 'Jens' );
		assert.strictEqual( result[ 1 ].getData(), 'Jens' );

		assert.strictEqual( result[ 2 ].getLabel(), 'Johannes' );
		assert.strictEqual( result[ 2 ].getData(), 'Johannes' );
	} );

	QUnit.test( 'Items already selected are not suggested', ( assert ) => {
		const lookupField = new MultiselectLookup( store, config );

		lookupField.setValue( [ 'Jochen', 'Johannes' ] );
		const apiData = [
			'j',
			[
				'Template:Jochen',
				'Template:Jens',
				'Template:Johannes'
			],
			[
				'',
				'',
				''
			],
			[
				'http://mywiki/index.php?title=Template:Jochen',
				'http://mywiki/index.php?title=Template:Jens',
				'http://mywiki/index.php?title=Template:Johannes'
			]
		];

		const result = lookupField.getLookupMenuOptionsFromData( apiData );
		assert.true( Array.isArray( result ) );
		assert.strictEqual( result.length, 1 );

		assert.strictEqual( result[ 0 ].getLabel(), 'Jens' );
		assert.strictEqual( result[ 0 ].getData(), 'Jens' );
	} );

	QUnit.test( 'Page titles post-processes nicely', ( assert ) => {
		const lookupField = new MultiselectLookup( store, config );
		assert.strictEqual( lookupField.removeNamespace( 'Test' ), 'Test' );
		assert.strictEqual( lookupField.removeNamespace( 'Template:Test' ), 'Test' );
		assert.strictEqual( lookupField.removeNamespace( 'User:Foo/Bar.js' ), 'Foo/Bar.js' );
	} );

	QUnit.test( 'Native browser autocomplete is not used', ( assert ) => {
		const lookupField = new MultiselectLookup( store, config );

		assert.strictEqual( $( lookupField.$input ).attr( 'autocomplete' ), 'off' );
	} );

	QUnit.test( 'Well-formed API request yields result', ( assert ) => {
		config.api = new mw.Api();
		const getStub = sandbox.stub( config.api, 'get' ).withArgs( {
			action: 'opensearch',
			search: 'Burg',
			namespace: 10
		} ).returns( $.Deferred().resolve( [
			'Burg',
			[
				'Template:Burg'
			],
			[
				''
			],
			[
				'http://mywiki/index.php?title=Template:Burg'
			]
		] ).promise() );

		const lookupField = new MultiselectLookup( store, config );
		$( lookupField.$input ).val( 'Burg' );

		const result = lookupField.getLookupRequest();
		assert.true( getStub.calledOnce );

		assert.strictEqual( result.state(), 'resolved' );
		result.done( ( doneData ) => {
			assert.strictEqual( doneData[ 0 ], 'Burg' );
			assert.deepEqual( doneData[ 1 ], [ 'Template:Burg' ] );
		} );
	} );

	QUnit.test( 'Empty query does not trigger API request', ( assert ) => {
		config.api = new mw.Api();
		const getStub = sandbox.stub( config.api, 'get' );

		const lookupField = new MultiselectLookup( store, config );
		$( lookupField.$input ).val( '' );

		const result = lookupField.getLookupRequest();

		assert.false( getStub.called );

		assert.strictEqual( result.state(), 'rejected' );
		result.fail( () => {
			assert.true( true, 'A failed promise is returned' );
		} );
	} );
}() );
