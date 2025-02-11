
==================================
Advanced Solr plugin configuration
==================================

.. include:: hint-querqy-5-solr.txt


In the `installation <querqy-installation>`_ section you have already seen how
to set up the Querqy query parser and the Querqy query component in
``solrconfig.xml``:

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

This section will explain additional configuration options:

* Define how to deal with undefined rewriters in the rewrite chain (Querqy 5)
* The term query cache that avoids building Lucene queries for sub-queries
  created in query rewriting that never match in specific fields
* The info logging for query rewriters
* The parser for the user query string
* Changing the rewriter request handler path (Querqy 5)
* Configuring how rewriter definitions are stored in ZooKeeper

.. _querqy-unknown-rewriters:

Dealing with undefined rewriters in the rewrite chain (Querqy 5)
----------------------------------------------------------------

In Querqy 5 the rewriter chain is passed as a list of rewriter IDs in a request
parameter:

:code:`querqy.rewriters=rewriter1,rewriter2`

where each rewriter ID references a previously defined rewriter configuration.
You can use the :code:`skipUnknownRewriters` property of the query parser plugin
to define what should happen if no rewriter configuration can be found for a
given rewriter ID that was passed in :code:`querqy.rewriters`:

.. code-block:: xml
   :linenos:
   :emphasize-lines: 2

   <queryParser name="querqy" class="querqy.solr.QuerqyDismaxQParserPlugin">
     <bool name="skipUnknownRewriters">true</bool>
   </queryParser>

If 'skipUnknownRewriters' is set to :code:`true`, the missing rewriter is ignored
and the rewrite chain will be processed as if this rewriter weren't part of it.
A warning will be issued to the log file. If it is set to :code:`false`,
Solr will reply with a '400 Bad Request' response, which is also the default
behaviour when the 'skipUnknownRewriters' is not configured.


.. _querqy-term-query-cache:

Term query cache
----------------

When you configure rewriting rules in Querqy's 'Common Rules Rewriter', in most
cases you will not specify field names on the right-hand sides. For example, you
would use a synonym rule to say that if the user enters a query 'personal
computer', Solr should also search for 'pc' and Querqy would automatically
create field-specific queries like 'name:pc', 'description:pc', 'color:pc' etc.
for the right-hand side of the synonym rule.

On the other hand, it is very unlikely that an input term would have matches in
all fields that are given in the 'gqf'/'qf' parameters. In the example, it is
very unlikely that there would be a document having the term 'pc' in the 'color'
field.

You can configure Querqy to check on startup/core reloading/commit (= when
opening a searcher) whether the terms on the right-hand side of the rules have
matches in the query fields and cache this information. If there is no document
matching the right-hand side term in a given field, the field-specific query
will not be executed again until Solr opens a new searcher. Caching this
information can speed up Querqy considerably, especially if there are many query
fields.

Version-independent cache configuration (solrconfig.xml):

.. code-block:: xml

   <query>
     <!-- Place a custom cache in the <query> section: -->
     <cache name="querqyTermQueryCache"
            class="solr.LFUCache"
            size="1024"
            initialSize="1024"
            autowarmCount="0"
            regenerator="solr.NoOpRegenerator"
     />

     <!--
       A preloader for the cache, called when Solr is started up or when
       the core is reloaded.
     -->
     <listener event="firstSearcher" class="querqy.solr.TermQueryCachePreloader">
       <!--
         The fields for which Querqy pre-checks and caches whether the
         right-hand side terms match. Normally the same set of fields like
         in qf/gqf but you could omit fields that are very quick to query.
       -->
       <str name="fields">f1 f2</str>

       <!-- The name of the configered Querqy QParserPlugin -->
       <str name="qParserPlugin">querqy</str>

       <!-- The name of the custom cache -->
       <str name="cacheName">querqyTermQueryCache</str>

       <!--
         If false, the preloader would not test for matches of the right-hand side
         terms but only cache the rewritten (text-analysed) query. This can already
         save query time if there are many query fields and if the rewritten query
         is very complex. You would normally set this to 'true' to completely avoid
         executing non-matching term queries later.
       -->
       <bool name="testForHits">true</bool>
     </listener>

     <!--
       Same preloader as above but listening to 'newSearcher' events (for example,
       commits with openSearcher=true)
     -->
     <listener event="newSearcher" class="querqy.solr.TermQueryCachePreloader">
        <str name="fields">f1 f2</str>
        <str name="qParserPlugin">querqy</str>
        <str name="cacheName">querqyTermQueryCache</str>
        <bool name="testForHits">true</bool>
     </listener>


   </query>


  <queryParser name="querqy" class="...">
    <!-- See below for Querqy version specific configuration -->
  </queryParser>



