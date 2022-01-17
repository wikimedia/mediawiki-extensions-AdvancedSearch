( function () {
	'use strict';

	var SearchPreview,
		sandbox,
		store,
		config;

	QUnit.testStart( function () {
		SearchPreview = mw.libs.advancedSearch.ui.SearchPreview;
		sandbox = sinon.sandbox.create();
		store = {
			connect: sandbox.stub(),
			getField: sandbox.stub(),
			removeField: sandbox.stub(),
			getSortMethod: sandbox.stub().returns( '' )
		};
		config = {};
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.ui.SearchPreview' );

	QUnit.test( 'Label gets setup', function ( assert ) {
		config = {
			label: 'something'
		};
		var searchPreview = new SearchPreview( store, config );

		assert.strictEqual( searchPreview.label.getLabel(), 'something' );
	} );

	QUnit.test( 'Store data subscribed to and synced initially', function ( assert ) {
		var updatePreviewSpy = sandbox.spy( SearchPreview.prototype, 'updatePreview' );

		// eslint-disable-next-line no-new
		new SearchPreview( store, config );

		assert.true( store.connect.calledOnce );
		assert.true( updatePreviewSpy.calledOnce );
	} );

	QUnit.test( 'Store state is reflected in preview', function ( assert ) {
		var generateTagSpy = sandbox.spy( SearchPreview.prototype, 'generateTag' );

		store.getField.withArgs( 'somename' ).returns( 'field one value' );
		store.getField.withArgs( 'another' ).returns( 'field two value' );

		config.fieldNames = [ 'somename', 'another' ];

		var searchPreview = new SearchPreview( store, config );

		var $pills = $( '.mw-advancedSearch-searchPreview-previewPill', searchPreview.$element );
		assert.strictEqual( $pills.length, 3 );

		assert.true( store.getField.calledTwice );
		assert.strictEqual( generateTagSpy.callCount, 3 );

		assert.true( generateTagSpy.withArgs( 'somename', 'field one value' ).calledOnce );
		assert.true( generateTagSpy.withArgs( 'another', 'field two value' ).calledOnce );
	} );

	QUnit.test( 'Fields are correctly selected for preview', function ( assert ) {
		var searchPreview = new SearchPreview( store, config );

		assert.false( searchPreview.skipFieldInPreview( 'plain', 'searchme' ) );
		assert.false( searchPreview.skipFieldInPreview( 'filetype', 'bitmap' ) );
		assert.false( searchPreview.skipFieldInPreview( 'phrase', [ 'alpha', 'omega' ] ) );
		assert.false( searchPreview.skipFieldInPreview( 'fileh', [ '<', '30' ] ) );
		assert.false( searchPreview.skipFieldInPreview( 'filew', [ '>', '1400' ] ) );
		assert.false( searchPreview.skipFieldInPreview( 'filew', [ '', '600' ] ) );

		assert.true( searchPreview.skipFieldInPreview( 'plain', '' ) );
		assert.true( searchPreview.skipFieldInPreview( 'plain', null ) );
		assert.true( searchPreview.skipFieldInPreview( '', null ) );
		assert.true( searchPreview.skipFieldInPreview( 'phrase', [] ) );

		assert.true( searchPreview.skipFieldInPreview( 'fileh', null ) );
		assert.true( searchPreview.skipFieldInPreview( 'fileh', [] ) );
		assert.true( searchPreview.skipFieldInPreview( 'fileh', [ '>', null ] ) );
		assert.true( searchPreview.skipFieldInPreview( 'filew', null ) );
		assert.true( searchPreview.skipFieldInPreview( 'filew', [] ) );
		assert.true( searchPreview.skipFieldInPreview( 'filew', [ '>', null ] ) );
	} );

	QUnit.test( 'Tag is generated', function ( assert ) {
		var messageStub = sandbox.stub( mw, 'msg' ).withArgs( 'advancedsearch-field-somename' ).returns( 'my label:' );
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'somename', 'my field value' );

		var element = tag.$element[ 0 ];

		assert.true( messageStub.calledOnce );
		assert.strictEqual( element.title, 'my field value' );
		// https://phabricator.wikimedia.org/T172781 prevents a semantic way to check for draggable
		assert.true( $( element ).hasClass( 'oo-ui-draggableElement-undraggable' ) );
		assert.strictEqual( $( '.mw-advancedSearch-searchPreview-content', element ).html(), '<bdi>my field value</bdi>' );
		assert.strictEqual( $( '.oo-ui-labelElement-label span', element ).html(), 'my label:' );
	} );

	QUnit.test( 'Tag content is HTML-safe', function ( assert ) {
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'whatever', '<script>alert("evil");</script>' );

		var element = tag.$element[ 0 ];

		assert.strictEqual( $( '.mw-advancedSearch-searchPreview-content', element ).html(), '<bdi>&lt;script&gt;alert("evil");&lt;/script&gt;</bdi>' );
	} );

	QUnit.test( 'Tag label is HTML-safe', function ( assert ) {
		sandbox.stub( mw, 'msg' ).withArgs( 'advancedsearch-field-whatever' ).returns( '<div>block</div>' );
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'whatever', 'lorem' );

		var element = tag.$element[ 0 ];

		assert.strictEqual( $( '.oo-ui-labelElement-label span', element ).html(), '&lt;div&gt;block&lt;/div&gt;' );
	} );

	QUnit.test( 'Tag removals clears store', function ( assert ) {
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'somename', 'my field value' );

		tag.remove();
		assert.true( store.removeField.withArgs( 'somename' ).calledOnce );
	} );

	QUnit.test( 'Showing rendered pills', function ( assert ) {
		config.fieldNames = [ 'one', 'two' ];

		store.getField.withArgs( 'one' ).returns( 'field one value' );
		store.getField.withArgs( 'two' ).returns( 'field two value' );

		var searchPreview = new SearchPreview( store, config );
		searchPreview.showPreview();

		assert.strictEqual( searchPreview.$element.find( '.mw-advancedSearch-searchPreview-previewPill' ).length, 3 );
	} );

	QUnit.test( 'Hiding removes pills', function ( assert ) {
		config.fieldNames = [ 'one', 'two' ];

		var searchPreview = new SearchPreview( store, config );
		searchPreview.hidePreview();

		assert.strictEqual( searchPreview.$element.find( '.mw-advancedSearch-searchPreview-previewPill' ).length, 0 );
	} );

	QUnit.test( 'Scalar values get formatted well', function ( assert ) {
		var searchPreview = new SearchPreview( store, config );

		assert.strictEqual( searchPreview.formatValue( 'someOption', '' ), '' );
		assert.strictEqual( searchPreview.formatValue( 'someOption', 'hello' ), 'hello' );
		assert.strictEqual( searchPreview.formatValue( 'someOption', ' stray whitespace  ' ), 'stray whitespace' );
	} );

	QUnit.test( 'Array values get formatted well', function ( assert ) {
		var searchPreview = new SearchPreview( store, config );

		assert.strictEqual( searchPreview.formatValue( 'someOption', [ 'some', 'words', 'in', 'combination' ] ), 'some, words, in, combination' );
		assert.strictEqual( searchPreview.formatValue( 'someOption', [ 'related words', 'not', 'so' ] ), 'related words, not, so' );
		assert.strictEqual( searchPreview.formatValue( 'someOption', [ '', ' stray', 'whitespace  ' ] ), 'stray, whitespace' );
	} );

	QUnit.test( 'Dimension values get formatted well', function ( assert ) {
		var searchPreview = new SearchPreview( store, config );
		var translationStub = sandbox.stub( mw, 'msg' );
		translationStub.withArgs( 'advancedsearch-filesize-equals-symbol' ).returns( '=' );
		translationStub.withArgs( 'advancedsearch-filesize-greater-than-symbol' ).returns( '>' );
		translationStub.withArgs( 'advancedsearch-filesize-smaller-than-symbol' ).returns( '<' );

		assert.strictEqual( searchPreview.formatValue( 'someOption', [ '', '' ] ), '' );
		assert.strictEqual( searchPreview.formatValue( 'fileh', [ '', 1000 ] ), '= 1000' );
		assert.strictEqual( searchPreview.formatValue( 'fileh', [ '>', 300 ] ), '> 300' );
		assert.strictEqual( searchPreview.formatValue( 'filew', [ '<', 1400 ] ), '< 1400' );

		assert.strictEqual( translationStub.callCount, 3 );
	} );

}() );
