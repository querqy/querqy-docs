.. _smui-using-smui:

============================
Using SMUI: operations guide
============================

USING SMUI
----------

Search rules
~~~~~~~~~~~~

SMUI supports the following search rules, that can be deployed to a
Querqy supporting search engine (like
`Solr <https://lucene.apache.org/solr/>`__):

-  ``SYNONYM`` (directed & undirected)
-  ``UP`` / ``DOWN``
-  ``FILTER``
-  ``DELETE``

Please see `Querqy <https://github.com/renekrie/querqy>`__ for a
description of those rules.

Furthermore, SMUI comes with built in ``DECORATE`` rules for certain use
cases:

-  ``REDIRECT`` (as Querqy/\ ``DECORATE``) to a specific target URL

SMUI might as well leverages querqy’s ``@_log`` property to communicate
SMUI’s rule ID back to the search-engine (Solr) querying instance.

Spelling rules
~~~~~~~~~~~~~~

Spelling rules are using the querqy REPLACE rewriter to overwrite the input term.
Following rules can be used to replace the input term:

.. list-table:: SMUI spelling rules
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

Import existing rules (rules.txt)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As of version 3.3 SMUI supports importing an existing rules.txt file and
adding its content to the SMUI database. The following steps outline the
procedure

-  uses an existing Solr index or create a new one
-  uses the new ``import-from-rules-txt`` endpoint to upload / import a
   rules.txt file

e.g.:

::

   curl -X PUT  -H "Content-Type: application/json" -d '{"name": "mySolrCore", "description": "My Solr Core"}' http://localhost:9000/api/v1/solr-index
   #> {"result":"OK","message":"Adding Search Input 'mySolrCore' successful.","returnId":"a4aaf472-c0c0-49ac-8e34-c70fef9aa8a9"}
   #> a4aaf472-c0c0-49ac-8e34-c70fef9aa8a9 is the Id of new Solr index
   curl -F 'rules_txt=@/path/to/local/rules.txt' http://localhost:9000/api/v1/a4aaf472-c0c0-49ac-8e34-c70fef9aa8a9/import-from-rules-txt

NOTE: If you have configured SMUI with authentication, you need to pass
authentication information (e.g. BasicAuth header) along the ``curl``
request.

WARNING: As of version 3.3 the rules.txt import endpoint only supports
``SYNONYM``, ``UP`` / ``DOWN``, ``FILTER`` and ``DELETE`` rules.
Redirects, other ``DECORATE``\ s, as well as Input Tags will be omitted,
and not be migrated using the import endpoint.

Use SMUI’s REST interface to create an search input with according rules
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Like SMUI’s (angular) frontend, you are capable of leveraging SMUI’s
REST interface to create and update search management rules
programmatically. Rules have corresponding search inputs, that they are
working on. If you want to create rules programmatically it is therefore
important to keep track of the input the rules should refer to. As
processing relies on parsing JSON input and output, the python script
under `docs/example_rest_crud.py <docs/example_rest_crud.py>`__ will
create one search input, that will be updated with one ``SYNONYM`` and
one ``FILTER`` rule as an example.

Monitor SMUI’s log file
~~~~~~~~~~~~~~~~~~~~~~~

SMUI’s log file is located under the following path (in the SMUI docker
container):

::

   /smui/logs/application.log

Server logs can be watched using ``docker exec``, e.g. (command line):

::

   docker exec -it <CONTAINER_PS_ID> tail -f /smui/logs/application.log

SMUI operations (multi instance)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  SMUI supports to be operated in a multi instance setup.
-  Rolling deployments: SMUI should support rolling deployments, where one instance will be updated, and redundant instances (with prior version) can still be used by the search manager. However, ensuring this behaviour (as of v3.11) this is not scope of the automated tests, and there is a small chance, that some management requests might get lost during a rolling deployment in such a multi instance setup.
