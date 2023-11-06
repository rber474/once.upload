# -*- coding: utf-8 -*-
from plone.app.robotframework.testing import REMOTE_LIBRARY_BUNDLE_FIXTURE
from plone.app.testing import applyProfile
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PLONE_FIXTURE
from plone.app.testing import PloneSandboxLayer
from plone.testing import z2

import once.upload


class OnceUploadLayer(PloneSandboxLayer):
    defaultBases = (PLONE_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        # Load any other ZCML that is required for your tests.
        # The z3c.autoinclude feature is disabled in the Plone fixture base
        # layer.
        import plone.app.dexterity

        self.loadZCML(package=plone.app.dexterity)
        import plone.restapi

        self.loadZCML(package=plone.restapi)
        self.loadZCML(package=once.upload)

    def setUpPloneSite(self, portal):
        applyProfile(portal, "once.upload:default")


ONCE_UPLOAD_FIXTURE = OnceUploadLayer()


ONCE_UPLOAD_INTEGRATION_TESTING = IntegrationTesting(
    bases=(ONCE_UPLOAD_FIXTURE,),
    name="OnceUploadLayer:IntegrationTesting",
)


ONCE_UPLOAD_FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(ONCE_UPLOAD_FIXTURE,),
    name="OnceUploadLayer:FunctionalTesting",
)


ONCE_UPLOAD_ACCEPTANCE_TESTING = FunctionalTesting(
    bases=(
        ONCE_UPLOAD_FIXTURE,
        REMOTE_LIBRARY_BUNDLE_FIXTURE,
        z2.ZSERVER_FIXTURE,
    ),
    name="OnceUploadLayer:AcceptanceTesting",
)
