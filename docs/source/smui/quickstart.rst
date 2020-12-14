.. _smui-quickstart:

===============
Quickstart SMUI
===============

Quickstart SMUI from scratch
----------------------------

* Have MySQL up & running on its default port 3306 (e.g. spin up a docker container).
* There should exist a database ``smui`` with a user ``smui`` and the password ``smui`` (default setup for SMUI).
* Run SMUI:

::

   docker run -p 9000:9000 querqy/smui

The latest SMUI is now up & running locally.

* Open SMUI in a browser under http://localhost:9000.
* Create a first rule collection in SMUI, in which search query inputs and rules can be maintained:

::

   curl -S -X PUT -H "Content-Type: application/json" -d '{"name":"ecommerce", "description":"Ecommerce Demo"}' http://localhost:9000/api/v1/solr-index

It is all set up and you are ready to use SMUI now.

* Maintain search inputs and rules.
* You can also download the resulting rules.txt file via SMUI's REST interface:

::

   curl http://localhost:9000/api/v1/allRulesTxtFiles

You will receive a ZIP file containing the rules.txt for the configured channel.

That's a minimum setup to start & work with SMUI. Visit :ref:`the installation and full configuration guide <smui-install-config>` to learn more about, how to proper configure SMUI for your setup.

Quickstart SMUI from ``docker-compose``
---------------------------------------

::

   # In smui repo path:
   docker-compose up

Create your first rule collection in SMUI (see above) & you are ready to use it.
