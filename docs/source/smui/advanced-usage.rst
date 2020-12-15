.. _smui-advanced-usage:

======================
Advanced usage of SMUI
======================

Managing rules via REST interface
---------------------------------

As with SMUI’s web frontend, you are capable of leveraging its
REST interface to create and update search management rules
programmatically. Rules have corresponding search inputs, that they are
working on. If you want to create rules programmatically it is therefore
important to keep track of the input the rules should refer to.

The following python script shows, how search inputs & rules can be created programmatically. The script will create one search input, that will be updated with one ``SYNONYM`` and one ``FILTER`` rule as an example:

.. literalinclude:: example_rest_crud.py

Monitor SMUI’s log file
-----------------------

SMUI’s log file is located under the following path (in the SMUI docker
container):

::

   /smui/logs/application.log

Server logs can be watched using ``docker exec``, e.g. (command line):

::

   docker exec -it <CONTAINER_PS_ID> tail -f /smui/logs/application.log

SMUI operations (multi instance)
--------------------------------

-  SMUI supports to be operated in a multi instance setup.
-  Rolling deployments: SMUI should support rolling deployments, where one instance will be updated, and redundant instances (with prior version) can still be used by the search manager. However, ensuring this behaviour (as of v3.11) this is not scope of the automated tests, and there is a small chance, that some management requests might get lost during a rolling deployment in such a multi instance setup.
