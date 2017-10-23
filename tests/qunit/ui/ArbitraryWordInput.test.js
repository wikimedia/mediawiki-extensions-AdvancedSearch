( function ( mw ) {
	var ArbitraryWordInput = mw.libs.advancedSearch.ui.ArbitraryWordInput,
		Model = mw.libs.advancedSearch.dm.SearchModel;

	QUnit.module( 'ext.advancedSearch.ui.ArbitraryWordInput' );

	QUnit.test( 'Placeholder text presented if no content', function ( assert ) {
		assert.expect( 1 );

		var input = new ArbitraryWordInput( new Model(), { placeholder: 'lorem ipsum' } );

		assert.equal( input.getTextForPlaceholder(), 'lorem ipsum' );
	} );

	QUnit.test( 'Placeholder text empty if content gets set', function ( assert ) {
		assert.expect( 1 );

		var input = new ArbitraryWordInput( new Model(), { placeholder: 'lorem ipsum' } );
		input.setValue( [ 'asinus' ] );

		assert.equal( input.getTextForPlaceholder(), '' );
	} );

	QUnit.test( 'Placeholder text empty if content set from the start', function ( assert ) {
		assert.expect( 1 );

		var model = new Model();
		model.storeOption( 'somekey', [ 'gaudiamus' ] );
		var input = new ArbitraryWordInput( model, { placeholder: 'lorem ipsum', optionId: 'somekey' } );

		assert.equal( input.getTextForPlaceholder(), '' );
	} );

}( mediaWiki ) );
