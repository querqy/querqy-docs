.. _querqy-rewriters-number-unit:

====================
Number-Unit Rewriter
====================

What it does
============

The Number-Unit Rewriter takes term combinations comprising a number and a unit and rewrites these
combinations to filter and boost queries. The precondition for configuring this rewriting for a
certain unit is a numeric field in the index containing standardized values for the respective unit.
Let's assume there is an index containing data for televisions. Furthermore, there is a field for
the screen size ``screen_size`` of the notebooks. This rewriter is now able to rewrite the query
``notebook 15 inch`` in a way that the regular matching is only done for the term ``notebook``,
whereas the terms ``15 inch`` are rewritten to range queries in order to limit the results
to a reasonable subset of notebooks with a screen size between ``12" - 18"``)
and to boost the notebooks the more the closer their price is to the searched price.


Setup
=====

This rewriter is configured using a JSON definition. The minimum required configuration is one
entry in ``numberUnitDefinitions`` with at least one unit and one field. This sparse configuration
already works as various defaults are applied.

.. code-block:: JSON
   :linenos:

   {
      "numberUnitDefinitions": [
         {
            "units": [ { "term": "inch" } ],
            "fields": [ { "fieldName": "screen_size" } ]
         }
      ]
   }

For Solr, the JSON file is put into the ZooKeeper; for Elasticsearch/OpenSearch,
the JSON is put into a string value for the property ``config``.


.. tabs::

   .. group-tab:: Elasticsearch/OpenSearch

      ``PUT  /_querqy/rewriter/numberunit``
      
      .. code-block:: JSON
        :linenos:
      
        {
            "class": "querqy.elasticsearch.rewriter.NumberUnitRewriterFactory",
            "config": {
                  "config":  "{ \"numberUnitDefinitions\": [ ... ] }"
            }
        }
      
      .. include:: hint-opensearch.txt

   .. group-tab:: Solr

      **Querqy 5**
      
      | :code:`POST /solr/mycollection/querqy/rewriter/number_unit?action=save`
      | :code:`Content-Type: application/json`
      
      .. code-block:: JSON
        :linenos:
      
        {
            "class": "querqy.solr.rewriter.numberunit.NumberUnitRewriterFactory",
            "config": {
                  "config":  "{ \"numberUnitDefinitions\": [ ... ] }"
            }
        }
      
      
      **Querqy 4**
      
      .. code-block:: xml
        :linenos:
      
        <lst name="rewriter">
          <str name="class">querqy.solr.contrib.NumberUnitRewriterFactory</str>
          <str name="config">number-unit-config.json</str>
        </lst>
      

Configuring filter queries
==========================

The range for the notebooks included in the results depends on the number-unit term combination
in the query as well as on configured percentages used to calculate range filter boundaries at
query time. For this definition, the JSON object ``filter`` is added to the
``numberUnitDefinition`` object. The ``filter`` object expects two properties,
``percentageLowerBoundary`` defining the percentage that is subtracted from the searched
number to define the lower filter range boundary and ``percentageUpperBoundary`` defining the
percentage that is added to the searched number to define the upper filter range boundary.
The default for both properties is ``20``.

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 4-9

   {
      "numberUnitDefinitions": [
         {
            "units": [ { "term": "inch" } ],
            "fields": [ { "fieldName": "screen_size" } ],
            "filter": {
               "percentageLowerBoundary": 20,
               "percentageUpperBoundary": 10
            }
         }
      ]
   }

By using this definition, number-unit part of the query ``notebook 15 inch`` is rewritten to a
filter query with a lower bound of ``15 - 3 = 12`` and an upper bound of
``15 + 1.5 = 16.5``. Consequently, all notebooks with a screen size between ``12 - 16.5 inch``
are included in the results (boundaries are inclusive).


Configuring boost queries
=========================

From a business perspective, it might be reasonable not to be too strict with filter boundaries in
order to avoid zero results for more specific queries. This is why this rewriter additionally
creates boost queries in order to help the best fitting products
to appear at the top. The boost properties are all defined in the JSON object ``boost``.

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 6-15

   {
      "numberUnitDefinitions": [
         {
            "units": [ { "term": "inch" } ],
            "fields": [ { "fieldName": "screen_size" } ],
            "boost": {
               "percentageLowerBoundary": 10,
               "percentageUpperBoundary": 10,

               "minScoreAtLowerBoundary": 20,
               "minScoreAtUpperBoundary": 20,

               "maxScoreForExactMatch": 40,
               "additionalScoreForExactMatch": 15
            },
            "filter": {
               "percentageLowerBoundary": 20,
               "percentageUpperBoundary": 10
            }
         }
      ]
   }

