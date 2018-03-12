( function ( mw ) {
	'use strict';

	var QueryCompiler = mw.libs.advancedSearch.QueryCompiler,
		stringFormatter = function ( v ) { return String( v ); },
		defaultOptions = [
			{
				id: 'plain',
				formatter: stringFormatter
			},
			{
				id: 'keyword',
				formatter: function ( v ) { return 'keyword:' + v; }
			},
			{
				id: 'greedy',
				formatter: stringFormatter,
				greedy: true
			}
		];

	QUnit.module( 'mw.libs.advancedSearch.QueryCompiler' );

	function getDefaultState() {
		var state = { getOption: sinon.stub() };

		state.getOption.withArgs( 'plain' ).returns( 'one' );
		state.getOption.withArgs( 'keyword' ).returns( 'two' );
		state.getOption.withArgs( 'greedy' ).returns( 'three' );
		return state;
	}

	QUnit.test( 'empty values will return empty search string', function ( assert ) {
		assert.expect( 1 );

		var compiler = new QueryCompiler( defaultOptions ),
			state = { getOption: sinon.stub().returns( '' ) };

		assert.equal( compiler.compileSearchQuery( state ), '' );
	} );

	QUnit.test( 'filled values will return formatted search string', function ( assert ) {
		assert.expect( 1 );

		var compiler = new QueryCompiler( defaultOptions ),
			state = getDefaultState();
		assert.equal( compiler.compileSearchQuery( state ), 'one keyword:two three' );
	} );

	QUnit.test( 'Regardless of option order, greedy option always comes last', function ( assert ) {
		assert.expect( 1 );

		var reorderedOptions = [ defaultOptions[ 2 ], defaultOptions[ 1 ], defaultOptions[ 0 ] ],
			compiler = new QueryCompiler( reorderedOptions ),
			state = getDefaultState();

		assert.equal( compiler.compileSearchQuery( state ), 'keyword:two one three' );
	} );

	QUnit.test( 'Given search string with no advanced search contents, it is untouched', function ( assert ) {
		assert.expect( 1 );

		var compiler = new QueryCompiler( defaultOptions ),
			state = getDefaultState(),
			currentQuery = 'awesome goats';

		assert.equal( compiler.removeCompiledQueryFromSearch( currentQuery, state ), currentQuery );
	} );

	QUnit.test( 'Given search string with partial advanced search contents, it is untouched', function ( assert ) {
		assert.expect( 1 );

		var compiler = new QueryCompiler( defaultOptions ),
			state = getDefaultState(),
			currentQuery = 'awesome goats keyword:two three';

		assert.equal( compiler.removeCompiledQueryFromSearch( currentQuery, state ), currentQuery );
	} );

	QUnit.test( 'Given search string ending with advanced search contents, they are removed', function ( assert ) {
		assert.expect( 1 );

		var compiler = new QueryCompiler( defaultOptions ),
			state = getDefaultState(),
			currentQuery = 'awesome goats one keyword:two three';

		assert.equal( compiler.removeCompiledQueryFromSearch( currentQuery, state ), 'awesome goats' );
	} );

}( mediaWiki ) );
