<?php

namespace AdvancedSearch;

use MediaWiki\Language\ILanguageConverter;

/**
 * @license GPL-2.0-or-later
 */
class SearchableNamespaceListBuilder {

	/**
	 * @param ILanguageConverter $languageConverter
	 * @param callable|null $pagesInNs A function like {@see SiteStats::pagesInNs} that returns true
	 *  or an int > 0 when there are pages in the namespace, i.e. it's not empty
	 */
	public function __construct(
		private readonly ILanguageConverter $languageConverter,
		private $pagesInNs,
	) {
	}

	/**
	 * Get a curated list of namespaces. Adds Main namespace and removes unnamed namespaces
	 * @param array<int,string> $configNamespaces Mapping namespace ids to localized names
	 * @return array<int,string>
	 */
	public function getCuratedNamespaces( array $configNamespaces ): array {
		foreach ( $configNamespaces as $id => &$name ) {
			$name = $this->languageConverter->convertNamespace( $id );
		}

		// Make sure the main namespace is listed with a non-empty name
		if ( isset( $configNamespaces[NS_MAIN] ) && !$configNamespaces[NS_MAIN] ) {
			$configNamespaces[NS_MAIN] = wfMessage( 'blanknamespace' )->text();
		}

		// Remove entries that still have an empty name
		$configNamespaces = array_filter( $configNamespaces );

		if ( $this->pagesInNs ) {
			foreach ( $configNamespaces as $ns => $_ ) {
				if ( !( $this->pagesInNs )( $ns ) ) {
					unset( $configNamespaces[$ns] );
				}
			}
		}

		ksort( $configNamespaces );
		return $configNamespaces;
	}

}
