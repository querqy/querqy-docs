.. _smui-using-smui:

============================
Using SMUI: Operations guide
============================

Search rules
------------

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
--------------

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

.. _smui-import-existing-rules:

Import existing rules (rules.txt)
---------------------------------

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
