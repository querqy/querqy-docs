===========================
Making queries using Querqy
===========================

.. include:: se-section.txt

.. rst-class:: elasticsearch

Querying Elasticsearch
======================

Querqy defines its own query builder which can be executed with a rich set of
parameters. We will walk through these parameters step by step, starting with a
minimal query, which does not use any rewriter, then adding a 'Common Rules'
rewriter and finally explaining the full set of parameters, many of them not
related to query rewriting but to search relevance tuning in general. TODO


.. _querqy-minimal-query-elasticsearch:

Minimal query
-------------


:code:`POST /myindex/_search`

.. code-block:: JSON
   :linenos:

   {
      "query": {
          "querqy": {
              "matching_query": {
                  "query": "notebook"
              },
              "query_fields": [ "title^3.0", "brand^2.1", "shortSummary"]
          }
      }
   }

Querqy provides a new query builder, :code:`querqy` (line #3), that can be used
in a query just like any other Elasticsearch query type. The
:code:`matching_query` (#4) defines the query for which documents will be
matched and retrieved.

The matching query is different from boosting queries which would only influence
the ranking but not the matching. We will later see that Querqy allows to
specify information for boosting outside the matching_query object and that the
set of matching documents can be changed in query rewriting, for example, by
adding synonyms or by deleting query tokens.

The :code:`query` element (#5) contains the query string. In most cases this is
just the query string as it was typed into the search box by the user.

The list of :code:`query_fields` (#7) specifies in which fields to search. A
field name can have an optional field weight. In the example, the field weight
for title is 3.0. The default field weight is 1.0. Field weights must be
positive. We will later see that the query_fields can be applied to parts of the
querqy query other than the matching_query as well. That's why the query_fields
list is not a child element of the matching_query.

The combination of a query string with a list of fields and field weights
resembles Elasticsearch's built-in :code:`multi_match` query. We will later see
that there are some differences in matching and scoring.

.. rst-class:: solr

Querying Solr
======================

If you followed the instructions for installing Querqy, you have configured a
Querqy query parser in your solrconfig.xml file. This query parser can be used
with a rich set of parameters. We will walk through these parameters step by
step, starting with a minimal query, which does not use any rewriter, then
adding a 'Common Rules' rewriter and finally explaining the full set of
parameters, many of them not related to query rewriting but to search relevance
tuning in general. TODO

We will not encode URL parameters in the example for better readability.

Minimal query
-------------


:code:`/solr/mycollection/select?q=notebook&defType=querqy&qf=title^3.0 brand^2.1 shortSummary`


The Querqy query parser is enabled using the :code:`defType` parameter.

As usual in Solr, the :code:`q`\  parameter defines the query for which
documents will be matched and retrieved. In most cases the value of parameter q
is just the query string as it was typed into the search box by the user. Querqy
query rewriting can add boosting information outside that query or change the
set of matching documents, for example, by adding synonyms or by deleting query
tokens.


The :code:`qf` parameter specifies in which fields to search. A field name can
have an optional field weight. In the example, the field weight for title is
3.0. The default field weight is 1.0. Field weights must be positive.

The use of the q and qf parameters resembles Solr's built-in :code:`dismax` and
:code:`edismax` query parser. We will later see that there are some differences
in how scoring works.


Where to go next
================

Could you run a simple Querqy query against your own index? - Time to create
your first rewriter!
