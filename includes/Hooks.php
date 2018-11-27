<?php

namespace AdvancedSearch;

use BetaFeatures;
use ExtensionRegistry;
use MediaWiki\MediaWikiServices;
use ResourceLoader;
use SpecialPage;
use User;
use Language;

/**
 * @license GPL-2.0-or-later
 */
class Hooks {

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialPageBeforeExecute
	 *
	 * @param SpecialPage $special
	 * @param string $subpage
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		$mainConfig = MediaWikiServices::getInstance()->getMainConfig();
		$searchConfig = MediaWikiServices::getInstance()->getSearchEngineConfig();

		/**
		 * If the BetaFeatures extension is loaded then require the current user
		 * to have the feature enabled.
		 */
		if (
			$mainConfig->get( 'AdvancedSearchBetaFeature' ) &&
			ExtensionRegistry::getInstance()->isLoaded( 'BetaFeatures' ) &&
			!BetaFeatures::isFeatureEnabled( $special->getUser(), 'advancedsearch' )
		) {
			return;
		}
		/**
		 * If the user is logged in and has explicitly requested to disable the extension don't load.
		 */
		if (
			!$special->getUser()->isAnon() &&
			$special->getUser()->getBoolOption( 'advancedsearch-disable' )
		) {
			return;
		}
		if ( $special->getName() === 'Search' ) {
			$special->getOutput()->addModules( [
				'ext.advancedSearch.init',
				'ext.advancedSearch.searchtoken',
			] );
			$special->getOutput()->addModuleStyles( 'ext.advancedSearch.initialstyles' );

			$special->getOutput()->addJsConfigVars(
				'advancedSearch.mimeTypes',
				( new MimeTypeConfigurator( MediaWikiServices::getInstance()->getMimeAnalyzer() ) )
					->getMimeTypes( $special->getConfig()->get( 'FileExtensions' ) )
			);

			$special->getOutput()->addJsConfigVars( [
				'advancedSearch.tooltips' => TooltipGenerator::generateToolTips(),
				'advancedSearch.namespacePresets' => $mainConfig->get( 'AdvancedSearchNamespacePresets' ),
				'advancedSearch.deepcategoryEnabled' => $mainConfig->get( 'AdvancedSearchDeepcatEnabled' ),
				'advancedSearch.searchableNamespaces' =>
					SearchableNamespaceListBuilder::getCuratedNamespaces(
						$searchConfig->searchableNamespaces()
				)
			] );

			/**
			 * checks if extension Translate is installed and enabled
			 * https://github.com/wikimedia/mediawiki-extensions-Translate/blob/master/Translate.php#L351
			 * this check is not performed with ExtensionRegistry
			 * because Translate extension does not have extension.json
			 */
			if ( $mainConfig->has( 'EnablePageTranslation' ) &&
				$mainConfig->get( 'EnablePageTranslation' ) === true ) {
				$special->getOutput()->addJsConfigVars(
					'advancedSearch.languages', Language::fetchLanguageNames()
				);
			}
		}
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/onSpecialSearchResultsPrepend
	 *
	 * @param \SpecialSearch $specialSearch
	 * @param \OutputPage $output
	 * @param string $term
	 */
	public static function onSpecialSearchResultsPrepend( \SpecialSearch $specialSearch,
														  \OutputPage $output, $term ) {
		$output->addHTML(
			\Html::rawElement(
				'div',
				[ 'class' => 'mw-search-spinner' ],
				\Html::element( 'div', [ 'class' => 'mw-search-spinner-bounce' ] )
			)
		);
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetBetaFeaturePreferences
	 *
	 * @param User $user
	 * @param array[] &$prefs
	 */
	public static function onGetBetaFeaturePreferences( User $user, array &$prefs ) {
		$config = MediaWikiServices::getInstance()->getMainConfig();

		/**
		 * If the BetaFeatures extension is loaded then require the current user
		 * to have the feature enabled.
		 */
		if ( !$config->get( 'AdvancedSearchBetaFeature' ) ) {
			return;
		}

		$extensionAssetsPath = $config->get( 'ExtensionAssetsPath' );

		$prefs['advancedsearch'] = [
			'label-message' => 'advancedsearch-beta-feature-message',
			'desc-message' => 'advancedsearch-beta-feature-description',
			'screenshot' => [
				'ltr' => "$extensionAssetsPath/AdvancedSearch/resources/AdvancedSearch-beta-features-ltr.svg",
				'rtl' => "$extensionAssetsPath/AdvancedSearch/resources/AdvancedSearch-beta-features-rtl.svg",
			],
			'info-link' => 'https://www.mediawiki.org/wiki/Help:Extension:AdvancedSearch',
			'discussion-link' => 'https://www.mediawiki.org/wiki/Help_talk:Extension:AdvancedSearch',
			'requirements' => [
				'javascript' => true,
			],
		];
	}

	/**
	 * @param User $user
	 * @param array[] &$preferences
	 */
	public static function onGetPreferences( User $user, array &$preferences ) {
		$preferences['advancedsearch-disable'] = [
			'type' => 'toggle',
			'label-message' => 'advancedsearch-preference-disable',
			'section' => 'searchoptions/advancedsearch',
			'default' => $user->getBoolOption( 'advancedsearch-disable' ),
			'help-message' => 'advancedsearch-preference-help',
		];
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderTestModules
	 *
	 * @param array[] &$testModules
	 * @param ResourceLoader $rl
	 */
	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader $rl ) {
		$testModules['qunit']['ext.advancedSearch.tests'] = [
			'scripts' => [
				'tests/qunit/QueryCompiler.test.js',
				'tests/qunit/ui/ArbitraryWordInput.test.js',
				'tests/qunit/ui/CheckboxInputWidget.test.js',
				'tests/qunit/ui/ItemMenuOptionWidget.test.js',
				'tests/qunit/ui/FileTypeSelection.test.js',
				'tests/qunit/ui/MenuSelectWidget.test.js',
				'tests/qunit/ui/LanguageSelection.test.js',
				'tests/qunit/ui/NamespaceFilters.test.js',
				'tests/qunit/ui/NamespacePresets.test.js',
				'tests/qunit/ui/SearchPreview.test.js',
				'tests/qunit/dm/getDefaultNamespaces.test.js',
				'tests/qunit/dm/NamespacePresetProviders.test.js',
				'tests/qunit/dm/SearchModel.test.js',
				'tests/qunit/dm/FileTypeOptionProvider.test.js',
				'tests/qunit/dm/TitleCache.test.js',
				'tests/qunit/dm/LanguageOptionProvider.test.js',
				'tests/qunit/dm/MultiselectLookup.test.js',
				'tests/qunit/dm/trackingEvents/SearchRequest.test.js',
				'tests/qunit/util.test.js'
			],
			'dependencies' => [
				'ext.advancedSearch.elements',
				'ext.advancedSearch.AdvancedOptionsConfig',
				'oojs-ui'
			],
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'AdvancedSearch',
		];
	}

}
