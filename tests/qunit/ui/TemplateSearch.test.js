( function ( $, QUnit, sinon, mw ) {
	'use strict';

	var TemplateSearch,
		sandbox,
		store,
		config;

	QUnit.testStart( function () {
		TemplateSearch = mw.libs.advancedSearch.ui.TemplateSearch;
		sandbox = sinon.sandbox.create();
		store = {
			connect: sandbox.stub(),
			getOption: sandbox.stub().withArgs( 'hastemplate' ).returns( [] ),
			storeOption: sandbox.stub()
		};
		config = {
			optionId: 'hastemplate'
		};
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.ui.TemplateSearch' );

	QUnit.test( 'Store data subscribed to and synced initially', function ( assert ) {
		assert.expect( 4 );

		var setValueSpy = sandbox.spy( TemplateSearch.prototype, 'setValue' );
		store.getOption.withArgs( 'hastemplate' ).returns( [ 'Burg' ] );

		var templateSearch = new TemplateSearch( store, config );

		assert.ok( templateSearch );
		assert.ok( store.connect.calledOnce );
		assert.ok( setValueSpy.withArgs( [ 'Burg' ] ).calledOnce );
		assert.deepEqual( templateSearch.getValue(), [ 'Burg' ] );
	} );

	QUnit.test( 'Store update is applied', function ( assert ) {
		assert.expect( 1 );

		store.getOption.withArgs( 'hastemplate' ).returns( [ 'from', 'beyond' ] );

		var templateSearch = new TemplateSearch( store, config );

		templateSearch.onStoreUpdate();

		assert.deepEqual( templateSearch.getValue(), [ 'from', 'beyond' ] );
	} );

	QUnit.test( 'Mixin method overridden to prevent problems', function ( assert ) {
		assert.expect( 1 );

		var templateSearch = new TemplateSearch( store, config );
		assert.notOk( templateSearch.isReadOnly() );
	} );

	QUnit.test( 'API response processed correctly', function ( assert ) {
		assert.expect( 8 );

		var templateSearch = new TemplateSearch( store, config );

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

		var result = templateSearch.getLookupMenuOptionsFromData( apiData );
		assert.ok( Array.isArray( result ) );
		assert.equal( result.length, 3 );

		assert.equal( result[ 0 ].getLabel(), 'Jochen' );
		assert.equal( result[ 0 ].getData(), 'Jochen' );

		assert.equal( result[ 1 ].getLabel(), 'Jens' );
		assert.equal( result[ 1 ].getData(), 'Jens' );

		assert.equal( result[ 2 ].getLabel(), 'Johannes' );
		assert.equal( result[ 2 ].getData(), 'Johannes' );
	} );

	QUnit.test( 'Items already selected are not suggested', function ( assert ) {
		assert.expect( 4 );

		var templateSearch = new TemplateSearch( store, config );
		templateSearch.setValue( [ 'Jochen', 'Johannes' ] );
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

		var result = templateSearch.getLookupMenuOptionsFromData( apiData );
		assert.ok( Array.isArray( result ) );
		assert.equal( result.length, 1 );

		assert.equal( result[ 0 ].getLabel(), 'Jens' );
		assert.equal( result[ 0 ].getData(), 'Jens' );
	} );

	QUnit.test( 'Page titles post-processes nicely', function ( assert ) {
		assert.expect( 2 );

		var templateSearch = new TemplateSearch( store, config );
		assert.equal( templateSearch.removeNamespace( 'Test' ), 'Test' );
		assert.equal( templateSearch.removeNamespace( 'Template:Test' ), 'Test' );
	} );

	QUnit.test( 'Value picked from menu is added to tags and stored', function ( assert ) {
		assert.expect( 6 );

		var templateSearch = new TemplateSearch( store, config );
		templateSearch.addTag( 'Preexisting' );
		templateSearch.input.setValue( 'My Templ' );
		var item = new OO.ui.TagItemWidget();
		item.setData( 'My Template' );

		// reset storeOption as is was invoked by addTag( 'Preexisting' ) before
		store.storeOption = sandbox.stub();

		templateSearch.onLookupMenuItemChoose( item );

		var tags = templateSearch.getItems();
		assert.ok( Array.isArray( tags ) );
		assert.equal( tags.length, 2 );
		assert.equal( tags[ 0 ].getData(), 'Preexisting' );
		assert.equal( tags[ 1 ].getData(), 'My Template' );

		assert.ok( store.storeOption.withArgs( 'hastemplate', [ 'Preexisting', 'My Template' ] ).calledOnce );

		assert.equal( templateSearch.input.getValue(), '' );
	} );

	QUnit.test( 'Native browser autocomplete is not used', function ( assert ) {
		assert.expect( 1 );

		var templateSearch = new TemplateSearch( store, config );

		assert.equal( $( templateSearch.$input ).attr( 'autocomplete' ), 'off' );
	} );

	QUnit.test( 'Well-formed API request yields result', function ( assert ) {
		assert.expect( 4 );

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

		var templateSearch = new TemplateSearch( store, config );
		$( templateSearch.$input ).val( 'Burg' );

		var result = templateSearch.getLookupRequest();

		assert.ok( getStub.calledOnce );

		assert.equal( result.state(), 'resolved' );
		result.done( function ( doneData ) {
			assert.equal( doneData[ 0 ], 'Burg' );
			assert.deepEqual( doneData[ 1 ], [ 'Template:Burg' ] );
		} );
	} );

	QUnit.test( 'Empty query does not trigger API request', function ( assert ) {
		assert.expect( 3 );

		config.api = new mw.Api();
		var getStub = sandbox.stub( config.api, 'get' );

		var templateSearch = new TemplateSearch( store, config );
		$( templateSearch.$input ).val( '' );

		var result = templateSearch.getLookupRequest();

		assert.notOk( getStub.called );

		assert.equal( result.state(), 'rejected' );
		result.fail( function () {
			assert.ok( true, 'A failed promise is returned' );
		} );
	} );

}( jQuery, QUnit, sinon, mediaWiki ) );
