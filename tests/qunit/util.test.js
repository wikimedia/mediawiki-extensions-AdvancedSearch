( function () {
	const { arrayConcatUnique, arrayContains, arrayEquals } = require( 'ext.advancedSearch.elements' );

	QUnit.module( 'mw.libs.advancedSearch.util' );

	QUnit.test( 'First array contains all the values from the second', function ( assert ) {
		assert.true( arrayContains( [ '1', '2', '3', '4' ], [ '3', '2' ] ), 'first array contains all from second array' );
		assert.false( arrayContains( [ '1', '2' ], [ '1', '2', '3' ] ), 'second array contains all from first but not the other way around' );
		assert.false( arrayContains( [ '4', '5' ], [ '1', '2', '3' ] ), 'arrays contain completely different values' );
		assert.false( arrayContains( [ '1', '2', '3', '4' ], [ 3, '2' ] ), 'arrays contain same values but of different type' );
	} );

	QUnit.test( 'Can handle empty array as first input', function ( assert ) {
		assert.false( arrayContains( [ ], [ '1', '2', '3' ] ) );
	} );

	QUnit.test( 'Can handle empty array as second input', function ( assert ) {
		assert.true( arrayContains( [ '1', '2' ], [ ] ) );
	} );

	QUnit.test( 'Merges two arrays using only the unique values', function ( assert ) {
		assert.deepEqual( arrayConcatUnique( [ '1', '3', '5', '6' ], [ '1', '2', '3' ] ), [ '1', '3', '5', '6', '2' ] );
	} );

	QUnit.test( 'Returns the array which length is > 0 when one of the input arrays is empty', function ( assert ) {
		assert.deepEqual( arrayConcatUnique( [ ], [ '1', '2', '3' ] ), [ '1', '2', '3' ] );
		assert.deepEqual( arrayConcatUnique( [ '1', '2', '3' ], [ ] ), [ '1', '2', '3' ] );
	} );

	QUnit.test( 'Verifies two arrays are identical', function ( assert ) {
		assert.true( arrayEquals( [ '1', '3', 'bla' ], [ '1', '3', 'bla' ] ) );
	} );

	QUnit.test( 'Two arrays are not identical when one is longer than the other', function ( assert ) {
		assert.false( arrayEquals( [ '1', '3', 'bla', '' ], [ '1', '3', 'bla' ] ) );
	} );

	QUnit.test( 'Two arrays are not identical when they hold the same values but in different order', function ( assert ) {
		assert.false( arrayEquals( [ '1', '3', 'bla' ], [ '3', '1', 'bla' ] ) );
	} );
}() );
