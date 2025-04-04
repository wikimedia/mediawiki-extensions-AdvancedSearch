QUnit.module( 'ext.advancedSearch.dm.FileTypeOptionProvider', () => {
	const { FileTypeOptionProvider } = require( 'ext.advancedSearch.SearchFieldUI' );

	QUnit.test( 'Mime types are assigned the correct groups', ( assert ) => {
		const mimeTypes = {
				jpg: 'image/jpg',
				wav: 'audio/wav',
				mp4: 'video/mp4'
			},
			expectedOptions = [
				{ optgroup: '(advancedsearch-filetype-section-image)' },
				{ data: 'image/jpg', label: 'jpg' },
				{ optgroup: '(advancedsearch-filetype-section-audio)' },
				{ data: 'audio/wav', label: 'wav' },
				{ optgroup: '(advancedsearch-filetype-section-video)' },
				{ data: 'video/mp4', label: 'mp4' }
			];
		const model = new FileTypeOptionProvider( mimeTypes );
		assert.deepEqual( model.getAllowedFileTypeOptions(), expectedOptions );
	} );

	QUnit.test( 'Known document formats are assigned to the document group', ( assert ) => {
		const mimeTypes = {
				ods: 'application/whatever'
			},
			expectedOptions = [
				{ optgroup: '(advancedsearch-filetype-section-document)' },
				{ data: 'application/whatever', label: 'ods' }
			];
		const model = new FileTypeOptionProvider( mimeTypes );
		assert.deepEqual( model.getAllowedFileTypeOptions(), expectedOptions );
	} );

	QUnit.test( 'Unassignable mime types are assigned to the group "other"', ( assert ) => {
		const mimeTypes = {
				qqq: 'application/whatever'
			},
			expectedOptions = [
				{ optgroup: '(advancedsearch-filetype-section-other)' },
				{ data: 'application/whatever', label: 'qqq' }
			];
		const model = new FileTypeOptionProvider( mimeTypes );
		assert.deepEqual( model.getAllowedFileTypeOptions(), expectedOptions );
	} );
} );
