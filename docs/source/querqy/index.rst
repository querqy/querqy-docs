.. _querqy-index:

===========================
Getting started with Querqy
===========================

Querqy is a query rewriting framework for Java-based search engines. It is
probably best-known for its rule-based query rewriting, which applies synonyms,
query dependent filters, boostings and demoting of documents. This rule-based
query rewriting is implemented in the 'Common Rules Rewriter', but Querqy's
capabilities go far beyond this rewriter.

You might want to ...

* start with the `installation`_,
* check out the :ref:`Common Rules Rewriter <querqy-rewriters-common-rules>`...
* ... and even :ref:`more rewriters <querqy-list-of-rewriters>`,
* learn more about Querqy's search relevance tuning capabilities using
  :ref:`request parameters <querqy-more-about-queries>` independent of rewriters

.. _querqy-installation:

Installation
============


.. include:: se-section.txt


.. rst-class:: elasticsearch

.. raw:: html

  <div>

.. rubric:: Installation under Elasticsearch/OpenSearch

* Stop Elasticsearch/OpenSearch if it is running.
* Open a shell and :code:`cd` into your Elasticsearch/OpenSearch directory.
* Run Elasticsearch/OpenSearch's plugin install script:

.. code-block:: shell

  ./bin/elasticsearch-plugin install <URL>

Or

.. code-block:: shell

  ./bin/opensearch-plugin install <URL>

The :code:`<URL>` depends on your search engine version:

Elasticsearch
..............

Select your version below and we will generate the install command for you:


.. raw:: html

  <select class="es-url-select"
    onChange="setESURL(this.options[this.selectedIndex].value);">
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es852.0/querqy-elasticsearch-1.6.es852.0.zip">Elasticsearch 8.5.2</option>
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es843.0/querqy-elasticsearch-1.6.es843.0.zip">8.4.3</option>
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es841.0/querqy-elasticsearch-1.6.es841.0.zip">8.4.1</option>
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es833.0/querqy-elasticsearch-1.6.es833.0.zip">8.3.3</option>
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es823.0/querqy-elasticsearch-1.6.es823.0.zip">8.2.3</option>
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es813.0/querqy-elasticsearch-1.6.es813.0.zip">8.1.3</option>
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es801.0/querqy-elasticsearch-1.6.es801.0.zip">8.0.1</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.5.es7172.0/querqy-elasticsearch-1.5.es7172.0.zip">7.17.2</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.5.es7162.0/querqy-elasticsearch-1.5.es7162.0.zip">7.16.2</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.5.es7140.0/querqy-elasticsearch-1.5.es7140.0.zip">7.14.0</option>


    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es7134.0/querqy-elasticsearch-1.4.es7134.0.zip">7.13.4</option>


    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es7121.1/querqy-elasticsearch-1.4.es7121.1.zip">7.12.1</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es7112.2/querqy-elasticsearch-1.4.es7112.2.zip">7.11.2</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es7102.1/querqy-elasticsearch-1.4.es7102.1.zip">7.10.2</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es793.1/querqy-elasticsearch-1.4.es793.1.zip">7.9.3</option>


    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es781.1/querqy-elasticsearch-1.4.es781.1.zip">7.8.1</option>


    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es771.1/querqy-elasticsearch-1.4.es771.1.zip">7.7.1</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es762.1/querqy-elasticsearch-1.4.es762.1.zip">7.6.2</option>


    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es752.1/querqy-elasticsearch-1.4.es752.1.zip">7.5.2</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es742.1/querqy-elasticsearch-1.4.es742.1.zip">7.4.2</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es732.1/querqy-elasticsearch-1.4.es732.1.zip">7.3.2</option>


    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.4.es721.1/querqy-elasticsearch-1.4.es721.1.zip">7.2.1</option>


    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.0.es711.0/querqy-elasticsearch-1.0.es711.0.zip">7.1.1 (deprecated)</option>

    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.0.es701.0/querqy-elasticsearch-1.0.es701.0.zip">7.0.1 (deprecated)</option>

  </select>
 <br/><br/>


