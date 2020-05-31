===========================================
Advanced Elasticsearch plugin configuration
===========================================

Querqy rewriter configuration is stored in an Elasticsearch index named
``.querqy``. Though you can search and view documents from this index like you
would do with documents from any other index, you should not directly update the
index. This could lead to an inconsistent state as Querqy caches the rewriter
configurations in memory by Querqy.

By default, the '.querqy' index is copied to one replica. You can change this
number using the following node property:

*querqy.store.replicas*
  Set the number of replicas for the '.querqy' index.

  Default: ``1``
