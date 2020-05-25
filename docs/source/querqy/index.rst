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
* lean more about Querqy's search relevance tuning capabilities beyond rewriters
  (TODO)


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
    <option value="https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.1.es760.0/querqy-elasticsearch-1.1.es760.0.zip">Elasticsearch 7.6.0</option>

    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es752.0/querqy-elasticsearch-1.0.es752.0.zip">7.5.2</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es751.0/querqy-elasticsearch-1.0.es751.0.zip">7.5.1</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es750.0/querqy-elasticsearch-1.0.es750.0.zip">7.5.0</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es742.0/querqy-elasticsearch-1.0.es742.0.zip">7.4.2</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es741.0/querqy-elasticsearch-1.0.es741.0.zip">7.4.1</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es740.0/querqy-elasticsearch-1.0.es740.0.zip">7.4.0</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es732.0/querqy-elasticsearch-1.0.es732.0.zip">7.3.2</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es731.0/querqy-elasticsearch-1.0.es731.0.zip">7.3.1</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es730.0/querqy-elasticsearch-1.0.es730.0.zip">7.3.0</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es721.0/querqy-elasticsearch-1.0.es721.0.zip">7.2.1</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es720.0/querqy-elasticsearch-1.0.es720.0.zip">7.2.0</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es711.0/querqy-elasticsearch-1.0.es711.0.zip">7.1.1</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es710.0/querqy-elasticsearch-1.0.es710.0.zip">7.1.0</option>
    <option value="https://dl.bintray.com/renekrie/maven/querqy/querqy-elasticsearch/1.0.es701.0/querqy-elasticsearch-1.0.es701.0.zip">7.0.1</option>

  </select>
 <br/><br/>


.. rst-class:: elasticsearch-version


.. code-block:: shell


  ./bin/elasticsearch-plugin install \
     "https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.1.es760.0/querqy-elasticsearch-1.1.es760.0.zip"




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

The Querqy plugin is installed as a .jar file.

.. TODO Link to Release Notes

* Download the Querqy .jar file that matches your Solr version from the table
  below.

  You can also browse the `Central Maven Repository`_
  and pick `jar-with-dependencies` from the Downloads dropdown of the
  corresponding Querqy version.



+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Solr version   | Querqy version [#]_                                                                                                                                      |
+================+==========================================================================================================================================================+
| 8.5.x          | :download:`4.8.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene810.0/querqy-solr-4.8.lucene810.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 8.3.x          | :download:`4.8.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene810.0/querqy-solr-4.8.lucene810.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 8.2.x          | :download:`4.8.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene810.0/querqy-solr-4.8.lucene810.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 8.1.x          | :download:`4.8.lucene810.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene810.0/querqy-solr-4.8.lucene810.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 8.0.x          | :download:`4.8.lucene800.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene800.0/querqy-solr-4.8.lucene800.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 7.7.x          | :download:`4.8.lucene720.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene720.0/querqy-solr-4.8.lucene720.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 7.6.x          | :download:`4.8.lucene720.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene720.0/querqy-solr-4.8.lucene720.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 7.5.x          | :download:`4.8.lucene720.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene720.0/querqy-solr-4.8.lucene720.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 7.4.x          | :download:`4.8.lucene720.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene720.0/querqy-solr-4.8.lucene720.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 7.3.x          | :download:`4.8.lucene720.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene720.0/querqy-solr-4.8.lucene720.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| 7.2.x          | :download:`4.8.lucene720.0<https://repo1.maven.org/maven2/org/querqy/querqy-solr/4.8.lucene720.0/querqy-solr-4.8.lucene720.0-jar-with-dependencies.jar>` |
+----------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+

.. [#] For older Solr versions, please see `here <https://github.com/querqy/querqy/wiki/Older-Querqy-versions>`_.


* Put the .jar file into `Solr's lib folder`_.
* Add the Querqy query parser and the Querqy query component to your
  :code:`solrconfig.xml` file:

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


Where to go next
================

* Learn how to run a simple search query using Querqy (recommended).
* If you cannot wait to see query rewriting in action, you can jump directly to
  the rewriter section.




.. TODO jump to search relevance params
