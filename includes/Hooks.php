<?php

namespace AdvancedSearch;

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
		$services = MediaWikiServices::getInstance();
		$mainConfig = $special->getConfig();
		$searchConfig = $services->getSearchEngineConfig();

		if ( $special->getName() !== 'Search' ) {
			return;
		}

		/**
		 * If the user is logged in and has explicitly requested to disable the extension, don't load.
		 * Ensure namespaces are always part of search URLs
		 */
		if ( !$special->getUser()->isAnon() &&
			$special->getUser()->getBoolOption( 'advancedsearch-disable' ) ) {
			return;
		}

		/**
		 * Ensure the current URL is specifying the namespaces which are to be used
		 */
		self::redirectToNamespacedRequest( $special );
		if ( $special->getOutput()->getRedirect() ) {
			return;
		}

		$special->getOutput()->addModules( [
			'ext.advancedSearch.init',
			'ext.advancedSearch.searchtoken',
		] );

		$special->getOutput()->addModuleStyles( 'ext.advancedSearch.initialstyles' );

		$special->getOutput()->addJsConfigVars(
			'advancedSearch.mimeTypes',
			( new MimeTypeConfigurator( $services->getMimeAnalyzer() ) )
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

	/**
	 * If the request does not contain any namespaces, redirect to URL with user default namespaces
	 * Returns false if user has no namespaces defined
	 */
	private static function redirectToNamespacedRequest( \SpecialPage $special ) {
		if ( !self::isNamespacedRequest( $special ) ) {
			$namespacedSearchUrl = $special->getRequest()->getFullRequestURL();
			foreach ( self::getDefaultNamespaces( $special->getUser() ) as $namespace ) {
				$namespacedSearchUrl .= '&ns' . $namespace . '=1';
			}
			$special->getOutput()->redirect( $namespacedSearchUrl );
		}
	}

	/**
	 * Retrieves the default namespaces for the current user
	 */
	private static function getDefaultNamespaces( User $user ): array {
		$namespaces = [];
		if ( !$user->isAnon() ) {
			foreach ( $user->mOptions as $option => $optionValue ) {
				if ( preg_match( '/^searchNs(\d+)$/', $option, $matchedNamespace ) ) {
					$namespaces [] = $matchedNamespace[1];
				}
			}
		}

		if ( empty( $namespaces ) ) {
			$config = MediaWikiServices::getInstance()->getMainConfig();
			$namespaces = array_keys( $config->get( 'NamespacesToBeSearchedDefault' ) );
		}

		return $namespaces;
	}

	/**
	 * Checks if search request specifies any namespaces
	 * @param SpecialPage $special
	 * @return bool
	 */
	private static function isNamespacedRequest( \SpecialPage $special ) {
		foreach ( array_keys( $special->getRequest()->getValues() ) as $requestKey ) {
			if ( preg_match( '/^ns\d+$/', $requestKey ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/onSpecialSearchResultsPrepend
	 *
	 * @param \SpecialSearch $specialSearch
	 * @param \OutputPage $output
	 * @param string $term
	 */
	public static function onSpecialSearchResultsPrepend(
		\SpecialSearch $specialSearch,
		\OutputPage $output,
		$term ) {
		$output->addHTML(
			\Html::rawElement(
				'div',
				[ 'class' => 'mw-search-spinner' ],
				\Html::element( 'div', [ 'class' => 'mw-search-spinner-bounce' ] )
			)
		);
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
	 * @codeCoverageIgnore
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
