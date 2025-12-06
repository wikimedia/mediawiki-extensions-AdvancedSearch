<?php

namespace AdvancedSearch;

use Wikimedia\Mime\MimeAnalyzer;

/**
 * @license GPL-2.0-or-later
 */
class MimeTypeConfigurator {

	public function __construct( private readonly MimeAnalyzer $mimeAnalyzer ) {
	}

	/**
	 * @param string[] $fileExtensions
	 *
	 * @return string[] List of file extension => MIME type.
	 */
	public function getMimeTypes( array $fileExtensions ): array {
		$mimeTypes = [];

		foreach ( $fileExtensions as $ext ) {
			$mimeType = $this->mimeAnalyzer->getMimeTypeFromExtensionOrNull( $ext );
			if ( $mimeType ) {
				$mimeTypes += [ $mimeType => $ext ];
			}
		}

		return array_flip( $mimeTypes );
	}

}
