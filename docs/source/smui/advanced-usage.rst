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

The following example python script shows how search inputs & rules
can be created programmatically. The script creates a single search input,
which is subsequently be updated with one ``SYNONYM`` and one ``FILTER`` rule as an example:

.. literalinclude:: example_rest_crud.py