<?php

namespace AdvancedSearch;

use MimeAnalyzer;

/**
 * @license GPL-2.0-or-later
 */
class MimeTypeConfigurator {

	private $mimeAnalyzer;

	/**
	 * @param MimeAnalyzer $mimeAnalyzer
	 */
	public function __construct( MimeAnalyzer $mimeAnalyzer ) {
		$this->mimeAnalyzer = $mimeAnalyzer;
	}

	/**
	 * @param string[] $fileExtensions
	 *
	 * @return string[]
	 */
	public function getMimeTypes( array $fileExtensions ) {
		$mimeTypes = [];

		foreach ( $fileExtensions as $ext ) {
			$mimeTypeForExtension = $this->getFirstMimeTypeByFileExtension( $ext );
			if ( !in_array( $mimeTypeForExtension, $mimeTypes ) ) {
				$mimeTypes[$ext] = $mimeTypeForExtension;
			}
		}

		return array_unique( $mimeTypes );
	}

	/**
	 * Uses MimeAnalyzer to determine the mimetype of a given file extension
	 *
	 * @param string $fileExtension
	 * @return string First mime type associated with the given file extension
	 */
	private function getFirstMimeTypeByFileExtension( $fileExtension ) {
		$mimeTypes = explode( ' ', $this->mimeAnalyzer->getTypesForExtension( $fileExtension ) );
		return $mimeTypes[0];
	}

}
