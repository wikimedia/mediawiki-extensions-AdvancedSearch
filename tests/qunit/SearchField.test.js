( function () {
	'use strict';

	const SearchField = mw.libs.advancedSearch.SearchField,
		createField = mw.libs.advancedSearch.createSearchFieldFromObject;

	QUnit.module( 'mw.libs.advancedSearch.createSearchFieldFromObject' );

	QUnit.test( 'It creates a subclassed instance', function ( assert ) {
		const field = createField( {
			id: 'test',
			// overriding the abstract methods with dummy functions, in production code init and layout must return factory functions instead of values.
			init: function () {
				return 'foo';
			},
			layout: function () {
				return 'bar';
			},
			formatter: function () {
				return 'baz';
			}
		} );
		assert.true( field instanceof SearchField );
		assert.strictEqual( field.id, 'test' );
		assert.strictEqual( field.init(), 'foo' );
		assert.strictEqual( field.layout(), 'bar' );
		assert.strictEqual( field.formatter(), 'baz' );
	} );

	QUnit.test( 'Given missing method overrides for abstract methods, calling them throws an exeption', function ( assert ) {
		const field = createField( { id: 'test' } );
		assert.throws( function () {
			field.init();
		} );
		assert.throws( function () {
			field.layout();
		} );
		assert.throws( function () {
			field.formatter();
		} );
	} );

	// TODO given missing init, it throws an exception
	// TODO given missing layout, it throws an exception
	// TODO given missing id, it throws an exception
	// TODO given missing group, it throws an exception
	// TODO given group in list of excluded groups, it throws an exception

}() );
