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

.. rubric:: Installation under Elasticsearch

* Stop Elasticsearch if it is running.
* Open a shell and :code:`cd` into your Elasticsearch directory.
* Run Elasticsearch's plugin install script:

.. code-block:: shell

  ./bin/elasticsearch-plugin install <URL>

The :code:`<URL>` depends on your Elasticsearch version. Select your version
below and we will generate the install command for you:


.. raw:: html

  <select class="es-url-select"
    onChange="setESURL(this.options[this.selectedIndex].value);">
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.5.es7140.0/querqy-elasticsearch-1.5.es7140.0.zip">Elasticsearch 7.14.0</option>


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
     "https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.5.es7140.0/querqy-elasticsearch-1.5.es7140.0.zip"




* Answer :code:`y`\es to the security related questions (Querqy needs special
  permissions to load query rewriters dynamically).
* When you start Elasticsearch, you should see an INFO log message
  :code:`loaded plugin [querqy]`.

.. raw:: html

    </div>


.. rst-class:: solr

.. raw:: html

  <div>

.. rubric:: Installation under Solr

.. include:: hint-querqy-5-solr.txt

The Querqy plugin is installed as a .jar file.

.. TODO Link to Release Notes

* Download the Querqy .jar file that matches your Solr version from the table
  below.





  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | Solr version   | Querqy version [#]_                                                                                                                                      |
  +================+==========================================================================================================================================================+
  | 8.11.x         | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.10.x         | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+  
  | 8.9.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.8.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.7.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.6.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.5.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.4.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.3.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.2.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
  +----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 8.1.x          | :download:`5.2.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/5.2.lucene810.0/querqy-solr-5.2.lucene810.0-jar-with-dependencies.jar>` |
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
