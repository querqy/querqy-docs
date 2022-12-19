.. _querqy-release-notes:

=============
Release notes
=============

.. include:: se-section.txt


.. rst-class:: solr

.. raw:: html

  <div>

.. warning:: Querqy configuration has changed in an incompatible way with
  the introduction of Querqy v5 for Solr. Make sure to follow the documentation
  for your Querqy version below. See :doc:`here<older-versions/querqy5-solr-migration>` for
  detailed information about changes and a migration guide to :doc:`Querqy 5 for
  Solr <older-versions/querqy5-solr-migration>`

.. rst-class:: solr


Major changes in Querqy for Solr 5.5.1
======================================

This version re-implements info logging and introduces some **breaking changes**
that will affect you if

- you are using Info Logging, or
- rely on the debug output format, or
- you are using a custom rewriter implementation

Please see :ref:`the documentation <logging-and-debugging-rewriters>` for
details of Info Logging and debugging.

Notes on migration
-------------------

To migrate **info logging**:

- ``solrconfig.xml``: If you have been using only the built-in info logging that adds
  log information to the request response, you can just remove all configuration
  related to info logging from solrconfig.xml (the ``<lst name="infoLogging">``
  under the Querqy query parser element). If you have been using a custom sink, please
  see section :ref:`custom_solr_sinks` for how to configure it in the new
  version.
- Add the rewriter-to-sink mapping to the configuration of each rewriter that
  you want to log. For example:

  .. code-block:: JSON
    :linenos:
    :emphasize-lines: 6-8

    {
         "class": "querqy.solr.rewriter.commonrules.CommonRulesRewriterFactory",
         "config": {
                    "rules" : "notebook =>\nSYNONYM: laptop"
         },
         "info_logging": {
           "sinks": ["response"]
         }
    }

  The `response` sink is predefined and adds log information to the Solr
  response. If you are using a custom sink, you will have to add its name to the
  list of ``sinks`` here.
- To enable Info Logging per request, the parameter ``querqy.infoLogging=on`` is
  no longer used. You can instead just use
  ``querqy.rewriteLogging.rewriters=*&querqy.rewriteLogging=details``. Please
  see the documentation about :ref:`logging-per-request` for the more
  fine-grained control over the response format that these parameters provide.
- The format of the logging information that is being added to the Solr response
  has changed. The response key has changed from ``querqy.infoLog`` to
  ``querqyRewriteLogging`` and the log payload has changed in content and
  structure.

Changes in **debug** output:

- The debug output (returned for ``debugQuery=true``) is available in the
  response under a new key (``debug/querqy/rewrite``) and has changed in
  structure and content.

Changes affecting **custom Rewriter** implementations:

- The signature of method ``rewrite(2x)`` of the
  ``querqy.rewrite.QueryRewriter`` interface has changed to:

  | :code:`RewriterOutput rewrite(ExpandedQuery query, SearchEngineRequestAdapter searchEngineRequestAdapter)`

  This means that the method no longer returns the rewritten ``ExpandedQuery``
  but returns the ExpandedQuery together with the info logging output wrapped
  into a ``RewriterOutput`` object. This implies that the info logging
  information is no longer passed to the request context via the
  SearchEngineRequestAdapter.



Changes in Querqy for Solr 5.4.1
================================

- Bumping jackson-databind and json-smart versions
  `(#348) <https://github.com/querqy/querqy/issues/348>`__.
- Do not rely on system character encoding settings but assure that input stream
  bytes are interpreted as UTF-8 `(#346) <https://github.com/querqy/querqy/issues/346>`__.


Major changes in Querqy for Solr 5.4.0
======================================

- The Common Rules Rewriter can now produce multiplicative UP/DOWN boosts
  `(#328) <https://github.com/querqy/querqy/issues/328>`__.

Changes in Querqy for Solr 5.3.2
======================================

- Improved scoring for new
    :code:`multiMatchTie` `(#327) <https://github.com/querqy/querqy/issues/327>`__.

Changes in Querqy for Solr 5.3.1
======================================

- Bugfix related using single term synonyms with new
  :code:`multiMatchTie` `(#315) <https://github.com/querqy/querqy/issues/315>`__.



Major changes in Querqy for Solr 5.3.0
======================================

- The Word Break Rewriter now applies language specific morphology also
  for compounding `(#282) <https://github.com/querqy/querqy/issues/282>`__. See
  ``morphology`` in the :ref:`Word Break Rewriter <querqy-rewriters-word-break>`
  configuration.
- You can now configure the path under which rewriter configurations will be
  stored in ZooKeeper `(#263) <https://github.com/querqy/querqy/issues/263>`__.
  For more information, see the :ref:`zkDataDirectory <querqy-store-rewriters>`
  property in the Querqy RequestHandler configuration
- Introduce :code:`multiMatchTie` to avoid higher score if document matches more than
  one synonym `(#281) <https://github.com/querqy/querqy/issues/281>`__ (experimental).

.. raw:: html

  </div>


.. rst-class:: elasticsearch

.. raw:: html

  <div>

Relase notes for Querqy for **OpenSearch** can be found `here  <https://github.com/querqy/querqy-opensearch/tags>`__.

Querqy for Elasticsearch 1.6es852.0
====================================

  - Release for Elasticsearch 8.5.2

Querqy for Elasticsearch 1.6es843.0
====================================

    - Release for Elasticsearch 8.4.3

Querqy for Elasticsearch 1.6es841.0
====================================

  - Release for Elasticsearch 8.4.1

Querqy for Elasticsearch 1.6es833.0
====================================

  - Release for Elasticsearch 8.3.3

Querqy for Elasticsearch 1.6es823.0
====================================

  - Release for Elasticsearch 8.2.3

Querqy for Elasticsearch 1.6es813.0
====================================

  - Release for Elasticsearch 8.1.3

Querqy for Elasticsearch 1.6es801.0
====================================

  - Release for Elasticsearch 8.0.1
  - Adding compound morphology to WordBreakCompoundRewriter `(#22) <https://github.com/querqy/querqy-elasticsearch/issues/22>`__


Querqy for Elasticsearch 1.5es7172.0
====================================

  - Release for Elasticsearch 7.17.2

.. raw:: html

  </div>