.. rst-class:: elasticsearch-version


.. code-block:: shell


  ./bin/elasticsearch-plugin install \
     "https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es852.0/querqy-elasticsearch-1.6.es852.0.zip"


OpenSearch
..........

Querqy is available for OpenSearch 2.3.0.

.. code-block:: shell


  ./bin/opensearch-plugin install \
     "https://repo1.maven.org/maven2/org/querqy/opensearch-querqy/1.0.os2.3.0/opensearch-querqy-1.0.os2.3.0.zip"

* Answer :code:`y`\es to the security related questions (Querqy needs special
  permissions to load query rewriters dynamically).
* When you start Elasticsearch/OpenSearch, you should see an INFO log message
  :code:`loaded plugin [querqy]`.

.. raw:: html

    </div>


.. rst-class:: solr

.. raw:: html

  <div>

.. rubric:: Installation under Solr

The Querqy plugin is installed as a .jar file.

.. warning:: When upgrading your Querqy version, please make sure to read the
   :doc:`release notes! <release-notes>`!

* Download the Querqy .jar file that matches your Solr version from the table
  below.


  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | Solr version   | Querqy version [#]_                                                                                                                                      |
  +================+==========================================================================================================================================================+
  | 9.1.0          | :download:`5.5.lucene900.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.5.lucene900.1/querqy-solr-5.5.lucene900.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 9.0.0          | :download:`5.5.lucene900.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.5.lucene900.1/querqy-solr-5.5.lucene900.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.11.x         | :download:`5.5.lucene811.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.5.lucene811.1/querqy-solr-5.5.lucene811.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.10.x         | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.9.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.8.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.7.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.6.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.5.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.4.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.3.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.2.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.1.x          | :download:`5.4.lucene810.1<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.4.lucene810.1/querqy-solr-5.4.lucene810.1-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.0.x          | :download:`5.2.lucene800.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene800.0/querqy-solr-5.2.lucene800.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 7.7.x          | :download:`5.2.lucene720.2<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene720.0/querqy-solr-5.2.lucene720.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 7.6.x          | :download:`5.2.lucene720.2<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene720.0/querqy-solr-5.2.lucene720.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 7.5.x          | :download:`5.2.lucene720.2<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene720.0/querqy-solr-5.2.lucene720.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 7.4.x          | :download:`5.2.lucene720.2<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene720.0/querqy-solr-5.2.lucene720.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 7.3.x          | :download:`5.2.lucene720.2<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene720.0/querqy-solr-5.2.lucene720.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 7.2.x          | :download:`5.2.lucene720.2<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene720.0/querqy-solr-5.2.lucene720.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+

  .. [#] For older Solr versions, please see `here <https://github.com/querqy/querqy/wiki/Older-Querqy-versions>`_.

  You can also browse the `Central Maven Repository`_ and pick
  `jar-with-dependencies` from the Downloads dropdown of the corresponding
  Querqy version.

* Put the .jar file into `Solr's lib folder`_.
* Add the Querqy request handler (Querqy 5 only), the Querqy query parser and
  the Querqy query component to your ``solrconfig.xml`` file:

**Querqy 5**

.. code-block:: xml

 <!--
    Add the Querqy request handler.
 -->
 <requestHandler name="/querqy/rewriter" class="querqy.solr.QuerqyRewriterRequestHandler" />

 <!--
     Add the Querqy query parser.
 -->
 <queryParser name="querqy" class="querqy.solr.QuerqyDismaxQParserPlugin"/>

 <!--
    Override the default QueryComponent.
 -->
 <searchComponent name="query" class="querqy.solr.QuerqyQueryComponent"/>

**Querqy 4**

.. code-block:: xml

  <!--
      Add the Querqy query parser.
  -->
  <queryParser name="querqy" class="querqy.solr.DefaultQuerqyDismaxQParserPlugin"/>

  <!--
     Override the default QueryComponent.
  -->
  <searchComponent name="query" class="querqy.solr.QuerqyQueryComponent"/>


.. _`Solr's lib folder`: https://cwiki.apache.org/confluence/display/solr/Lib+Directives+in+SolrConfig
.. _`Central Maven Repository`: https://search.maven.org/artifact/org.querqy/querqy-solr

.. raw:: html

  </div>

.. _querqy-making-queries:

Making queries using Querqy
===========================

.. include:: se-section.txt

.. rst-class:: elasticsearch


.. raw:: html

 <div>

Querqy defines its own query builder which can be executed with a rich set of
parameters. We will walk through these parameters step by step, starting with a
minimal query, which does not use any rewriter, then adding a 'Common Rules
Rewriter' and finally explaining the full set of parameters, many of them not
related to query rewriting but to search relevance tuning in general.


.. rubric:: Minimal Query

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


.. rubric:: Querqy inside the known Elasticsearch Query DSL

The following example shows, how easy it is to replace a Elasticsearch query type like :code:`multi_match` with a Querqy :code:`matching_query`, so you can profit from Querqy's rewriters.
Let's say you have an index that contains forum posts and want to find a certain post in the topic "hobby", that was made 10-12 days ago and was about "fishing".

A simple `Boolean query <https://www.elastic.co/guide/en/elasticsearch/reference/master/query-dsl-bool-query.html>`__ with a :code:`multi_match` and a :code:`match` query inside the :code:`must` occurrence and a :code:`range` query in the :code:`filter` occurrence should do the trick.

:code:`POST /index/_search`

.. code-block:: JSON
   :linenos:

    {
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "topic": "hobby"
              }
            },
            {
              "multi_match": {
                "query": "fishing",
                "fields": ["title", "content"]
              }
            }
          ],
          "filter": [
            {
              "range": {
                "dateField": {
                  "gte": "now-12d",
                  "lte": "now-10d"
                }
              }
            }
          ]
        }
      }
    }


