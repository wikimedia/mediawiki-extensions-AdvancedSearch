This file provides documentation for AdvancedSearch configuration variables.

It should be updated each time a new configuration parameter is added or changed.

## Configuration

### Namespace presets `$wgAdvancedSearchNamespacePresets`

AdvancedSearch supports namespace presets, groups of namespaces that are offered for batch selection via dedicated checkboxes. [By default](https://phabricator.wikimedia.org//r/p/mediawiki/extensions/AdvancedSearch;browse/master/extension.json$23) three presets are offered - _discussion_, _generalHelp_, and _all_.

Which namespaces are contained in a preset can be configured
* statically, through the `namespaces` key containing an array of namespace ids,
* or programmatically through the `provider` key containing a reference to a JavaScript function returning the aforementioned namespace id array. The available provider functions are implemented in [NamespacePresetProviders](https://phabricator.wikimedia.org//r/p/mediawiki/extensions/AdvancedSearch;browse/master/modules/dm/ext.advancedSearch.NamespacePresetProviders.js).

You can use `$wgAdvancedSearchNamespacePresets` to modify the default configuration or add your own presets.

#### Add a namespace preset
```
// in your LocalSettings.php
wfLoadExtension( 'AdvancedSearch' );
$wgAdvancedSearchNamespacePresets = [
	'my-custom-preset' => [
		'enabled' => true, // indication that this preset should be shown to the user
		'namespaces' => [ '1', '11' ], // list of namespaces to include in this preset
		'label' => 'my-custom-preset-label-id' // id of the translation to use to label the preset checkbox
	],
];
```

#### Disable a default namespace preset
```
// in your LocalSettings.php
wfLoadExtension( 'AdvancedSearch' );
$wgAdvancedSearchNamespacePresets = [
	'generalHelp' => [
		'enabled' => false,
	],
];
```
