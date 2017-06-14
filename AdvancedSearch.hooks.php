<?php

namespace AdvancedSearch;

use BetaFeatures;
use MediaWiki\MediaWikiServices;
use SpecialPage;
use User;

class Hooks {

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialPageBeforeExecute
	 *
	 * @param SpecialPage $special
	 * @param string $subpage
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		/**
		 * If the BetaFeatures extension is loaded then require the current user to have the feature enabled.
		 */
		if (
			class_exists( BetaFeatures::class ) &&
			!BetaFeatures::isFeatureEnabled( $special->getUser(), 'advancedsearch' )
		) {
			return true;
		}
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

	/**
	 * @param User $user
	 * @param array[] &$prefs
	 */
	public static function getBetaFeaturePreferences( User $user, array &$prefs ) {
		$config = MediaWikiServices::getInstance()->getMainConfig();
		$extensionAssetsPath = $config->get( 'ExtensionAssetsPath' );

		$prefs['advancedsearch'] = [
			'label-message' => 'advancedSearch-beta-feature-message',
			'desc-message' => 'advancedSearch-beta-feature-description',
			'screenshot' => [
				'ltr' => "$extensionAssetsPath/AdvancedSearch/resources/AdvancedSearch-beta-features-ltr.svg",
				'rtl' => "$extensionAssetsPath/AdvancedSearch/resources/AdvancedSearch-beta-features-rtl.svg",
			],
			'info-link'
			=> 'https://www.mediawiki.org/wiki/Extension:AdvancedSearch',
			'discussion-link'
			=> 'https://www.mediawiki.org/wiki/Extension_talk:AdvancedSearch',
		];
	}
}
