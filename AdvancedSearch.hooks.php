<?php

namespace AdvancedSearch;

use SpecialPage;

class Hooks {

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialPageBeforeExecute
	 *
	 * @param SpecialPage $special
	 * @param string $subpage
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		if ( $special->getName() === 'Search' ) {
			$special->getOutput()->addModules( 'ext.advancedSearch.init' );
		}
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialSearchPowerBox
	 *
	 * @param string[] &$showSections
	 * @param string $term
	 * @param string[] $opts
	 */
	public static function onSpecialSearchPowerBox( &$showSections, $term, $opts ) {
		// $showSections = [];
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialSearchProfiles
	 *
	 * @param array[] &$profiles
	 */
	public static function onSpecialSearchProfiles( array &$profiles ) {
		$profiles = [];
	}

}
