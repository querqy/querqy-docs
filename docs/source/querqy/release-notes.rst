.. _querqy-release-notes:

=============
Release notes
=============

.. include:: se-section.txt


.. rst-class:: solr

.. raw:: html

  <div>

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