Please see below for additional configuration for your Querqy version.

**Querqy 5**

.. code-block:: xml

 <!-- Tell the Querqy query parser to use the custom cache: -->
 <queryParser name="querqy" class="querqy.solr.QuerqyDismaxQParserPlugin">

  <!--
       A reference to the custom cache. It must match the
       cache name that you have used in the cache definition.
  -->
  <str name="termQueryCache.name">querqyTermQueryCache</str>


  <!--
     If true, the cache will be updated after preloading for terms
     from all user queries, including those that were not rewritten.
     In most cases this should be set to 'false' in order to make sure
     that the information for the right-hand side terms of your rewrite rules
     is never evicted from the cache.
  -->
  <bool name="termQueryCache.update">false</bool>

 </queryParser>

If you `changed the request handler name <#changing-the-name-of-the-rewriter-request-handler-querqy-5>`_ of the
:code:`querqy.solr.QuerqyRewriterRequestHandler`, you will have to set this name
at the :code:`querqy.solr.TermQueryCachePreloader` (line #9):

.. code-block:: xml
   :linenos:

   <requestHandler name="/some/othername" class="querqy.solr.QuerqyRewriterRequestHandler" />

   <query>
      <listener event="newSearcher" class="querqy.solr.TermQueryCachePreloader">
          <str name="fields">f1 f2</str>
          <str name="qParserPlugin">querqy</str>
          <str name="cacheName">querqyTermQueryCache</str>
          <bool name="testForHits">true</bool>
          <str name="rewriterRequestHandler">/some/othername</str>
      </listener>
   </query>


**Querqy 4**

.. code-block:: xml

 <!-- Tell the Querqy query parser to use the custom cache: -->
 <queryParser name="querqy" class="querqy.solr.DefaultQuerqyDismaxQParserPlugin">

    <!--
       A reference to the custom cache. It must match the
       cache name that you have used in the cache definition.
    -->
    <str name="termQueryCache.name">querqyTermQueryCache</str>


    <!--
     If true, the cache will be updated after preloading for terms
     from all user queries, including those that were not rewritten.
     In most cases this should be set to 'false' in order to make sure
     that the information for the right-hand side terms of your rewrite rules
     is never evicted from the cache.
    -->
    <bool name="termQueryCache.update">false</bool>

    <lst name="rewriteChain">
      <!-- ... -->
    </lst>

 </queryParser>


.. _solr-query-string-parser:

The query string parser
-----------------------

The query string parser defines how the query string that is passed in request
parameter ``q`` is parsed into Querqy's internal query object model before
rewriting the query and before turning it into a Lucene query.

It can be set using an element with name ``parser`` in the configuration:[1]_

.. code-block:: xml

  <queryParser name="querqy" class="...">

    <str name="parser">querqy.parser.WhiteSpaceQuerqyParser</str>

    <!-- ... -->

  </querqyParser>

The parser defines how the input is interpreted. The default parser, the
``WhiteSpaceQuerqyParser`` provides only a very minimal syntax:

* Query tokens are delimited by whitespace
* Tokens can be prefixed a ``-``\ (token must not occur in matches) or a ``+``\
  (token must occur in matches)

This syntax should be sufficient for most use cases, especially for e-commerce
search. Note that this query parser has no option to express field names. You
can configure a ``querqy.parser.FieldAwareWhiteSpaceQuerqyParser`` to allow for
field names. However, this can reduce the applicability of query rewriters
considerably.

You can implement your own query parser by implementing the
``querqy.parser.QuerqyParser`` interface. If your query parser needs more
configuration options, you can provide it using a factory:[1]_

.. code-block:: xml

   <queryParser name="querqy" class="...">

     <lst name="parser">
       <str name="factory">querqy.solr.MyQuerqyParserFactory</str>
       <str name="myConfProperty1">value 1</str>
       <int name="myConfProperty2">2</int>
     </lst>

     <!-- ... -->
   </querqyParser>

The factory must implement ``querqy.solr.SolrQuerqyParserFactory``. It will
receive the configuration properties ('myConfProperty1'/'myConfProperty2') in a
map parsed to its init method. Note that
``SolrQuerqyParserFactory.createParser()`` is called per request implying that
QuerqyParsers are allowed to be stateful.

Changing the name of the rewriter request handler (Querqy 5)
------------------------------------------------------------

The rewriter request handler is normally configured for the path
:code:`/querqy/rewriter`:

.. code-block:: xml

  <requestHandler name="/querqy/rewriter" class="querqy.solr.QuerqyRewriterRequestHandler" />

This means that Querqy manages rewriters under a URL path
:code:`/solr/mycollection/querqy/rewriter` and you normally should not need to
change this path. Should you ever have to change it, you will need to change the
:code:`name` attribute of the rewriter:

.. code-block:: xml

   <requestHandler name="/my/rewriter-path" class="querqy.solr.QuerqyRewriterRequestHandler" />

... point the query parser to it:

.. code-block:: xml
   :linenos:
   :emphasize-lines: 2

   <queryParser name="querqy" class="querqy.solr.QuerqyDismaxQParserPlugin">
     <str name="rewriterRequestHandler">/my/rewriter-path</str>
   </queryParser>

... and, if you use term query cache preloading, let the
'TermQueryCachePreloader' know about it:

.. code-block:: xml
   :linenos:
   :emphasize-lines: 4

    <query>
      <listener event="newSearcher" class="querqy.solr.TermQueryCachePreloader">
          <!-- ... -->
          <str name="rewriterRequestHandler">/my/rewriter-path</str>
      </listener>
    </query>

.. _querqy-store-rewriters:

Configuring how rewriter definitions are stored in ZooKeeper (Querqy 5)
-----------------------------------------------------------------------

In SolrCloud, rewriter configurations are stored in ZooKeeper under the path
:code:`querqy/rewriters` as part of the collection's config. You can set a
number of Querqy configuration properties to control how rewriters are stored:

.. code-block:: xml
   :linenos:

   <requestHandler name="/querqy/rewriter" class="querqy.solr.QuerqyRewriterRequestHandler">
     <str name="zkConfigName">myconfig</str>
     <str name="zkDataDirectory">__data</str>
     <int name="zkMaxFileSize">500000</int>
   </requestHandler>


If you want to share rewriter configurations across collections, you can make
rewriter configurations part of a shared Solr configuration that you use to
create multiple collections from it. Set the
``zkConfigName`` property to point to that shared Solr configuration and
rewriter configurations will become part of it. :code:`querqy/rewriters` will
then become a subpath in this shared configuration.

Querqy only stores meta information about rewriters under
:code:`querqy/rewriters` and keeps the actual rewriter configuations in a
subpath underneath it. This subpath is named ``.data`` by default.
Unfortunately, this path is not restored when you use Solr's collection backup
to a file system. You can change that name using Querqy's ``zkDataDirectory``
property but you need to make sure, it doesn't start with a ``.`` if you want
to have it restored from your backup. Rewriter configurations will not be moved
automatically when you change the configuration property, so you will have to
save all rewriters again to move them to the new location. Querqy will be able
to handle reading rewriters from locations that were previously saved at a
location other than the location that the current ``zkDataDirectory`` points to.
(Querqy 5.3 and above)

Rewriter configurations will be gzipped for storage in ZK. If the gzipped
configuration still exceeds the maximum ZK file size, it will be split into
multiple chunks. Querqy takes care of this under the hood but it cannot know
ZK's file size limit. You can let Querqy know about this limit using the
:code:`zkMaxFileSize` property, which represents the maximum compressed chunk
size in bytes. The default value is 1000000, which fits the default ZooKeeper
size limit. If you change this limit, the new limit will only be applied at the
next time when rewriters are saved.

.. [1] The queryParser class in the example below is
  :code:`querqy.solr.QuerqyDismaxQParserPlugin` for Query 5 and
  :code:`querqy.solr.DefaultQuerqyDismaxQParserPlugin` for Query 4.

Selecting rewriter storage (Querqy 5.9+)
----------------------------------------

By default querqy automatically selects a suitable rewriter storage depending
if your Solr instance is running in SolrCloud mode or standalone mode.

Beginning with Querqy 5.9, you can override the rewriter storage defaults by setting the
optional :code:`rewriterStorage` property of the querqy request handler.

.. code-block:: xml

   <requestHandler name="/querqy/rewriter" class="querqy.solr.QuerqyRewriterRequestHandler">
     <str name="rewriterStorage">index</str>
   </requestHandler>

.. list-table:: Available storage options
   :header-rows: 1

   * - rewriterStorage
     - Purpose
   * - zk
     - ZooKeeper based storage, default for SolrCloud
   * - confDir
     - File based storage, default for standalone Solr
   * - index
     - Index based storage, suitable for user managed clusters (classic index replication)
   * - inMemory
     - Ephemeral in-memory storage, suitable for testing or when using the ClassicRewriteChainLoader

.. note::
   Prior to Querqy 5.9 in-memory storage was enabled by :code:`<bool name="inMemory">true</bool>` in the querqy request handler. This configuration optional is still available but will be removed in a future release.

Index based storage (Querqy 5.9+)
---------------------------------

Querqy 5.9 introduces a new rewriter storage option that stores rewriter configuration
in a Solr index.

Scenarios where index based storage is suitable:

* User managed clusters (classic index replication)
* Solr is deployed with self-contained container images, with Solr home (not data) residing in read-only filesystem

The index based storage is enabled by setting the :code:`rewriterStorage`
property of the querqy request handler to :code:`index`.

.. code-block:: xml

   <requestHandler name="/querqy/rewriter" class="querqy.solr.QuerqyRewriterRequestHandler">
     <str name="rewriterStorage">index</str>
   </requestHandler>

When enabled, the querqy request handler will save the rewriter configuration in a solr index named :code:`querqy`.

.. list-table:: Advanced configuration options
   :header-rows: 1

   * - Option
     - Default value
     - Purpose
   * - configIndexName
     - querqy
     - Name of the Solr index used for storing rewriter configurations
   * - configPollingInterval
     - PT20S
     - Interval for polling the rewriter configuration index for changes on follower nodes

The querqy configuration index must be configured to use the following configuration:

schema.xml:

.. code-block:: xml
   :linenos:

   <?xml version="1.0" encoding="UTF-8" ?>
   <schema name="querqy" version="1.6">
       <fields>
           <field name="id" type="string" indexed="true" stored="true" required="true" multiValued="false" />
           <field name="_version_" type="plong" indexed="false" stored="false" />
           <field name="core" type="string" indexed="true" stored="true" required="true" multiValued="false" />
           <field name="rewriterId" type="string" indexed="true" stored="true" required="true" multiValued="false" />
           <field name="data" type="binary" indexed="false" stored="true" required="true" multiValued="false" />
           <field name="confVersion" type="pint" indexed="false" stored="true" required="true" multiValued="false" />
       </fields>
       <uniqueKey>id</uniqueKey>
       <types>
           <fieldType name="string" class="solr.StrField" sortMissingLast="true" />
           <fieldType name="pint" class="solr.IntPointField" docValues="true"/>
           <fieldType name="plong" class="solr.LongPointField" docValues="true"/>
           <fieldType name="binary" class="solr.BinaryField"/>
       </types>
   </schema>

solrconfig.xml:

.. code-block:: xml
   :linenos:

   <?xml version="1.0" encoding="UTF-8" ?>
   <config>

       <luceneMatchVersion>9.0.0</luceneMatchVersion>

       <dataDir>${solr.data.dir:}</dataDir>

       <directoryFactory name="DirectoryFactory"
                         class="${solr.directoryFactory:solr.NRTCachingDirectoryFactory}"/>

       <codecFactory class="solr.SchemaCodecFactory"/>

       <schemaFactory class="ClassicIndexSchemaFactory"/>

       <indexConfig>
           <lockType>${solr.lock.type:native}</lockType>
           <infoStream>true</infoStream>
       </indexConfig>

       <updateHandler class="solr.DirectUpdateHandler2">
           <updateLog>
               <str name="dir">${solr.ulog.dir:}</str>
           </updateLog>
           <autoCommit>
               <maxTime>${solr.autoCommit.maxTime:15000}</maxTime>
               <openSearcher>false</openSearcher>
           </autoCommit>
           <autoSoftCommit>
               <maxTime>${solr.autoSoftCommit.maxTime:-1}</maxTime>
           </autoSoftCommit>
       </updateHandler>

       <query>
           <maxBooleanClauses>1024</maxBooleanClauses>
           <filterCache size="512"
                        initialSize="512"
                        autowarmCount="0"/>
           <queryResultCache size="512"
                             initialSize="512"
                             autowarmCount="0"/>
           <documentCache size="512"
                          initialSize="512"
                          autowarmCount="0"/>
           <cache name="perSegFilter"
                  size="10"
                  initialSize="0"
                  autowarmCount="10"
                  regenerator="solr.NoOpRegenerator"/>
           <enableLazyFieldLoading>true</enableLazyFieldLoading>
           <queryResultWindowSize>20</queryResultWindowSize>
           <queryResultMaxDocsCached>200</queryResultMaxDocsCached>
           <listener event="newSearcher" class="solr.QuerySenderListener">
               <arr name="queries">
                   <!--
                      <lst><str name="q">solr</str><str name="sort">price asc</str></lst>
                      <lst><str name="q">rocks</str><str name="sort">weight asc</str></lst>
                     -->
               </arr>
           </listener>
           <listener event="firstSearcher" class="solr.QuerySenderListener">
               <arr name="queries">
                   <lst>
                       <str name="q">static firstSearcher warming in solrconfig.xml</str>
                   </lst>
               </arr>
           </listener>
           <useColdSearcher>false</useColdSearcher>
       </query>

       <requestDispatcher handleSelect="false">
           <requestParsers enableRemoteStreaming="true"
                           multipartUploadLimitInKB="2048000"
                           formdataUploadLimitInKB="2048"
                           addHttpRequestToContext="false"/>
           <httpCaching never304="true"/>
       </requestDispatcher>

       <requestHandler name="/select" class="solr.SearchHandler">
           <lst name="defaults">
               <str name="echoParams">explicit</str>
               <int name="rows">10</int>
               <str name="df">id</str>
           </lst>
       </requestHandler>

       <queryResponseWriter name="json" class="solr.JSONResponseWriter"/>

       <requestHandler name="/replication" class="solr.ReplicationHandler">
           <lst name="leader">
               <str name="replicateAfter">commit</str>
           </lst>
           <lst name="follower">
               <str name="enable">${solr.replication.follower.enabled:false}</str>
               <str name="leaderUrl">${solr.replication.leader.url:}</str>
               <str name="pollInterval">00:00:01</str>
           </lst>
       </requestHandler>

   </config>
