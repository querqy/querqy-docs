.. _smui-using-smui:

============================
Using SMUI: Operations guide
============================

Database connection
-------------------

SMUI needs a database backend in order to manage and store search
management rules.

Supported databases
~~~~~~~~~~~~~~~~~~~

Generally, SMUI database connection implementation is based on JDBC and
only standard SQL is used, so technically every database management
system supported by JDBC should work with SMUI. However, database
management systems come with specific features which potentially could
impact SMUI operation. SMUI has been explicitly tested (and/or productively used)
with the following database management systems:

-  MySQL & MariaDB
-  PostgreSQL
-  SQLite
-  HSQLDB

Where your database backend application runs, e.g. in a production
environment, depends on your specific setup. Refer to the :ref:`basic configuration <smui-basic-settings>`
section on how to configure your database connection.

Once the database connection has been configured, SMUI will initialize the
database on first startup.

Managing rules
--------------

Managing rules via REST interface
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As with SMUI’s web frontend, you are capable of leveraging its
REST interface to create and update search management rules
programmatically. Rules have corresponding search inputs, that they are
working on. If you want to create rules programmatically it is therefore
important to keep track of the input the rules should refer to.

The following example python script shows how search inputs & rules
can be created programmatically. The script creates a single search input,
which is subsequently be updated with one ``SYNONYM`` and one ``FILTER`` rule as an example:

.. literalinclude:: example_rest_crud.py

.. _smui-import-existing-rules:

Importing existing rules (rules.txt)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

Handling of Input Tags
**********************

As of version 3.13, SMUI supports importing Input Tags according to your
SMUI Configuration.

::

   notebook =>
     SYNONYM: laptop
     @"_log" : "some log text"
     @"_id" : "some-ID"
     @"category" : "electronics"
     @{
       "lang" : ["de", "en"],
       "tenant" : ["t1", "t3"]
     }@

Configuration settings

``toggle.rule-tagging = false`` : All tags are ignored by the import

``toggle.rule-tagging = true`` and ``toggle.predefined-tags-file = ""`` : All 
tags are imported. Tags not yet known to SMUI are newly created and are available
in the user interface after the import.

``toggle.rule-tagging = true`` and ``toggle.predefined-tags-file = "path/to/tags.json"`` : Only
predefined tags are allowed and will be imported. Import will abort in case of 
other tags in the rules.txt that are not predefined in SMUI.

.. note::

    The Querqy internal tags ``_id`` and ``_log`` are omitted.


.. warning::

    As of version 3.3 the rules.txt import endpoint only supports
    ``SYNONYM``, ``UP`` / ``DOWN``, ``FILTER`` and ``DELETE`` rules as well
    as Input Tags.
    Redirects and other ``DECORATE``\ s will be omitted and not be migrated 
    using the import endpoint.


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
