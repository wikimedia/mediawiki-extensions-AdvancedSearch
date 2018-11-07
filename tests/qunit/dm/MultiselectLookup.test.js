( function () {
	'use strict';

	var MultiselectLookup,
		sandbox,
		store,
		config;

	QUnit.testStart( function () {
		var queryTemplatePages = sinon.match( function ( value ) {
			return value.action === 'query' &&
				value.prop === 'info' &&
				value.titles.match( /Template:/ );
		} );
		MultiselectLookup = mw.libs.advancedSearch.dm.MultiselectLookup;
		sandbox = sinon.sandbox.create();
		store = {
			connect: sandbox.stub(),
			getOption: sandbox.stub().withArgs( 'hastemplate' ).returns( [] ),
			hasOptionChanged: sandbox.stub(),
			storeOption: sandbox.stub()
		};
		config = {
			optionId: 'hastemplate',
			lookupId: 'template',
			api: new mw.Api()
		};
		// Stub out API to avoid queries if template pages exist
		sandbox.stub( config.api, 'get' ).withArgs( queryTemplatePages ).returns( $.Deferred().resolve( { query: { pages: {} } } ).promise() );
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.dm.MultiselectLookup' );

	QUnit.test( 'Value picked from menu is added to tags and stored', function ( assert ) {
		var lookup = new MultiselectLookup( store, config );
		lookup.addTag( 'Preexisting' );
		lookup.input.setValue( 'My Templ' );
		var item = new OO.ui.TagItemWidget();
		item.setData( 'My Template' );

		// reset storeOption as is was invoked by addTag( 'Preexisting' ) before
		store.storeOption = sandbox.stub();

		lookup.onLookupMenuItemChoose( item );

		var tags = lookup.getItems();
		assert.ok( Array.isArray( tags ) );
		assert.strictEqual( tags.length, 2 );
		assert.strictEqual( tags[ 0 ].getData(), 'Preexisting' );
		assert.strictEqual( tags[ 1 ].getData(), 'My Template' );

		assert.ok( store.storeOption.withArgs( 'hastemplate', [ 'Preexisting', 'My Template' ] ).calledOnce );

		assert.strictEqual( lookup.input.getValue(), '' );
	} );

	QUnit.test( 'Store data subscribed to and synced initially', function ( assert ) {
		var setValueSpy = sandbox.spy( MultiselectLookup.prototype, 'setValue' );

		store.getOption.withArgs( 'hastemplate' ).returns( [ 'Burg' ] );
		store.hasOptionChanged.withArgs( 'hastemplate' ).returns( true );

		var lookupField = new MultiselectLookup( store, config );

		assert.ok( lookupField );
		assert.ok( store.connect.calledOnce );
		assert.ok( setValueSpy.withArgs( [ 'Burg' ] ).calledOnce );
		assert.deepEqual( lookupField.getValue(), [ 'Burg' ] );
	} );

	QUnit.test( 'Store update is applied', function ( assert ) {
		store.getOption.withArgs( 'hastemplate' ).returns( [ 'from', 'beyond' ] );
		store.hasOptionChanged.withArgs( 'hastemplate' ).returns( true );

		var lookupField = new MultiselectLookup( store, config );

		lookupField.onStoreUpdate();

		assert.deepEqual( lookupField.getValue(), [ 'from', 'beyond' ] );
	} );

	QUnit.test( 'Mixin method overridden to prevent problems', function ( assert ) {
		var lookupField = new MultiselectLookup( store, config );
		assert.notOk( lookupField.isReadOnly() );
	} );

	QUnit.test( 'API response processed correctly', function ( assert ) {
		var lookupField = new MultiselectLookup( store, config );

		var apiData = [
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

		var result = lookupField.getLookupMenuOptionsFromData( apiData );
		assert.ok( Array.isArray( result ) );
		assert.strictEqual( result.length, 3 );

		assert.strictEqual( result[ 0 ].getLabel(), 'Jochen' );
		assert.strictEqual( result[ 0 ].getData(), 'Jochen' );

		assert.strictEqual( result[ 1 ].getLabel(), 'Jens' );
		assert.strictEqual( result[ 1 ].getData(), 'Jens' );

		assert.strictEqual( result[ 2 ].getLabel(), 'Johannes' );
		assert.strictEqual( result[ 2 ].getData(), 'Johannes' );
	} );

	QUnit.test( 'Items already selected are not suggested', function ( assert ) {
		var lookupField = new MultiselectLookup( store, config );

		lookupField.setValue( [ 'Jochen', 'Johannes' ] );
		var apiData = [
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

		var result = lookupField.getLookupMenuOptionsFromData( apiData );
		assert.ok( Array.isArray( result ) );
		assert.strictEqual( result.length, 1 );

		assert.strictEqual( result[ 0 ].getLabel(), 'Jens' );
		assert.strictEqual( result[ 0 ].getData(), 'Jens' );
	} );

	QUnit.test( 'Page titles post-processes nicely', function ( assert ) {
		var lookupField = new MultiselectLookup( store, config );
		assert.strictEqual( lookupField.removeNamespace( 'Test' ), 'Test' );
		assert.strictEqual( lookupField.removeNamespace( 'Template:Test' ), 'Test' );
	} );

	QUnit.test( 'Native browser autocomplete is not used', function ( assert ) {
		var lookupField = new MultiselectLookup( store, config );

		assert.strictEqual( $( lookupField.$input ).attr( 'autocomplete' ), 'off' );
	} );

	QUnit.test( 'Well-formed API request yields result', function ( assert ) {
		config.api = new mw.Api();
		var getStub = sandbox.stub( config.api, 'get' ).withArgs( {
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

		var lookupField = new MultiselectLookup( store, config );
		$( lookupField.$input ).val( 'Burg' );

		var result = lookupField.getLookupRequest();
		assert.ok( getStub.calledOnce );

		assert.strictEqual( result.state(), 'resolved' );
		result.done( function ( doneData ) {
			assert.strictEqual( doneData[ 0 ], 'Burg' );
			assert.deepEqual( doneData[ 1 ], [ 'Template:Burg' ] );
		} );
	} );

	QUnit.test( 'Empty query does not trigger API request', function ( assert ) {
		config.api = new mw.Api();
		var getStub = sandbox.stub( config.api, 'get' );

		var lookupField = new MultiselectLookup( store, config );
		$( lookupField.$input ).val( '' );

		var result = lookupField.getLookupRequest();

		assert.notOk( getStub.called );

		assert.strictEqual( result.state(), 'rejected' );
		result.fail( function () {
			assert.ok( true, 'A failed promise is returned' );
		} );
	} );

}() );
