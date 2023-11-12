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

