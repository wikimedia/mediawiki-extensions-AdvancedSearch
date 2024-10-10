'use strict';
( function () {
	const { SearchField, createSearchFieldFromObject } = require( 'ext.advancedSearch.elements' );

	QUnit.module( 'mw.libs.advancedSearch.createSearchFieldFromObject' );

	QUnit.test( 'It creates a subclassed instance', ( assert ) => {
		const field = createSearchFieldFromObject( {
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

	QUnit.test( 'Given missing method overrides for abstract methods, calling them throws an exeption', ( assert ) => {
		const field = createSearchFieldFromObject( { id: 'test' } );
		assert.throws( () => {
			field.init();
		} );
		assert.throws( () => {
			field.layout();
		} );
		assert.throws( () => {
			field.formatter();
		} );
	} );

	// TODO given missing init, it throws an exception
	// TODO given missing layout, it throws an exception
	// TODO given missing id, it throws an exception
	// TODO given missing group, it throws an exception
	// TODO given group in list of excluded groups, it throws an exception
}() );
