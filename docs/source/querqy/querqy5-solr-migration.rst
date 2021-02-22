.. _querqy5-solr-migration:
==============================
Migrating to Querqy 5 for Solr
==============================

Querqy 5 for Solr comes with a number of changes that are incompatible with
earlier Querqy versions.

We normally avoid large breaking changes but when we started to implement a way
to deploy rewriter configurations without having to reload the Solr collection,
it soon became clear that the change would be bigger and incompatible with the
previous version this time. And as we had to introduce breaking changes anyway,
we used the opportunity and renamed some components and changed part of the Java
package structure - hopefully for greater simplicity and clarity.

Changes
=======

Enabling Querqy in :code:`solrconfig.xml`
-----------------------------------------

.. code-block:: xml
   :linenos:

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

Querqy now needs an additional :code:`requestHandler` in the configuration
(line #4). In addition, the name of the QParserPlugin class has changed from
:code:`querqy.solr.DefaultQuerqyDismaxQParserPlugin` to
:code:`querqy.solr.QuerqyDismaxQParserPlugin` (#9). The :code:`searchComponent`
configuration remains unchanged.


Configuring and using rewriters
-------------------------------

In Querqy 4, rewriters used to be configured as child elements of the
QParserPlugin in ``solrconfig.xml``. Additional artefacts, like the ``rules.txt``
file for the Common Rules Rewriter were kept separately in ZooKeeper (SolrCloud)
or in the configuration directory (standalone). In Querqy 5, rewriters are
managed via an HTTP API. That's what the new :code:`requestHandler` is for. The
new API is documented :ref:`here <configuring-and-applying-a-rewriter>`.

This change also means that rewriters no longer have a dependency on additional
artefacts. The :code:`rules.txt` of the Common Rules Rewriter no longer exists,
the rules are part of the rewriter configuration.

To make using the new rewriter API easy to use, we provide a configuration
request builder for most rewriters for SolrJ. Look out for classes named
:code:`*ConfigRequestBuilder` in the rewriter packages. For example, the
:code:`querqy.solr.rewriter.commonrules.CommonRulesConfigRequestBuilder` can
read the rules from a :code:`rules.txt` file.

As the rewriter configuration is no longer pre-defined in
:code:`solrconfig.xml`, the previously static rewrite chain is replaced with a
flexible rewrite chain that is to be specified per request parameter
(see :ref:`here <configuring-and-applying-a-rewriter>` for further
documentation):

.. code-block::

  querqy.rewriters=<rewriterId1>,<rewriterId2>


We recognise that search teams will need time to adapt their applications to
this new way of deploying rewriter configurations. To facilitate a stepwise
transition to Querqy 5, we provide a way to configure a static rewrite chain in
:code:`solrconfig.xml`:

.. code-block:: xml
   :linenos:

   <query>
     <listener event="firstSearcher" class="querqy.solr.ClassicRewriteChainLoader">
       <lst name="rewriteChain">
         <lst name="rewriter">
           <str name="id">common_rules</str>
           <str name="class">querqy.solr.rewriter.commonrules.CommonRulesRewriterFactory</str>
           <str name="rules">rules.txt</str>
           <bool name="ignoreCase">true</bool>
           <str name="querqyParser">querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory</str>
         </lst>
         <lst name="rewriter">
           <str name="id">replace</str>
           <str name="class">...</str>
           <!-- ... -->
         </lst>
       </lst>
     </listener>
   </query>


While the definition of the :code:`rewriteChain` (lines #3-11) looks the same
like in Querqy 4, this XML element must now be configured under a search
listener (#2). Note that if you use Querqy's :ref:`term query cache <querqy-term-query-cache>`, the
ClassicRewriteChainLoader must be configured before the listener that preloads
terms into that cache. To update a rewriter configuration or an artefact
('rules.txt') you will have to reload the collection (SolrCloud) or the core
(standalone Solr) and cannot use the rewriter API.

You will need to select rewriters per request by passing the rewriter ids in the
:code:`querqy.rewriters` parameter (for example,
:code:`querqy.rewriters=replace,common_rules` for the above configuration).

Configuring the rewrite chain in :code:`solrconfig.xml` is deprecated and will
be removed as part of the first Querqy release in 2022.

Renaming of rewriters
---------------------

We have renamed some rewriters and put almost all of them each into its own
Java package (packages under `querqy.solr.rewriter`). Most notably the
:code:`querqy.solr.SimpleCommonRulesRewriterFactory` is now named
:code:`querqy.solr.rewriter.commonrules.CommonRulesRewriterFactory`. Please see
the individual rewriter documentation for the new class name.
