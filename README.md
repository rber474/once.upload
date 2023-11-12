![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/rber474/once.upload/plone-package.yml?label=workflow)

# once.upload

> [!Warning]  
> WIP. This is intended to use as a proof of concept of how to customize already bundled patterns from @plone/mockup and plone.staticresources

Overrides for @plone/mockup Upload pattern

## Features

- Custom templates upload and preview templates.
- Allows to define allowed file type by extension and mimetype. Adds `allow` attribute to upload button.
- Custom error messages control for file and adds a global status message for uploading process.
- Both process upload bar for each file and global process.
- Allows to define multiple uploads or single upload, overriding original pattern.
- Adds a `Cancel all` button.

## TODO:

- Include TUF support.
- Override @plone/mockup `structure` pattern views to use customized upload pattern instead of original.
- Test coverage.

## Installation


> [!important]  
> No version has been yet released. You install it as development product and test it.


### Using buildout

Add `once.upload` to your instance and install it in to your plone site.

    [buildout]

    ...

    eggs =
        once.upload

### Using cookiecutter

Add to instance.yaml and requirements.txt

    load_zcml:
        package_includes

            [
                "once.upload"
            ]

## Usage

You can add the pattern by adding a `.pat-upload` CSS class to your HTML element.

You can configure Dropzone using the attribute `data-pat-upload`.

Action URL will be automatically obtain from parent `form` if exists. If not, a `url` param must be provided

### Example

The following example, register a browser that will render the upload zone and also process the uploads.
The view also provides a method with the custom settings for the upload pattern:

#### **`configure.zcml`**
```xml
  <browser:page
    name="test-pat-upload"
    for="*"
    class=".test_pat_upload.TestPatUpload"
    template="test_pat_upload.pt"
    permission="zope2.View"
    layer="once.upload.interfaces.IOnceUploadLayer"
    />

  <browser:page
    name="custom-upload"
    for="*"
    class=".test_pat_upload.TestPatUpload"
    permission="zope2.View"
    layer="once.upload.interfaces.IOnceUploadLayer"
    attribute="upload"
    />

```

#### **`test_pat_upload.py`**
```python
# -*- coding: utf-8 -*-

# from once.upload import _
from Products.Five.browser import BrowserView
from zope.interface import implementer
from zope.interface import Interface

import json
import logging


logger = logging.getLogger(__name__)


class ITestPatUpload(Interface):
    """Marker Interface for ITestPatUpload"""


@implementer(ITestPatUpload)
class TestPatUpload(BrowserView):

    def __call__(self):
        # Implement your own actions:
        return self.index()

    def upload(self):
        """Will process file uploads"""
        logger.info("processing file")
        response = self.request.response
        response.setHeader("Content-type", "application/json")
        # Your file processing here

        # Test successful upload
        response.setStatus(200)
        return json.dumps({"message": "Prueba de mensaje", "error": ""})

    def json_settings(self):
        """Configure dropzone"""

        
        # Limi
        settings = {
            "url": "custom-upload",
            "acceptedFiles": ".pdf, .docx, .jpeg, .jpg", # Limit allowed file types
            "maxFiles": 5, # Only allow 5 files per upload
            "maxFilesize": 12, # Set max file size to 12 MiB.
            "createImageThumbnails": False, # Don't create thumbnails
            "autoProcessQueue": False, # Manual upload action
            "uploadMultiple": False, # Send one file per request
        }
        return json.dumps(settings)

```

#### **`test_pat_upload.pt`**
```xml
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:metal="http://xml.zope.org/namespaces/metal"
      xmlns:tal="http://xml.zope.org/namespaces/tal"
      xmlns:i18n="http://xml.zope.org/namespaces/i18n"
      i18n:domain="once.upload"
      metal:use-macro="context/main_template/macros/master">
<body>

  <metal:custom_title fill-slot="content-title">
    <h1 tal:replace="structure context/@@title" />
  </metal:custom_title>

  <metal:custom_description fill-slot="content-description">
    <p tal:replace="structure context/@@description" />
  </metal:custom_description>

  <metal:content-core fill-slot="content-core">
  <metal:block define-macro="content-core">

    <h2>Main content</h2>

    <div class="pat-upload" data-pat-upload=""
      tal:define="settings view/json_settings;"
      tal:attributes="data-pat-upload settings"
    />

  </metal:block>
  </metal:content-core>
</body>
</html>

```

## Dropzone settings

