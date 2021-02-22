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

.. _querqy-unknown-rewriters:

Dealing with undefined rewriters in the rewrite chain (Querqy 5)
----------------------------------------------------------------

In Querqy 5 the rewriter chain is passed as a list of rewriter IDs in a request
parameter:

:code:`querqy.rewriters=rewriter1,rewriter2`

where each rewriter ID references a previously defined rewriter configuration.
You can use the :code:`skipUnkownRewriters` property of the query parser plugin
to define what should happen if no rewriter configuration can be found for a
given rewriter ID that was passed in :code:`querqy.rewriters`:

.. code-block:: xml
   :linenos:
   :emphasize-lines: 2

   <queryParser name="querqy" class="querqy.solr.QuerqyDismaxQParserPlugin">
     <bool name="skipUnkownRewriters">true</bool>
   </queryParser>

If 'skipUnkownRewriters' is set to :code:`true`, the missing rewriter is ignored
and the rewrite chain will be processed as if this rewriter weren't part of it.
A warning will be issued to the log file. If it is set to :code:`false`,
Solr will reply with a '400 Bad Request' response, which is also the default
behaviour when the 'skipUnkownRewriters' is not configured.


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


.. _querqy_solr_info_logging:

Info logging
------------

Querqy rewriters can return logging information together with the request
response or send this information to other receivers. Currently only the common
rules rewriter emits this information and it can be returned together with the
Solr response.

Configuration:

**Querqy 5**

.. code-block:: xml

   <queryParser name="querqy" class="querqy.solr.QuerqyDismaxQParserPlugin">

     <!-- ... -->

     <lst name="infoLogging">
       <!--
         Define a 'sink' named 'responseSink' to which the logging information
         will be sent:
       -->

       <lst name="sink">
         <str name="id">responseSink</str>
         <str name="class">querqy.solr.ResponseSink</str>
       </lst>

       <!--
         Send the logging information from rewriter 'common1' to sink
         'responseSink':
       -->
       <lst name="mapping">
         <str name="rewriter">common1</str>
         <str name="sink">responseSink</str>
       </lst>
       <!--
         Send the logging information from rewriter 'common2' to sink
         'responseSink' too:
       -->
       <lst name="mapping">
         <str name="rewriter">common2</str>
         <str name="sink">responseSink</str>
       </lst>

     </lst>

   </queryParser>

Mappings can be configured before the rewriter is created. For example, in the
above configuration, we have a mapping from rewriter 'common1' to sink
'responseSink'. This will be ignored if rewriter 'common1' doesn't exist, but
logging will start as soon as you create a rewriter for the name 'common1'.


**Querqy 4**

.. code-block:: xml

   <queryParser name="querqy" class="querqy.solr.DefaultQuerqyDismaxQParserPlugin">
     <lst name="rewriteChain">
       <lst name="rewriter">

         <!--
           Note the rewriter id 'common1':
         -->
         <str name="id">common1</str>
         <str name="class">querqy.solr.SimpleCommonRulesRewriterFactory</str>
         <str name="rules">rules1.txt</str>
                <!-- ... -->
       </lst>
       <lst name="rewriter">
         <str name="id">common2</str>
         <str name="class">querqy.solr.SimpleCommonRulesRewriterFactory</str>
         <str name="rules">rules2.txt</str>
         <!-- ... -->
       </lst>
     </lst>
     <!-- ... -->

     <lst name="infoLogging">
       <!--
         Define a 'sink' named 'responseSink' to which the logging information
         will be sent:
       -->

       <lst name="sink">
         <str name="id">responseSink</str>
         <str name="class">querqy.solr.ResponseSink</str>
       </lst>

       <!--
         Send the logging information from rewriter 'common1' to sink
         'responseSink':
       -->
       <lst name="mapping">
         <str name="rewriter">common1</str>
         <str name="sink">responseSink</str>
       </lst>
       <!--
         Send the logging information from rewriter 'common2' to sink
         'responseSink' too:
       -->
       <lst name="mapping">
         <str name="rewriter">common2</str>
         <str name="sink">responseSink</str>
       </lst>

     </lst>

   </queryParser>

The logging output must be enabled per request, using the request parameter
querqy.infoLogging:

``querqy.infoLogging=on`` (default: off)


This will add a section 'querqy.infoLog' to the Solr response:

.. code-block:: xml

   <lst name="querqy.infoLog">
     <arr name="common1">
       <lst>
         <arr name="APPLIED_RULES">
           <str>(message for rule 1.1)</str>
           <str>(message for rule 1.2)</str>
         </arr>
       </lst>
     </arr>
     <arr name="common2">
       <lst>
         <arr name="APPLIED_RULES">
           <str>(message for rule 2.1)</str>
           <str>(message for rule 2.2)</str>
         </arr>
       </lst>
     </arr>
   </lst>

Each rewriter can emit a list of log objects. In this case CommonRulesRewriter
'common1' emitted just a single log object (lst), which holds an array
APPLIED_RULES that contains a log message for each rule that the rewriter has
applied (<str>(message for rule 1.1)</str> etc).

The log message can be defined in rules.txt using the ``_log`` property:

.. code-block:: text

  notebook =>
  	SYNONYM: laptop
  	DELETE: cheap
  	@_id: "ID1"
  	@_log: "Log message for notebook"

  samusng =>
     SYNONYM: samsung
     @{
         "_id": "ID2",
         "_log": "Log message for samusng typo",

     }

  32g =>
    SYNONYM: 32gb
    @_id: "ID3"

The query 'samusng notebook 32g' will now produce the following log output:

.. code-block:: xml

  <lst name="querqy.infoLog">
      <arr name="common1">
          <lst>
              <arr name="APPLIED_RULES">
                  <str>Log message for notebook</str>
                  <str>Log message for samusng typo</str>
                  <str>ID3</str>
              </arr>
          </lst>
      </arr>
  </lst>


As the third rule doesn't have a '_log' property, the ``_id`` property will be
used as the message. If both, the '_log' and the '_id' property are missing, a
default message will be created based on the input expression of the rule and a
rule counter (samusng#1, 32g#2 etc.)

Custom info logging sinks can be created by implementing the
``querqy.infologging.Sink`` interface.



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




.. [1] The queryParser class in the example below is
  :code:`querqy.solr.QuerqyDismaxQParserPlugin` for Query 5 and
  :code:`querqy.solr.DefaultQuerqyDismaxQParserPlugin` for Query 4.
