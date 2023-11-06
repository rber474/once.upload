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
    # If you want to define a template here, please remove the template from
    # the configure.zcml registration of this view.
    # template = ViewPageTemplateFile('test_pat_upload.pt')

    def __call__(self):
        # Implement your own actions:
        return self.index()

    def upload(self):
        """"""
        logger.info("procesando fichero")
        response = self.request.response
        response.setHeader("Content-type", "application/json")
        response.setStatus(200)
        return json.dumps({"message": "Prueba de mensaje", "error": ""})
