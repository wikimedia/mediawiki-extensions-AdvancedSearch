<?php

namespace AdvancedSearch;

use MimeAnalyzer;

class MimeTypeConfigurator {

	private $mimeAnalyzer;

	public function __construct( MimeAnalyzer $mimeAnalyzer ) {
		$this->mimeAnalyzer = $mimeAnalyzer;
	}

	public function getMimeTypes( $fileExtensions ) {
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
	 * @param $fileExtension
	 * @return string First mime type associated with the given file extension
	 */
	private function getFirstMimeTypeByFileExtension( $fileExtension ) {
		$mimeTypes = explode( ' ', $this->mimeAnalyzer->getTypesForExtension( $fileExtension ) );
		return $mimeTypes[0];
	}

}
