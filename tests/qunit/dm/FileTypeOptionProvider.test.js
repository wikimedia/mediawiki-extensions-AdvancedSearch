( function () {
	var FileTypeOptionProvider,
		sandbox,
		stubMessage = function () {
			sandbox.stub( mw, 'msg', function ( msg ) {
				return msg;
			} );
		};

	QUnit.testStart( function () {
		FileTypeOptionProvider = mw.libs.advancedSearch.dm.FileTypeOptionProvider;
		sandbox = sinon.sandbox.create();
	} );

	QUnit.testDone( function () {
		sandbox.restore();
	} );

	QUnit.module( 'ext.advancedSearch.dm.FileTypeOptionProvider' );

	QUnit.test( 'Mime types are assigned the correct groups', function ( assert ) {
		stubMessage();
		var mimeTypes = {
				jpg: 'image/jpg',
				wav: 'audio/wav',
				mp4: 'video/mp4'
			},
			expectedOptions = [
				{ optgroup: 'advancedsearch-filetype-section-image' },
				{ data: 'image/jpg', label: 'jpg' },
				{ optgroup: 'advancedsearch-filetype-section-audio' },
				{ data: 'audio/wav', label: 'wav' },
				{ optgroup: 'advancedsearch-filetype-section-video' },
				{ data: 'video/mp4', label: 'mp4' }
			];
		var model = new FileTypeOptionProvider( mimeTypes );
		assert.deepEqual( model.getAllowedFileTypeOptions(), expectedOptions );
	} );

	QUnit.test( 'Known document formats are assigned to the document group', function ( assert ) {
		stubMessage();
		var mimeTypes = {
				ods: 'application/whatever'
			},
			expectedOptions = [
				{ optgroup: 'advancedsearch-filetype-section-document' },
				{ data: 'application/whatever', label: 'ods' }
			];
		var model = new FileTypeOptionProvider( mimeTypes );
		assert.deepEqual( model.getAllowedFileTypeOptions(), expectedOptions );
	} );

	QUnit.test( 'Unassignable mime types are assigned to the group "other"', function ( assert ) {
		stubMessage();
		var mimeTypes = {
				qqq: 'application/whatever'
			},
			expectedOptions = [
				{ optgroup: 'advancedsearch-filetype-section-other' },
				{ data: 'application/whatever', label: 'qqq' }
			];
		var model = new FileTypeOptionProvider( mimeTypes );
		assert.deepEqual( model.getAllowedFileTypeOptions(), expectedOptions );
	} );

}() );
