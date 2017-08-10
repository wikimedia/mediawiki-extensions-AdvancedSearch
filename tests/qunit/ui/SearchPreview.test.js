( function ( $, QUnit, sinon, mw ) {
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
			getOption: sandbox.stub(),
			removeOption: sandbox.stub()
		};
		config = {};
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.ui.SearchPreview' );

	QUnit.test( 'Label gets setup', 1, function ( assert ) {
		config = {
			label: 'something'
		};
		var searchPreview = new SearchPreview( store, config );

		assert.equal( 'something', searchPreview.label.getLabel() );
	} );

	QUnit.test( 'Store data subscribed to and synced initially', 3, function ( assert ) {
		var updatePreviewSpy = sandbox.spy( SearchPreview.prototype, 'updatePreview' );

		var searchPreview = new SearchPreview( store, config );

		assert.ok( searchPreview );
		assert.ok( store.connect.calledOnce );
		assert.ok( updatePreviewSpy.calledOnce );
	} );

	QUnit.test( 'Store state is reflected in preview', 5, function ( assert ) {
		var generateTagSpy = sandbox.spy( SearchPreview.prototype, 'generateTag' );

		store.getOption.withArgs( 'somename' ).returns( 'field one value' );
		store.getOption.withArgs( 'another' ).returns( 'field two value' );

		config.previewOptions = [ 'somename', 'another' ];

		var searchPreview = new SearchPreview( store, config );

		var pills = $( '.mw-advancedSearch-searchPreview-previewPill', searchPreview.$element );
		assert.equal( pills.length, 2 );

		assert.ok( store.getOption.calledTwice );
		assert.ok( generateTagSpy.calledTwice );

		assert.ok( generateTagSpy.withArgs( 'somename', 'field one value' ).calledOnce );
		assert.ok( generateTagSpy.withArgs( 'another', 'field two value' ).calledOnce );
	} );

	QUnit.test( 'Options are correctly selected for preview', 16, function ( assert ) {
		var searchPreview = new SearchPreview( store, config );

		assert.notOk( searchPreview.skipOptionInPreview( 'plain', 'searchme' ) );
		assert.notOk( searchPreview.skipOptionInPreview( 'filetype', 'bitmap' ) );
		assert.notOk( searchPreview.skipOptionInPreview( 'phrase', [ 'alpha', 'omega' ] ) );
		assert.notOk( searchPreview.skipOptionInPreview( 'fileh', [ '<', '30' ] ) );
		assert.notOk( searchPreview.skipOptionInPreview( 'filew', [ '>', '1400' ] ) );
		assert.notOk( searchPreview.skipOptionInPreview( 'filew', [ '', '600' ] ) );

		assert.ok( searchPreview.skipOptionInPreview( 'plain', '' ) );
		assert.ok( searchPreview.skipOptionInPreview( 'plain', null ) );
		assert.ok( searchPreview.skipOptionInPreview( '', null ) );
		assert.ok( searchPreview.skipOptionInPreview( 'phrase', [] ) );

		assert.ok( searchPreview.skipOptionInPreview( 'fileh', null ) );
		assert.ok( searchPreview.skipOptionInPreview( 'fileh', [] ) );
		assert.ok( searchPreview.skipOptionInPreview( 'fileh', [ '>', null ] ) );
		assert.ok( searchPreview.skipOptionInPreview( 'filew', null ) );
		assert.ok( searchPreview.skipOptionInPreview( 'filew', [] ) );
		assert.ok( searchPreview.skipOptionInPreview( 'filew', [ '>', null ] ) );
	} );

	QUnit.test( 'Tag is generated', 5, function ( assert ) {
		var messageStub = sandbox.stub( mw, 'msg' ).withArgs( 'advancedsearch-field-somename' ).returns( 'my label:' );
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'somename', 'my field value' );

		var element = tag.$element[ 0 ];

		assert.ok( messageStub.calledOnce );
		assert.equal( element.title, 'my field value' );
		// https://phabricator.wikimedia.org/T172781 prevents a semantic way to check for draggable
		assert.ok( $( element ).hasClass( 'oo-ui-draggableElement-undraggable' ) );
		assert.equal( $( '.content', element ).html(), '<bdi>my field value</bdi>' );
		assert.equal( $( '.oo-ui-labelElement-label', element ).html(), 'my label:' );
	} );

	QUnit.test( 'Tag content is HTML-safe', 1, function ( assert ) {
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'whatever', '<script>alert("evil");</script>' );

		var element = tag.$element[ 0 ];

		assert.equal( $( '.content', element ).html(), '<bdi>&lt;script&gt;alert("evil");&lt;/script&gt;</bdi>' );
	} );

	QUnit.test( 'Tag label is HTML-safe', 1, function ( assert ) {
		sandbox.stub( mw, 'msg' ).withArgs( 'advancedsearch-field-whatever' ).returns( '<div>block</div>' );
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'whatever', 'lorem' );

		var element = tag.$element[ 0 ];

		assert.equal( $( '.oo-ui-labelElement-label', element ).html(), '&lt;div&gt;block&lt;/div&gt;' );
	} );

	QUnit.test( 'Tag removals clears store', 1, function ( assert ) {
		var searchPreview = new SearchPreview( store, config );
		var tag = searchPreview.generateTag( 'somename', 'my field value' );

		tag.remove();
		assert.ok( store.removeOption.withArgs( 'somename' ).calledOnce );
	} );

	QUnit.test( 'Showing renders pills', 1, function ( assert ) {
		config.previewOptions = [ 'one', 'two' ];

		store.getOption.withArgs( 'one' ).returns( 'field one value' );
		store.getOption.withArgs( 'two' ).returns( 'field two value' );

		var searchPreview = new SearchPreview( store, config );
		searchPreview.showPreview();

		assert.equal( searchPreview.$element.find( '.mw-advancedSearch-searchPreview-previewPill' ).length, 2 );
	} );

	QUnit.test( 'Hiding removes pills', 1, function ( assert ) {
		config.previewOptions = [ 'one', 'two' ];

		var searchPreview = new SearchPreview( store, config );
		searchPreview.hidePreview();

		assert.equal( searchPreview.$element.find( '.mw-advancedSearch-searchPreview-previewPill' ).length, 0 );
	} );

	QUnit.test( 'Scalar values get formatted well', 3, function ( assert ) {
		var searchPreview = new SearchPreview( store, config );

		assert.equal( searchPreview.formatValue( 'someOption', '' ), '' );
		assert.equal( searchPreview.formatValue( 'someOption', 'hello' ), 'hello' );
		assert.equal( searchPreview.formatValue( 'someOption', ' stray whitespace  ' ), 'stray whitespace' );
	} );

	QUnit.test( 'Array values get formatted well', 3, function ( assert ) {
		var searchPreview = new SearchPreview( store, config );

		assert.equal( searchPreview.formatValue( 'someOption', [ 'some', 'words', 'in', 'combination' ] ), 'some, words, in, combination' );
		assert.equal( searchPreview.formatValue( 'someOption', [ 'related words', 'not', 'so' ] ), 'related words, not, so' );
		assert.equal( searchPreview.formatValue( 'someOption', [ '', ' stray', 'whitespace  ' ] ), 'stray, whitespace' );
	} );

	QUnit.test( 'Dimension values get formatted well', 5, function ( assert ) {
		var searchPreview = new SearchPreview( store, config );
		var translationStub = sandbox.stub( mw, 'msg' );
		translationStub.withArgs( 'advancedSearch-filesize-equals-symbol' ).returns( '=' );
		translationStub.withArgs( 'advancedSearch-filesize-greater-than-symbol' ).returns( '>' );
		translationStub.withArgs( 'advancedSearch-filesize-smaller-than-symbol' ).returns( '<' );

		assert.equal( searchPreview.formatValue( 'someOption', [ '', '' ] ), '' );
		assert.equal( searchPreview.formatValue( 'fileh', [ '', 1000 ] ), '= 1000' );
		assert.equal( searchPreview.formatValue( 'fileh', [ '>', 300 ] ), '> 300' );
		assert.equal( searchPreview.formatValue( 'filew', [ '<', 1400 ] ), '< 1400' );

		assert.equal( translationStub.callCount, 3 );
	} );

}( jQuery, QUnit, sinon, mediaWiki ) );
