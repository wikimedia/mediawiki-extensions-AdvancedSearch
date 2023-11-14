<?php

namespace AdvancedSearch;

use MediaWiki\ResourceLoader\FileModule;

class ElementsModule extends FileModule {

	private function getActivePresets(): array {
		// Not worth caching, we know the number of presets is very small
		return array_filter(
			$this->config->get( 'AdvancedSearchNamespacePresets' ),
			static fn ( array $preset ) => $preset['enabled'] ?? false
		);
	}

	/** @inheritDoc */
	public function getMessages() {
		// The following messages are used here:
		// * advancedsearch-namespaces-preset-all
		// * advancedsearch-namespaces-preset-default
		// * advancedsearch-namespaces-preset-general-help
		// * advancedsearch-namespaces-preset-discussion
		// and all dynamic keys from $wgAdvancedSearchNamespacePresets
		return array_unique( array_merge(
			parent::getMessages(),
			array_column( $this->getActivePresets(), 'label' )
		) );
	}
}
