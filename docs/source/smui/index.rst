.. _smui-index:

|SMUI Build Status (on Travis CI)|

====================
Introduction to SMUI
====================

.. figure:: 20190103_screenshot_SMUI_v1-5-0.png
   :alt: SMUI v1.5.0 screenshot

   SMUI v1.5.0 screenshot

SMUI is a tool for managing Solr-based onsite search. It provides a web
user interface for maintaining and deploying Querqy Rules.

.. |SMUI Build Status (on Travis CI)| image:: https://travis-ci.org/querqy/smui.svg?branch=master
   :target: https://travis-ci.org/querqy/smui


Basic concepts
--------------

SMUI manages various Querqy Rules and may be used to deploy said Rules to search engines. Each Rule is associated
with a Search Input, i.e. a term entered into the managed search engine's query. Rules are defined in a set of
rules (a "Deployment Channel"). Each Deployment Channel results in a separate Querqy rules.txt file.

The basic workflow of SMUI is as follows:

- Create a Deployment Channel (using the REST API). This only needs to be done once per channel.
- Create Rules for various Search Inputs
- Deploy the Rules in a Deployment Channel

The deployment may occur by :ref:`various methods<options-for-rules-deployment>`. After deployment, the set
of Rules in the Deployment Channel will be recognized by the Querqy plugin and thus applied to queries.

Rule types
~~~~~~~~~~

Currently, SMUI supports two types of Querqy Rules: Search Rules and Spelling Rules.

Search rules
^^^^^^^^^^^^

SMUI supports the following search rules, that can be deployed to a
Querqy-supported search engine (like `Solr <https://lucene.apache.org/solr/>`__):

-  ``SYNONYM`` (directed & undirected)
-  ``UP`` / ``DOWN``
-  ``FILTER``
-  ``DELETE``

Please see the main :ref:`Querqy documentation on rules<querqy-rewriters-common-rules>` for a
description of those rules.

Furthermore, SMUI comes with built in ``DECORATE`` rules for certain use
cases:

-  ``REDIRECT`` (as Querqy/\ ``DECORATE``) to a specific target URL

SMUI may as well leverage querqy’s ``@_log`` property to communicate
SMUI rule IDs back to the application querying the search-engine.

Spelling rules
^^^^^^^^^^^^^^

Spelling rules are using the querqy :ref:`REPLACE rewriter<querqy-rewriters-replace>` to overwrite the input term.
The following rules can be used to replace the input term:

.. list-table::
   :widths: 20 20 20 50
   :header-rows: 1

   * -
     - Spelling
     - Alternative
     - Description
   * - **simple rule**
     - mobile
     - ombile
     - ``ombile => mobile``
       Simple replacement of the alternative with the spelling
   * - **prefix rule**
     - cheap
     - cheap*
     - ``cheap* => cheap``
       Can be used to generalize spellings (e.g. cheapest pants => cheap pants). Just one suffix rule is allowed per spelling.
   * - **suffix rule**
     - phone
     - \*phones
     - ``*phones => phone``
       Can be used to generalize spellings (e.g. smartphone => phone). Just one suffix rule is allowed per spelling.
   * - **wildcards**
     - computer $1
     - computer*
     - computer* => computer $1
       Can be used to generalize and split spellings (e.g. computertable => computer table). Just one suffix rule is allowed per spelling.

.. note::

	This feature is disabled by default. You may activate it by setting the configuration key ``toggle.activate-spelling`` to ``true``. See the :ref:`feature configuration<smui-config-features>` section for more information.

Rule Tagging
~~~~~~~~~~~~

Rules may be enriched with tags in the SMUI web interface. These tags may serve as a means of categorizing
rules, thus making them more easily accessible in the web interface. Furthermore, adding tags results in
Querqy DECORATE Rules being created in the resulting rule file. This makes it possible to select Rules
during query time.

.. note::

	This feature is disabled by default. You may activate it by setting the configuration key ``toggle.rule-tagging`` to ``true``. See the :ref:`feature configuration<smui-config-features>` section for more information.
