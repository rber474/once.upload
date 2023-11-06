# -*- coding: utf-8 -*-
from once.upload.testing import ONCE_UPLOAD_FUNCTIONAL_TESTING
from once.upload.testing import ONCE_UPLOAD_INTEGRATION_TESTING
from once.upload.views.test_pat_upload import ITestPatUpload
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from zope.component import getMultiAdapter
from zope.interface.interfaces import ComponentLookupError

import unittest


class ViewsIntegrationTest(unittest.TestCase):

    layer = ONCE_UPLOAD_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer["portal"]
        setRoles(self.portal, TEST_USER_ID, ["Manager"])
        api.content.create(self.portal, "Folder", "other-folder")
        api.content.create(self.portal, "Document", "front-page")

    def test_test_pat_upload_is_registered(self):
        view = getMultiAdapter(
            (self.portal["other-folder"], self.portal.REQUEST), name="test-pat-upload"
        )
        self.assertTrue(ITestPatUpload.providedBy(view))

    def test_test_pat_upload_not_matching_interface(self):
        view_found = True
        try:
            view = getMultiAdapter(
                (self.portal["front-page"], self.portal.REQUEST), name="test-pat-upload"
            )
        except ComponentLookupError:
            view_found = False
        else:
            view_found = ITestPatUpload.providedBy(view)
        self.assertFalse(view_found)


class ViewsFunctionalTest(unittest.TestCase):

    layer = ONCE_UPLOAD_FUNCTIONAL_TESTING

    def setUp(self):
        self.portal = self.layer["portal"]
        setRoles(self.portal, TEST_USER_ID, ["Manager"])
