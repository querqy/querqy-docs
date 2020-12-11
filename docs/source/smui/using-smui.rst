.. _smui-using-smui:

============================
Using SMUI: Operations guide
============================

.. _smui-import-existing-rules:

Importing existing rules (rules.txt)
------------------------------------

As of version 3.3, SMUI supports importing an existing rules.txt file and
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

.. note::

    If you have configured SMUI with authentication, you need to pass
    authentication information (e.g. BasicAuth header) along the ``curl``
    request.

.. warning::

    WARNING: As of version 3.3 the rules.txt import endpoint only supports
    ``SYNONYM``, ``UP`` / ``DOWN``, ``FILTER`` and ``DELETE`` rules.
    Redirects, other ``DECORATE``\ s, as well as Input Tags will be omitted,
    and not be migrated using the import endpoint.

Using the REST API
------------------

In addition to the browser frontend, SMUI provides a the REST API. This
API allows for programmatic creation and update of search management rules.
Rules have corresponding search inputs, that they are
working on. If you want to create rules programmatically, it is therefore
important to keep track of the input the rules should refer to.

Unfortunately, the REST API still lacks a comprehensive documentation.
You may refer to the `CRUD example script`_ in the SMUI repository. This script
creates a search input which is subsequently enriched with one ``SYNONYM`` and
one ``FILTER`` rule.

.. _CRUD example script: https://github.com/querqy/smui/blob/master/docs/example_rest_crud.py

Accessing logs
--------------

The SMUI docker container outputs logs to the STDOUT. Alternatively,
there is a SMUI log file under the following path (in the SMUI docker
container):

::

   /smui/logs/application.log

Server logs can be watched using ``docker exec``, e.g. (command line):

::

   docker exec -it <CONTAINER_ID> tail -f /smui/logs/application.log

Running multiple instances
--------------------------

SMUI supports operation in a multi instance setup, with all instances sharing the same database.

SMUI should support rolling deployments, where one instance will be updated, and
redundant instances (with the prior version) can still be used by the search manager.
However, ensuring this behaviour (as of v3.11) is not scope of the automated tests,
and there is a small chance, that some management requests might get lost during a
rolling deployment in such a multi instance setup.
