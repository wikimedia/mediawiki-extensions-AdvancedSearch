<?php

namespace AdvancedSearch;

/**
 * Generate HTML tooltips from messages
 *
 * This is a workaround for the deficiencies of mw.message( 'keyname' ).parse() which does not
 * support HTML except italic and bold and does not convert wiki text.
 *
 * See https://phabricator.wikimedia.org/T27349
 *
 * @package AdvancedSearch
 */
class TooltipGenerator {

	public static function generateToolTips() {
		$messageKeys = [
			'advancedsearch-help-plain',
			'advancedsearch-help-phrase',
			'advancedsearch-help-or',
			'advancedsearch-help-not',
			'advancedsearch-help-hastemplate',
			'advancedsearch-help-intitle',
			'advancedsearch-help-filetype',
			'advancedsearch-help-filew',
			'advancedsearch-help-fileh'
		];

		return array_combine(
			$messageKeys,
			array_map( function ( $messageKey ) {
				return \wfMessage( $messageKey )->parse();
			}, $messageKeys )
		);
	}

}
