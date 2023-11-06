import _ from "underscore";
import _t from "@plone/mockup/src/core/i18n-wrapper";
import Base from "@patternslib/patternslib/src/core/base";
import utils from "@plone/mockup/src/core/utils";
// import upload from "@plone/mockup/src/pat/upload/upload"; // Importa el módulo de pat-upload


let Dropzone;

// Extender el patrón "upload" de @plone/mockup
export default Base.extend({
    name: "once-upload",
    trigger: ".once-pat-upload",
    parser: "mockup",
    defaults: {
        // Dropzone options
        url: null, // XXX MUST provide url to submit to OR be in a form
        method: "POST", // Can be changed to "put" if necessary.
        withCredentials: false,  // Will be set on the XHRequest.
        timeout: null,  // timeout for the XHR requests in milliseconds (since v4.4.0). If set to null or 0, no timeout is going to be set.
        parallelUploads: 100,
        uploadMultiple: false,
        chunking: false,  // Whether you want files to be uploaded in chunks to your server.
        forceChunking: false,  // f chunking is enabled, this defines whether **every** file should be chunked, even if the file size is below chunkSize.
        parallelChunkUploads: false,
        retryChunks: false,
        retryChunksLimit: 3,
        maxFilesize: 99999999, // in MiB, let's not have a max by default...
        paramName: "file",
        createImageThumbnails: true,
        maxThumbnailFilesize: 10, // In MB. When the filename exceeds this limit, the thumbnail will not be generated.
        thumbnailWidth: 32,  // If null, the ratio of the image will be used to calculate it.
        thumbnailHeight: 32,  // The same as thumbnailWidth
        thumbnailMethod: "crop",  // Can be either contain or crop.
        resizeWidth: null,  // If set, images will be resized to these dimensions before being **uploaded**.
        resizeHeight: null,  //  If only one, resizeWidth **or** resizeHeight is provided, the original aspect ratio of the file will be preserved.
        resizeMimeType: null,
        resizeQuality: 0.8,
        resizeMethod: "contain",  // Can be either contain or crop.
        filesizeBase: 1000,  //  The base that is used to calculate the **displayed** filesize.
        maxFiles: null,  // If not null defines how many files this Dropzone handles. If it exceeds, the event maxfilesexceeded will be called. The dropzone element gets the class dz-max-files-reached accordingly so you can provide visual feedback.
        headers: null,  // An optional object to send additional headers to the server. Eg: { "My-Awesome-Header": "header value" }
        clickable: true,  // if false nothing will be clickable.
        ignoreHiddenFiles: true,
        acceptedFiles: null,  // The default implementation of accept checks the file's mime type or extension against this list. This is a comma separated list of mime types or file extensions. Eg.: image/*,application/pdf,.psd
        autoProcessQueue: false,
        autoQueue: true,
        addRemoveLinks: false,  // set by template preview.xml, If true, this will add a link to every file preview to remove or cancel (if already uploading) the file.
        previewsContainer: ".previews",
        disablePreviews: false,
        hiddenInputContainer: "body",
        capture: null,
        renameFile: null,
        forceFallback: false,
        dictRemoveFileConfirmation: null,

        // Pattern options
        showTitle: true,
        className: "upload",
        wrap: false,
        wrapperTemplate: '<div class="upload-wrapper"/>',
        fileaddedClassName: "dropping",
        useTus: false,
        container: "",
        ajaxUpload: true,
        autoCleanResults: true,
        previewTemplate: null,
        allowPathSelection: undefined,

        relatedItems: {
            // UID attribute is required here since we're working with related items
            attributes: [
                "UID",
                "Title",
                "Description",
                "getURL",
                "portal_type",
                "path",
                "ModificationDate",
            ],
            batchSize: 20,
            basePath: "/",
            vocabularyUrl: null,
            width: 500,
            maximumSelectionSize: 1,
            selectableTypes: ["Folder"],
        },
        /**
         * The text used before any files are dropped.
         */
        dictDefaultMessage: _t("Drop files here to upload"),

        /**
         * The text that replaces the default message text it the browser is not supported.
         */
        dictFallbackMessage:
            _t("Your browser does not support drag'n'drop file uploads."),

        /**
         * The text that will be added before the fallback form.
         * If you provide a  fallback element yourself, or if this option is `null` this will
         * be ignored.
         */
        dictFallbackText:
            _t("Please use the fallback form below to upload your files like in the olden days."),

        /**
         * If the filesize is too big.
         * `{{filesize}}` and `{{maxFilesize}}` will be replaced with the respective configuration values.
         */
        dictFileTooBig:
            _t("File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB."),

        /**
         * If the file doesn't match the file type.
         */
        dictInvalidFileType: _t("You can't upload files of this type."),

        /**
         * If the server response was invalid.
         * `{{statusCode}}` will be replaced with the servers status code.
         */
        dictResponseError: _t("Server responded with {{statusCode}} code."),

        /**
         * If `addRemoveLinks` is true, the text to be used for the cancel upload link.
         */
        dictCancelUpload: _t("Cancel upload"),

        /**
         * The text that is displayed if an upload was manually canceled
         */
        dictUploadCanceled: _t("Upload canceled."),

        /**
         * If `addRemoveLinks` is true, the text to be used for confirmation when cancelling upload.
         */
        dictCancelUploadConfirmation: _t("Are you sure you want to cancel this upload?"),

        /**
         * If `addRemoveLinks` is true, the text to be used to remove a file.
         */
        dictRemoveFile: _t("Remove file"),

        /**
         * Displayed if `maxFiles` is st and exceeded.
         * The string `{{maxFiles}}` will be replaced by the configuration value.
         */
        dictMaxFilesExceeded: _t("You can not upload any more files."),

        /**
         * Title attribute for Delete button
         */
        deleteButtonLabel: _t("Delete {{filename}}"),

        /**
         * Success message
         */
        successMessage: _t("File upload successfully completed."),

        /**
         * Error message
         */
        errorMessage: _t("Some errors are ocurred while processing the upload. Please fix them before continue."),
    },

    init: async function () {
        import("dropzone/dist/dropzone.css");
        import("./upload.scss");
        Dropzone = (await import("dropzone")).default;
        /* we do not want this plugin to auto discover */
        Dropzone.autoDiscover = false;

        const UploadTemplate = (await import("./templates/upload.xml")).default;

        var self = this;

        if (self.$el.find(".upload-area").length) {
            console.log("Found already a dropzone on element, skipping!");
            return;
        }

        if (typeof self.options.allowPathSelection === "undefined") {
            // Set allowPathSelection to true, if we can use path based urls.
            self.options.allowPathSelection =
                self.options.baseUrl && self.options.relativePath;
        }

        self.showHideControls();
        // TODO: find a way to make this work in firefox (and IE)
        $(document).on("paste", function (e) {
            var oe = e.originalEvent;
            var items = oe.clipboardData.items;
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        var blob = items[i].getAsFile();
                        self.dropzone.addFile(blob);
                    }
                }
            }
        });
        // values that will change current processing
        self.currentPath = self.options.currentPath;
        self.currentFile = 0;

        let template = _.template(UploadTemplate)({
            _t: _t,
            allowPathSelection: self.options.allowPathSelection,
            acceptedFiles: self.options.acceptedFiles,
        });
        self.$el.addClass(self.options.className);
        self.$el.append(template);

        self.$progress = $(".progress-bar-success", self.$el);

        if (!self.options.showTitle) {
            self.$el.find("h2.title").hide();
        }

        if (!self.options.ajaxUpload) {
            // no ajax upload, drop the fallback
            $(".fallback", this.$el).remove();
            if (this.$el.hasClass(".upload-container")) {
                this.$el.addClass("no-ajax-upload");
            } else {
                this.$el.closest(".upload-container").addClass("no-ajax-upload");
            }
        }

        if (self.options.wrap) {
            self.$el.wrap(self.options.wrapperTemplate);
            self.$el = self.$el.parent();
        }

        if (self.options.allowPathSelection) {
            // only use related items if we can generate path based urls and if it's not turned off.
            self.$pathInput = $('input[name="location"]', self.$el);
            self.relatedItems = await self.setupRelatedItems(self.$pathInput);
        } else {
            $('input[name="location"]', self.$el).parent().remove();
            self.relatedItems = null;
        }

        self.$dropzone = $(".upload-area", self.$el);

        $("div.browse-select button.browse", self.$el).on("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (
                !self.options.maxFiles ||
                self.dropzone.files.length < self.options.maxFiles
            ) {
                self.dropzone.hiddenFileInput.click();
            }
        });

        var dzoneOptions = await this.getDzoneOptions();

        try {
            // if init of Dropzone fails it says nothing and
            // it fails silently. Using this block we make sure
            // that if you break it w/ some weird or missing option
            // you can get a proper log of it
            //
            self.dropzone = new Dropzone(self.$dropzone[0], dzoneOptions);
        } catch (e) {
            if (window.DEBUG) {
                // log it!
                console.log(e);
            }
            throw e;
        }

        // Filter acceptedFiles in input, so browser will propose only
        // those files types
        if (self.options.acceptedFiles !== null) {
            $(".dz-hidden-input").attr("accept", self.options.acceptedFiles)
        }

        self.dropzone.on("maxfilesreached", function () {
            self.showHideControls();
        });

        self.dropzone.on("addedfile", function (/* file */) {
            self.emptyMessages();
            self.showHideControls();
        });

        self.dropzone.on("removedfile", function () {
            self.showHideControls();
        });

        self.dropzone.on("success", function (e, response) {
            // Trigger event 'uploadAllCompleted' and pass the server's response and
            // the path uid. This event can be listened to by patterns using the
            // upload pattern, e.g. the TinyMCE pattern's link plugin.
            var data;
            try {
                data = JSON.parse(response);
            } catch (ex) {
                data = response;
            }
            self.$el.trigger("uploadAllCompleted", {
                data: data,
                path_uid: self.$pathInput ? self.$pathInput.val() : null,
            });
            self.showMessage(self.options.successMessage, "info");

        });

        if (self.options.autoCleanResults) {
            self.dropzone.on("complete", function (file) {
                if (file.status === Dropzone.SUCCESS) {
                    setTimeout(function () {
                        // $(file.previewElement).fadeOut();
                        // Remove file from dropzone if successed
                        self.dropzone.removeFile(file);
                    }, 1500);
                }
            });
        }

        self.dropzone.on("complete", function (file) {
            if (file.status === Dropzone.SUCCESS && self.dropzone.files.length === 1) {
                self.showHideControls();
                self.$progress.attr("aria-valuenow", 0).css("width", 0 + "%");
            }
        });

        self.dropzone.on("error", function (file, response, xmlhr) {

            self.showMessage(self.options.errorMessage, "error")

            $(".file-details", file.previewElement).addClass("alert alert-danger");
            if (typeof xmlhr !== "undefined" && xmlhr.status !== 403) {
                // If error other than 403, just print a generic message
                $("span.error", file.previewElement).html(
                    _t("The file transfer failed")
                );
            }
        });

        self.dropzone.on("sending", function() {
            self.emptyMessages();
            $("#total-progress", self.$el).css("opacity", 1);
        });

        self.dropzone.on("queuecomplete", function() {
            $("#total-progress", self.$el).css("opacity", 0);
        });

        self.dropzone.on("totaluploadprogress", function (total, totalBytes, totalBytesSent) {
            // need to caclulate total pct here in reality since we're manually
            // processing each file one at a time.
            self.$progress.attr("aria-valuenow", total).css("width", total + "%");
        });

        $(".upload-all", self.$el).on("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.dropzone.processQueue();
        });

        $(".cancel-all", self.$el).on("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.dropzone.removeAllFiles(true);
            self.emptyMessages();
            self.$progress.attr("aria-valuenow", 0).css("width", 0 + "%");
        });

        if (self.options.clipboardfile) {
            self.dropzone.addFile(self.options.clipboardfile);
        }
    },

    getDzoneOptions: async function () {
        const PreviewTemplate = (await import("./templates/preview.xml")).default;

        var self = this;

        // This pattern REQUIRE dropzone to be clickable
        self.options.clickable = true;

        var options = $.extend({}, self.options);
        options.url = self.getUrl();

        let previewtemplate = _.template(PreviewTemplate)({
            _t: _t,
            createImageThumbnails: options.createImageThumbnails,
        });

        options.headers = {
            "X-CSRF-TOKEN": utils.getAuthenticator(),
        };

        // delete options.wrap;
        // delete options.wrapperTemplate;
        // delete options.resultTemplate;
        // delete options.autoCleanResults;
        // delete options.fileaddedClassName;
        // delete options.useTus;

        if (self.options.previewsContainer) {
            /*
             * if they have a select but it's not an id, let's make an id selector
             * so we can target the correct container. dropzone is weird here...
             */
            var $preview = self.$el.find(self.options.previewsContainer);
            if ($preview.length > 0) {
                options.previewsContainer = $preview[0];
            }
        }

        options.previewTemplate = previewtemplate;

        // if our element is a form we should force some values
        // https://github.com/enyo/dropzone/wiki/Combine-normal-form-with-Dropzone
        return options;
    },

    showMessage: function (msg, msg_type) {
        var self = this;
        self.emptyMessages();
        var format;
        switch (msg_type) {
            case "error":
                format = 'danger'
                break;
            default:
                format = 'info'
        }

        const message ='<div class="portalMessage statusmessage statusmessage-'
            + msg_type
            + ' alert alert-'
            + format
            +'" aria-live="assertive" role="alert">' + msg +'</div>';

        $("#upload-messages", self.$el).append(message);
    },


    emptyMessages: function () {
        $("#upload-messages", self.$el).empty();
    },

    showHideControls: function () {
        /* we do this delayed because this can be called multiple times
         AND we need to do this hide/show AFTER dropzone is done with
         all it's own events. This is NASTY but the only way we can
         enforce some numFiles with dropzone! */
        var self = this;
        if (self._showHideTimeout) {
            clearTimeout(self._showHideTimeout);
        }
        self._showHideTimeout = setTimeout(function () {
            self._showHideControls();
        }, 50);
    },

    _showHideControls: function () {
        var self = this;
        var $controls = $(".controls", self.$el);
        var $browse = $(".browse-select", self.$el);
        var $input = $(".dz-hidden-input");

        if (self.options.maxFiles) {
            if (self.dropzone.files.length < self.options.maxFiles) {
                $browse.show();
                $input.prop("disabled", false);
            } else {
                $browse.hide();
                $input.prop("disabled", true);
            }
        }
        if (self.dropzone.files.length > 0) {
            $controls.fadeIn("slow");
        } else {
            $controls.fadeOut("slow");
        }
    },

    pathJoin: function () {
        var parts = [];
        _.each(arguments, function (part) {
            if (!part) {
                return;
            }
            if (part[0] === "/") {
                part = part.substring(1);
            }
            if (part[part.length - 1] === "/") {
                part = part.substring(0, part.length - 1);
            }
            parts.push(part);
        });
        return parts.join("/");
    },

    getUrl: function () {
        var self = this;
        var url = self.options.url;
        if (!url) {
            if (self.options.baseUrl && self.options.relativePath) {
                url = self.options.baseUrl;
                if (url[url.length - 1] !== "/") {
                    url = url + "/";
                }
                url = url + self.pathJoin(self.currentPath, self.options.relativePath);
            } else {
                var $form = self.$el.parents("form");
                if ($form.length > 0) {
                    url = $form.attr("action");
                } else {
                    url = window.location.href;
                }
            }
        }
        return url;
    },

});

// export default upload;
