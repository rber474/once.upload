# -*- coding: utf-8 -*-
"""Setup tests for this package."""
from once.upload.testing import ONCE_UPLOAD_INTEGRATION_TESTING  # noqa: E501
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID

import unittest


try:
    from Products.CMFPlone.utils import get_installer
except ImportError:
    get_installer = None


class TestSetup(unittest.TestCase):
    """Test that once.upload is properly installed."""

    layer = ONCE_UPLOAD_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer["portal"]
        if get_installer:
            self.installer = get_installer(self.portal, self.layer["request"])
        else:
            self.installer = api.portal.get_tool("portal_quickinstaller")

    def test_product_installed(self):
        """Test if once.upload is installed."""
        self.assertTrue(self.installer.is_product_installed("once.upload"))

    def test_browserlayer(self):
        """Test that IOnceUploadLayer is registered."""
        from once.upload.interfaces import IOnceUploadLayer
        from plone.browserlayer import utils

        self.assertIn(IOnceUploadLayer, utils.registered_layers())


class TestUninstall(unittest.TestCase):

    layer = ONCE_UPLOAD_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer["portal"]
        if get_installer:
            self.installer = get_installer(self.portal, self.layer["request"])
        else:
            self.installer = api.portal.get_tool("portal_quickinstaller")
        roles_before = api.user.get_roles(TEST_USER_ID)
        setRoles(self.portal, TEST_USER_ID, ["Manager"])
        self.installer.uninstall_product("once.upload")
        setRoles(self.portal, TEST_USER_ID, roles_before)

    def test_product_uninstalled(self):
        """Test if once.upload is cleanly uninstalled."""
        self.assertFalse(self.installer.is_product_installed("once.upload"))

    def test_browserlayer_removed(self):
        """Test that IOnceUploadLayer is removed."""
        from once.upload.interfaces import IOnceUploadLayer
        from plone.browserlayer import utils

        self.assertNotIn(IOnceUploadLayer, utils.registered_layers())