| Param                  | Defaults to       | Comentario                                                                                                    |
|-----------------------------|-------------------|----------------------------------------------------------------------------------------------------------------|
| url                         | null              | XXX MUST provide url to submit to OR be in a form                                                              |
| method                      | "POST"            | Can be changed to "put" if necessary.                                                                         |
| withCredentials             | false             | Will be set on the XHRequest.                                                                                |
| timeout                     | null              | Timeout for the XHR requests in milliseconds (since v4.4.0). If set to null or 0, no timeout is set.        |
| parallelUploads             | 100               |                                                                                                                |
| uploadMultiple              | false             |                                                                                                                |
| chunking                    | false             | Whether you want files to be uploaded in chunks to your server.                                               |
| forceChunking               | false             | If chunking is enabled, this defines whether **every** file should be chunked, even if the file size is below chunkSize. |
| parallelChunkUploads        | false             |                                                                                                                |
| retryChunks                 | false             |                                                                                                                |
| retryChunksLimit            | 3                 |                                                                                                                |
| maxFilesize                 | 99999999          | In MiB, let's not have a max by default...                                                                    |
| paramName                   | "file"            |                                                                                                                |
| createImageThumbnails       | true              |                                                                                                                |
| maxThumbnailFilesize        | 10                | In MB. When the filename exceeds this limit, the thumbnail will not be generated.                             |
| thumbnailWidth              | 32                | If null, the ratio of the image will be used to calculate it.                                                 |
| thumbnailHeight             | 32                | The same as thumbnailWidth                                                                                   |
| thumbnailMethod             | "crop"            | Can be either contain or crop.                                                                              |
| resizeWidth                 | null              | If set, images will be resized to these dimensions before being **uploaded**.                                |
| resizeHeight                | null              | If only one, resizeWidth **or** resizeHeight is provided, the original aspect ratio of the file will be preserved. |
| resizeMimeType              | null              |                                                                                                                |
| resizeQuality               | 0.8               |                                                                                                                |
| resizeMethod                | "contain"         | Can be either contain or crop.                                                                              |
| filesizeBase                | 1000              | The base that is used to calculate the **displayed** filesize.                                                |
| maxFiles                    | null              | If not null, defines how many files this Dropzone handles. If it exceeds, the event maxfilesexceeded will be called. The dropzone element gets the class dz-max-files-reached accordingly so you can provide visual feedback. |
| headers                     | null              | An optional object to send additional headers to the server. Eg: { "My-Awesome-Header": "header value" }     |
| clickable                   | true              | If false, nothing will be clickable.                                                                         |
| ignoreHiddenFiles           | true              |                                                                                                                |
| acceptedFiles               | null              | The default implementation of accept checks the file's mime type or extension against this list. This is a comma-separated list of mime types or file extensions. Eg.: image/*, application/pdf, .psd |
| autoProcessQueue            | false             |                                                                                                                |
| autoQueue                   | true              |                                                                                                                |
| addRemoveLinks              | false             | Set by template preview.xml. If true, this will add a link to every file preview to remove or cancel (if already uploading) the file. |
| previewsContainer           | ".previews"       |                                                                                                                |
| disablePreviews             | false             |                                                                                                                |
| hiddenInputContainer        | "body"            |                                                                                                                |
| capture                     | null              |                                                                                                                |
| renameFile                  | null              |                                                                                                                |
| forceFallback               | false             |                                                                                                                |
| dictRemoveFileConfirmation  | null              |                                                                                                                |
| showTitle                   | true              |                                                                                                                |
| className                   | "upload"          |                                                                                                                |
| wrap                        | false             |                                                                                                                |
| wrapperTemplate             | '<div class="upload-wrapper"/>' |                                                                                                            |
| fileaddedClassName          | "dropping"        |                                                                                                                |
| useTus                      | false             |                                                                                                                |
| container                   | ""                |                                                                                                                |
| ajaxUpload                  | true              |                                                                                                                |
| autoCleanResults            | true              |                                                                                                                |
| previewTemplate             | null              |                                                                                                                |
| allowPathSelection          | undefined         |                                                                                                                |

## Development

You can clone the project and build in your local machine using `yarn` or `npm`.

Change to project directory and install it:

```bash
cd ./once.upload/src/once/upload
yarn install
```

### Available scripts

In the `package.json` there are these scripts defined:
```json
  "scripts": {
    "build": "NODE_ENV=production webpack --config webpack.config.js",
    "start": "NODE_ENV=development webpack serve --config webpack.config.js",
    "stats": "NODE_ENV=production webpack --config webpack.config.js --json > stats.json",
    "watch:webpack:plone": "NODE_ENV=development DEPLOYMENT=plone webpack --config webpack.config.js --watch",
    "i18n": "node i18n.js"
  }
```


| command             | description                                                |
| ------------------- | ---------------------------------------------------------- |
| yarn build          | Generates bundle.min.js for production environment         |
| watch:webpack:plone | Starts project in the development mode, allows hot changes |
| yarn i18n           | Search for translatable strings and updates widget.pot     |

## Authors

- [Rafa Bermúdez (@rber474)](https://www.github.com/rber474)
