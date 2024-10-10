( function () {
	'use strict';

	const { QueryCompiler } = require( 'ext.advancedSearch.elements' );

	const stringFormatter = ( v ) => String( v );
	const defaultFields = [
		{
			id: 'plain',
			formatter: stringFormatter
		},
		{
			id: 'keyword',
			formatter: function ( v ) {
				return 'keyword:' + v;
			}
		}
	];

	QUnit.module( 'mw.libs.advancedSearch.QueryCompiler' );

	const getDefaultState = function () {
		const state = { getField: sinon.stub() };

		state.getField.withArgs( 'plain' ).returns( 'one' );
		state.getField.withArgs( 'keyword' ).returns( 'two' );
		return state;
	};

	QUnit.test( 'empty values will return empty search string', ( assert ) => {
		const compiler = new QueryCompiler( defaultFields ),
			state = { getField: sinon.stub().returns( '' ) };

		assert.strictEqual( compiler.compileSearchQuery( state ), '' );
	} );

	QUnit.test( 'filled values will return formatted search string', ( assert ) => {
		const compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState();
		assert.strictEqual( compiler.compileSearchQuery( state ), 'one keyword:two' );
	} );

	QUnit.test( 'Given search string with no advanced search contents, it is untouched', ( assert ) => {
		const compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState(),
			currentQuery = 'awesome goats';

		assert.strictEqual( compiler.removeCompiledQueryFromSearch( currentQuery, state ), currentQuery );
	} );

	QUnit.test( 'Given search string with partial advanced search contents, it is untouched', ( assert ) => {
		const compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState(),
			currentQuery = 'awesome goats keyword:two';

		assert.strictEqual( compiler.removeCompiledQueryFromSearch( currentQuery, state ), currentQuery );
	} );

	QUnit.test( 'Given search string ending with advanced search contents, they are removed', ( assert ) => {
		const compiler = new QueryCompiler( defaultFields ),
			state = getDefaultState(),
			currentQuery = 'awesome goats one keyword:two';

		assert.strictEqual( compiler.removeCompiledQueryFromSearch( currentQuery, state ), 'awesome goats' );
	} );
}() );
