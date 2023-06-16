'use strict';

const arrayEquals = function ( a1, a2 ) {
	let i = a1.length;
	if ( i !== a2.length ) {
		return false;
	}
	while ( i-- ) {
		if ( a1[ i ] !== a2[ i ] ) {
			return false;
		}
	}
	return true;
};

const arrayContains = function ( a1, a2 ) {
	return $( a1 ).filter( a2 ).length === a2.length;
};

const arrayConcatUnique = function ( a1, a2 ) {
	return a1.concat( a2.filter( function ( item ) {
		return a1.indexOf( item ) === -1;
	} ) );
};

module.exports = {
	arrayConcatUnique,
	arrayContains,
	arrayEquals
};
