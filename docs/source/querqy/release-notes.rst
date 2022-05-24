.. _querqy-release-notes:

=============
Release notes
=============

.. include:: se-section.txt


.. rst-class:: solr

.. raw:: html

  <div>

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

Querqy for Elasticsearch 1.5es7172.0
====================================

  - Release for Elasticsearch 7.17.2

.. raw:: html

  </div>
