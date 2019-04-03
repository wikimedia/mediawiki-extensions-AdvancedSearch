( function () {
	'use strict';

	var FieldCollection = mw.libs.advancedSearch.FieldCollection;

	QUnit.module( 'mw.libs.advancedSearch.FieldCollection' );

	QUnit.test( 'Field ids must be unique', function ( assert ) {
		var coll = new FieldCollection(),
			stubField = { id: 'foo' };
		coll.add( stubField, 'test' );
		assert.throws( function () {
			coll.add( stubField, 'test' );
		} );
	} );

	QUnit.test( 'Can lookup group name for id', function ( assert ) {
		var coll = new FieldCollection();
		coll.add( { id: 'foo' }, 'firstGroup' );
		coll.add( { id: 'bar' }, 'firstGroup' );
		coll.add( { id: 'baz' }, 'secondGroup' );
		assert.strictEqual( coll.getGroup( 'foo' ), 'firstGroup' );
		assert.strictEqual( coll.getGroup( 'bar' ), 'firstGroup' );
		assert.strictEqual( coll.getGroup( 'baz' ), 'secondGroup' );
	} );

	QUnit.test( 'Adding fields to frozen group throws error', function ( assert ) {
		var coll = new FieldCollection(),
			stubField = { id: 'foo' };
		coll.freezeGroups( [ 'test' ] );
		assert.throws( function () {
			coll.add( stubField, 'test' );
		} );
	} );

}() );