The properties ``percentageLowerBoundary`` and ``percentageUpperBoundary`` are calculated in the
same way like the boundaries for the filter query. The properties
``maxScoreForExactMatch`` and ``additionalScoreForExactMatch`` define
the additional score a product gets when its value exactly matches the searched value.
Furthermore, the properties ``minScoreAtLowerBoundary`` and ``minScoreAtUpperBoundary`` define
the additional score a product gets when its value matches the defined boundary.

For instance, for the query ``notebook 15 inch`` the value for ``percentageLowerBoundary`` is
``13.5`` and the value for ``percentageUpperBoundary`` is ``16.5``. This means that all products
with a screen size between these two values are boosted by a certain additional score. Products
with a value of ``13.5`` or ``16.5`` are boosted by an additional score of ``20``, whereas
products with a value of ``15`` are boosted by ``40 + 15 = 55``.

For the products being somewhere in between, linear functions are calculated using the searched
value, the boundaries and the respective score. They are applied in a way that the closer products
are to the searched value, the closer the additional score is to ``maxScoreForExactMatch``. For
this example, a linear function is created that crosses the points ``(13.5, 20)`` and
``(15, 40)``. For instance, a product with a value of ``14.0`` would be boosted approximately
by an additional score of ``27``, a product with a value of ``14.5`` by ``33``. For products between
``15`` and ``16.5`` the same is done with a linear function crossing the points ``(15, 40)`` and
``(16.5, 20)``.

The property ``additionalScoreForExactMatch`` is not used for the calculations of linear functions.
The main purpose for this property is to ensure that perfectly matching product will actually appear
at the top (there might be other boosting factors in addition).


Perfect match ranges
====================

For several contexts, it makes sense to consider a perfect match rather as a range than a comparison
of equality. For instance, a notebook with ``16 inch`` has more or less the same screen size like a
notebook with ``15.6 inch``. Consequently, a bag for notebooks with ``16 inch`` is well suitable also
for notebooks with ``15.6 inch``. This is why the rewriter supports configuring perfect matches as a
range. Products that are within this range will also benefit from the boost that is configurable via
``additionalScoreForExactMatch``.

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 13-14

   {
      "numberUnitDefinitions": [
         {
            "units": [ { "term": "inch" } ],
            "fields": [ { "fieldName": "screen_size" } ],
            "boost": {
               "percentageLowerBoundary": 10,
               "percentageUpperBoundary": 10,

               "minScoreAtLowerBoundary": 20,
               "minScoreAtUpperBoundary": 20,

               "percentageLowerBoundaryExactMatch": 5,
               "percentageUpperBoundaryExactMatch": 5,

               "maxScoreForExactMatch": 40,
               "additionalScoreForExactMatch": 15
            },
            "filter": {
               "percentageLowerBoundary": 20,
               "percentageUpperBoundary": 10
            }
         }
      ]
   }

The boundaries for these properties are calculated in the same way like the other boundaries.


Configuring multiple units
==========================
The rewriter supports searching for different units. For instance, users might not only use the unit
``inch`` for searching for screen sizes, but also use the unit ``cm``. However, the value in the index
might be standardized for the unit ``inch``, so the value in the query must be adjusted in order to
be suitable for the respective field. The adjusted value will be used for all filter and boost queries.

.. code-block:: JSON
   :linenos:

   {
      "numberUnitDefinitions": [
         {
            "units": [
               { "term": "inch", "multiplier": 1.0 },
               { "term": "cm",   "multiplier": 0.393701 }
            ],
            "fields": [ { "fieldName": "screen_size" } ]
         }
      ]
   }




Configuring the same unit multiple times
========================================

For several units, it might be unclear, which field they are related to. Users searching for ``cm`` might
either searching for a screen size or the height of something. This is why the rewriter supports
configuring the same unit multiple times. As it is not clear in query time, for what exactly a user is
searching for, the fields are combined in the filter queries using boolean ``OR``, which means the searched
number must match in one of the configured fields. For the boosting, the different boost functions are
wrapped by a max() function, which means that the highest boost is applied for the scoring.


.. code-block:: JSON
   :linenos:

   {
      "numberUnitDefinitions": [
         {
            "units": [
               { "term": "inch", "multiplier": 1.0 },
               { "term": "cm",   "multiplier": 0.393701 }
            ],
            "fields": [ { "fieldName": "screen_size" } ]
         },
         {
            "units": [
               { "term": "cm",   "multiplier": 1.0 }
            ],
            "fields": [ { "fieldName": "height" } ]
         }
      ]
   }



Multiple number-unit inputs in a query
======================================

In some edge cases, a query even might contain more than one number-unit combination, e. g.
``notebook 15 inch 1 tb``. In this case, one filter query is applied for each number-unit combination
(which means they are logically combined via boolean ``AND``) and one boost is added to the score per
number-unit combination.
