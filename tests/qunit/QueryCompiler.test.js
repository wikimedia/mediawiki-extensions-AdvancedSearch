( function () {
	'use strict';

	var QueryCompiler = mw.libs.advancedSearch.QueryCompiler,
		stringFormatter = function ( v ) { return String( v ); },
		defaultFields = [
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
		var state = { getField: sinon.stub() };

		state.getField.withArgs( 'plain' ).returns( 'one' );
		state.getField.withArgs( 'keyword' ).returns( 'two' );
		state.getField.withArgs( 'greedy' ).returns( 'three' );
		return state;
	}

	QUnit.test( 'empty values will return empty search string', function ( assert ) {
		var compiler = new QueryCompiler( defaultFields ),
			state = { getField: sinon.stub().returns( '' ) };

		assert.strictEqual( compiler.compileSearchQuery( state ), '' );
	} );

	QUnit.test( 'filled values will return formatted search string', function ( assert ) {
		var compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState();
		assert.strictEqual( compiler.compileSearchQuery( state ), 'one keyword:two three' );
	} );

	QUnit.test( 'Regardless of field order, greedy field always comes last', function ( assert ) {
		var reorderedFields = [ defaultFields[ 2 ], defaultFields[ 1 ], defaultFields[ 0 ] ],
			compiler = new QueryCompiler( reorderedFields ),
			state = getDefaultState();

		assert.strictEqual( compiler.compileSearchQuery( state ), 'keyword:two one three' );
	} );

	QUnit.test( 'Given search string with no advanced search contents, it is untouched', function ( assert ) {
		var compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState(),
			currentQuery = 'awesome goats';

		assert.strictEqual( compiler.removeCompiledQueryFromSearch( currentQuery, state ), currentQuery );
	} );

	QUnit.test( 'Given search string with partial advanced search contents, it is untouched', function ( assert ) {
		var compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState(),
			currentQuery = 'awesome goats keyword:two three';

		assert.strictEqual( compiler.removeCompiledQueryFromSearch( currentQuery, state ), currentQuery );
	} );

	QUnit.test( 'Given search string ending with advanced search contents, they are removed', function ( assert ) {
		var compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState(),
			currentQuery = 'awesome goats one keyword:two three';

		assert.strictEqual( compiler.removeCompiledQueryFromSearch( currentQuery, state ), 'awesome goats' );
	} );

}() );