To use the :code:`matching_query` from the :code:`querqy` query builder, your request would look like this:

:code:`POST /myindex/_search`

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 11

    {
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "topic": "hobby"
              }
            },
            {
              "querqy": {
                "matching_query": {
                  "query": "fishing"
                },
                "query_fields": ["title", "content"],
                "rewriters": ["my_replace_rewriter", "my_common_rules"]
              }
            }
          ],
          "filter": [
            {
              "range": {
                "dateField": {
                  "gte": "now-12d",
                  "lte": "now-10d"
                }
              }
            }
          ]
        }
      }
    }



As you can see, to use a :code:`matching_query` instead of a :code:`multi_match` you need to use :code:`querqy` (line #11) as a "wrapper" for the :code:`matching_query`.

.. raw:: html

 </div>

.. rst-class:: solr

.. raw:: html

 <div>

If you followed the instructions for installing Querqy, you have configured a
Querqy query parser in your solrconfig.xml file. This query parser can be used
with a rich set of parameters. We will walk through these parameters step by
step, starting with a minimal query, which does not use any rewriter, then
adding a 'Common Rules Rewriter' and finally explaining the full set of
parameters, many of them not related to query rewriting but to search relevance
tuning in general.

We will not encode URL parameters in the example for better readability.

.. rubric:: Minimal Query


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
:code:`edismax` query parsers. We will later see that there are some differences
in how scoring works.

.. raw:: html

 </div>

Where to go next
================

* Learn how to :doc:`configure a rewriter <rewriters>`
* If you cannot wait to see rules for synonyms, boostings and filters, jump
  directly to the :ref:`Common Rules Rewriter <querqy-rewriters-common-rules>`!
* Lean more about tuning search relevance with query parameters and see the
  :ref:`complete list of parameters <querqy-more-about-queries>` .
