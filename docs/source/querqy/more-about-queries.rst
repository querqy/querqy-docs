==================
More about queries
==================

.. include:: se-section.txt

In 'Getting started with Querqy' we showed how to build
:ref:`a minimal query <querqy-making-queries>` with Querqy:

.. rst-class:: elasticsearch

.. raw:: html

 <div>

:code:`POST /myindex/_search`

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 3,5,7

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




All we had to do was to use a ``querqy`` query (line #3), define a query string
for matching (#5) and specify which fields to query (#7).

.. raw:: html

 </div>

.. rst-class:: solr

.. raw:: html

  <div>

:code:`/solr/mycollection/select?q=notebook&defType=querqy&qf=title^3.0 brand^2.1 shortSummary`


All we had to do was to use the Querqy query parser (``defType=querqy``),
define a query string for matching (``q=...``) and specify which fields to query
(``qf=...``).

.. raw:: html

 </div>

Querqy has many more query parameters. We will introduce a few underlying
concepts before we explain them in the Reference section.

The **matching query** is the query that defines the members of the search
result set. Only documents that match this query will make it into the search
result.

Its pendant is a **boosting query**. A boosting query is has no influence on
search result membership but it influences the search result scoring. The score
of documents that match a boosting query will be changed. Depending on the
purpose of the boosting, the matching documents will either be moved further to
the top or to the bottom of the search result list. There can be more than one
boosting query in a single search request.

Query rewriting can manipulate queries by adding or removing query terms or
entire subqueries. For example, if a rewriter adds a synonym it will add one
or more terms to the matching query. If it adds an UP or DOWN boost, it will add
boosting queries. We will say that these additional terms are **generated**.

Manipulating the matching query not only influences which documents are included
in the search results but also the scoring will be impacted, regardless of
boosting queries. The result set can be narrowed down further by **filter
queries** that are *generated* by a rewriter.


Reference
=========

.. include:: se-section.txt

.. rst-class:: elasticsearch

.. raw:: html

 <div>

:code:`POST /myindex/_search`

.. code-block:: JSON
   :linenos:

   {
      "query": {

          "querqy": {

              "matching_query": {
                  "query": "notebook",
                  "similarity_scoring": "dfc",
                  "weight": 0.75
              },

              "query_fields": [
                  "title^3.0", "brand^2.1", "shortSummary"
              ],

              "minimum_should_match": "100%",
              "tie_breaker": 0.01,
              "field_boost_model": "prms",

              "rewriters": [
                  "word_break",
                  {
                      "name": "common_rules",
                      "params": {
                          "criteria": {
                              "filter": "$[?(!@.prio || @.prio == 1)]"
                          }
                      }
                  }
              ],

              "boosting_queries": {
                  "rewritten_queries": {
                      "use_field_boost": false,
                      "similarity_scoring": "off",
                      "positive_query_weight": 1.2,
                      "negative_query_weight": 2.0
                  },
                  "phrase_boosts": {
                      "full": {
                          "fields": ["title", "brand^4"],
                          "slop": 2
                      },
                      "bigram": {
                          "fields": ["title"],
                          "slop": 3
                      },
                      "trigram": {
                          "fields": ["title", "brand", "shortSummary"],
                          "slop": 6
                      },
                      "tie_breaker": 0.5
                  }
              },

              "generated" : {
                  "query_fields": [
                      "title^2.0", "brand^1.5", "shortSummary^0.0007"
                  ],
                  "field_boost_factor": 0.8
              }

          }
      }
   }




.. rubric:: Global parameters and matching query


minimum_should_match
  *The minimum number of query clauses that must match for a document to be
  returned.* (Copied from Elasticsearch's `match query documentation <https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html>`_,
  which also see for valid parameter values).

  The minimum number of query clauses is counted across fields. For example,
  if the query ``a b`` is searched in ``"query_fields":["f1", "f2"]`` with
  ``"minimum_should_match":"100%"``, the two terms need not match in the same
  field so that a document matching ``f1:a`` and ``f2:b`` will be included in
  the result set.

  Default: ``1``

tie_breaker
  When a query term ``a`` is searched across fields (``f1``, ``f2`` and ``f3``),
  the query is expanded into term queries (``f1:a``, ``f2:a``, ``f3:a``). The
  expanded query will use as its own score the score of the highest scoring term
  query plus the sum of the scores of the other term queries multiplied with
  ``tie_breaker``. Let's assume that ``f2:a`` produces the highest score, the
  resulting score will be
  ``score(f2:a) + tie_breaker * (score(f1:a) + score(f3:a))``.

  Default: ``0.0``

field_boost_model
  Values: ``fixed`` ``prms``

  Querqy allows to choose between two approaches for field boosting in scoring:

  * ``fixed``: field boosts are specified at field names in 'query_fields'.
    The same field weight will be used across all query terms for a given query
    field.
  * ``prms``: field boosts are derived from the distribution of the query terms
    in the index. More specifically, they are derived from the probability that
    a given query term occurs in a given field in the index. For example, given
    the query 'apple iphone black' with query fields 'brand', 'category' and
    'color', the term 'apple' will in most data sets have a greater probability
    and weight for the 'brand' field compared to 'category' and 'color', whereas
    'black' will have the greatest probability in the 'color' field. [#]_

    Field weights specified in 'query_fields' will be ignored if
    'field_boost_model' is set to 'prms'.

  Default: ``fixed``

matching_query.similarity_scoring
  Values: ``dfc`` ``on`` ``off``

  Controls how Lucene's scoring implementation (= *similarity*) is used when an
  input query term is expanded across fields and when it is expanded during
  query rewriting:

  * ``dfc``: 'document frequency correction' - use the same document frequency
    value for all terms that are derived from the same input query term. For
    example, let 'a b' be the input query and let it be rewritten to
    '(f1:a \| f2:a \| ((f1:x \| f2:x) \| (f1:y \| f2:x)) (f1:b \| f2:b)` by
    synonym and field expansion, then
    '(f1:a \| f2:a \| ((f1:x \| f2:x) \| (f1:y \| f2:x))' (all derived from 'a')
    will use the same document frequency value. More specifically, Querqy will
    use the maximum document frequency of these terms as the document frequency
    value for all of them. Similarily, the maximum  document frequency of
    '(f1:b | f2:b)' will be used for these two terms.
  * ``off``: Ignore the output of Lucene's similarity scoring. Only field boosts
    will be used for scoring.
  * ``on``: Use Lucene's similarity scoring output. Note that field
    boosting (normally part of Lucene similarity scoring) is handled outside
    the similarity in Querqy and it can be configured using the
    'field_boost_model' parameter.

  Default: ``dfc``

matching_query.weight
  A weight that is multiplied with the score that is produced by the matching
  query before the score of the boosting queries is added.

  Default value: ``1.0``

.. rubric::  Boosting queries

boosting_queries
  Controls sub-queries that do not influence the matching of documents but
  contribute to the score of documents that are retrieved by the
  'matching_query'. A 'querqy' query allows to control two main types of
  boosting queries:

  #. ``rewritten_queries`` - boost queries that are produced as part of query
     rewriting
  #. ``phrase_boosts`` - (partial) phrases that are derived from the query
     string for boosting documents that contain corresponding phrase matches

  Scores from both types of boosting queries will be *added* to the score of the
  'matching_query'.

boosting_queries.rewritten_queries.use_field_boost
  If ``true``, the scores of the boost queries will include field weights. A
  field boost of ``1.0`` will be used otherwise.

  Default: ``true``


boosting_queries.rewritten_queries.similarity_scoring
  Values: ``dfc`` ``on`` ``off``

  Controls how Lucene's scoring implementation (= *similarity*) is used when the
  boosting query is expanded across fields.

  * ``dfc``: 'document frequency correction' - use the same document frequency
    (df) value for all term queries that are produced from the same boost
    term. Querqy will use the maximum document frequency of the produced terms
    as the df value for all of them. If the 'matching_query' also uses
    'similarity_scoring=dfc', the maximum (df) of the matching query will be
    added to the df of the boosting query terms in order to put the (dfs) of
    the two query parts on a comparable scale and to avoid giving extremely
    high weight to very sparse boost terms.
  * ``off``: Ignore the output of Lucene's similarity scoring.
  * ``on``: Use Lucene's similarity scoring output.

  Default: ``dfc``

boosting_queries.rewritten_queries.positive_query_weight / .negative_query_weight`
  Query rewriting in Querqy can produce boost queries that either promote
  matching documents to the top of the search result (positive boost) or that
  push matching documents to the bottom of the search result list (negative
  boost).

  Scores of positive boost queries are multiplied with 'positive_query_weight'.
  Scores of negative boost queries are multiplied with `negative_query_weight`.
  Both weights must be positive decimal numbers. Note that increasing the value
  of 'negative_query_weight' means to demote matching documents more strongly.

  Default: ``1.0``


.. [#] This approach follows the ideas described in: J. Kim & W.B. Croft: *A Probabilistic Retrieval Model for Semi-structured Data*, 2009.

.. raw:: html

  </div>
