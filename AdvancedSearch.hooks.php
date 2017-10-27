<?php

namespace AdvancedSearch;

use BetaFeatures;
use MediaWiki\MediaWikiServices;
use ResourceLoader;
use SpecialPage;
use User;

class Hooks {

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialPageBeforeExecute
	 *
	 * @param SpecialPage $special
	 * @param string $subpage
	 * @return boolean
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		/**
		 * If the BetaFeatures extension is loaded then require the current user to have the feature enabled.
		 */
		if (
			class_exists( BetaFeatures::class ) &&
			!BetaFeatures::isFeatureEnabled( $special->getUser(), 'advancedsearch' )
		) {
			return;
		}
		if ( $special->getName() === 'Search' ) {
			$special->getOutput()->addModules( 'ext.advancedSearch.init' );
			$special->getOutput()->addModuleStyles( 'ext.advancedSearch.initialstyles' );

			$special->getOutput()->addJsConfigVars(
				'advancedSearch.mimeTypes',
				( new MimeTypeConfigurator( MediaWikiServices::getInstance()->getMimeAnalyzer() ) )
					->getMimeTypes( $special->getConfig()->get( 'FileExtensions' ) )
			);
			$special->getOutput()->addJsConfigVars( 'advancedSearch.tooltips', TooltipGenerator::generateToolTips() );
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
			'info-link' => 'https://www.mediawiki.org/wiki/Extension:AdvancedSearch',
			'discussion-link' => 'https://www.mediawiki.org/wiki/Extension_talk:AdvancedSearch',
		];
	}

	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader $rl ) {
		$testModules['qunit']['ext.advancedSearch.tests'] = [
			'scripts' => [
				'tests/qunit/ui/ArbitraryWordInput.test.js',
				'tests/qunit/ui/NamespaceFilters.test.js',
				'tests/qunit/ui/NamespacePresets.test.js',
				'tests/qunit/ui/SearchPreview.test.js',
				'tests/qunit/ui/TemplateSearch.test.js',
				'tests/qunit/dm/SearchModel.test.js',
				'tests/qunit/dm/FileTypeOptionProvider.test.js'
			],
			'dependencies' => [
				'ext.advancedSearch.ui.ArbitraryWordInput',
				'ext.advancedSearch.ui.NamespaceFilters',
				'ext.advancedSearch.ui.NamespacePresets',
				'ext.advancedSearch.ui.SearchPreview',
				'ext.advancedSearch.ui.TemplateSearch',
				'ext.advancedSearch.dm.SearchModel',
				'ext.advancedSearch.dm.FileTypeOptionProvider',
				'oojs-ui'
			],
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'AdvancedSearch',
		];
	}
}
