.. _logging-and-debugging-rewriters:

===============================
Logging and debugging rewriters
===============================

It can become difficult to understand the output of query pre-processing. For
example, if multiple rewriters interact as part of the rewrite chain or if
a :ref:`Common Rules Rewriter <querqy-rewriters-common-rules>` is configured
with tens of thousands of rules it can become a challenge to figure out how a
given query was produced. But even if you use a very simple setup with only a
few you rules you will probably be interested in whether a given rewriter was
applied at all, for example, to analyse in your production environment
which queries and which fraction of the search traffic was manipulated by
Querqy.

In Querqy you can use two main approaches to understand how Querqy rewrites a
query. The first approach would just use the standard facilities that your
search engine offers to you - ``debug=true`` in Solr and the
``/_validate/query`` endpoint in Elasticsearch/OpenSearch. We will discuss this
further in the section Debugging below. The second approach provides information
about query rewriting that is available in non-debug mode of your search engine
and it can be used for analysis and tracking. We call this approach Info Logging
below.


.. include:: se-section.txt


Debugging
---------

Standard tools
==============

The Querqy plugin finally produces a Lucene query. This query can be inspected using
the standard means of your search engine to inspect the Lucene queries that the
search engine produces from its query DSL.

.. rst-class:: elasticsearch

.. raw:: html

   <div>

In Elasticsearch/OpenSearch this means that you can call
``https://<MYHOST>:<PORT>/<INDEX>/_validate/query?explain=true`` and submit the
usual Querqy search query in the request body. For example:


| :code:`GET https://<MYHOST>:<PORT>/<INDEX>/_validate/query?explain=true`
| :code:`Content-Type: application/json`


.. code-block:: JSON

  {
    "query":{
      "querqy":{
        "matching_query":{
          "query":"laptop"
        },
        "query_fields":[
          "title^23",
          "name",
          "shortSummary"
        ],
        "rewriters":[
          "common_rules"
        ]
      }
    }
  }

If the above case had a CommonRulesRewriter ``common_rules`` defined with rules

.. code-block::

  laptop =>
    SYNONYM: notebook
    UP(100): AMD
    DOWN(50): sleeve

the output of ``_validate/query?explain=true`` will look like this:

.. code-block:: JSON
  :linenos:
  :emphasize-lines: 12

  {
    "_shards":{
      "total":1,
      "successful":1,
      "failed":0
    },
    "valid":true,
    "explanations":[
      {
        "index":"myindex",
        "valid":true,
        "explanation":"+(+(name:notebook | shortSummary:laptop | title:laptop^23.0 | title:notebook^23.0 | shortSummary:notebook | name:laptop) AdditiveBoostFunction(100.0,query(+(name:amd | shortSummary:amd | title:amd^23.0),def=0.0)) AdditiveBoostFunction(-50.0,query(+(shortSummary:sleeve name:sleeve title:sleeve^23.0),def=0.0)))"
      }
    ]
  }

Line 12 contains the string representation of the parsed Lucene query and you
will probably recognise the notebook / laptop synonyms. It also shows
AdditiveBoostFunction sub-queries. ``AdditiveBoostFunction`` is a custom Lucene
query that is provided by Querqy to deal with UP/DOWN boosting. It especially
avoids producing negative document scores, which are not allowed by Lucene, and
it guarantees that documents that match for both UP(100) and DOWN(100) yield
the same score like documents that match neither UP(100) nor DOWN(100).


.. raw:: html

   </div>


.. rst-class:: solr

.. raw:: html

      <div>

In Solr this means that you can see the Lucene query in the parsedquery section
of the debug output that you will get if you append ``debug=true`` or
``debugQuery=true`` to a search request (see `Solr documentation <https://solr.apache.org/guide/solr/latest/query-guide/common-query-parameters.html#debug-parameter>`_).

For example, the following debug output would be produced for the search request
``/select?defType=querqy&q=notebook&querqy.rewriters=common&qf=name%20cat&debug=true``

.. code-block:: JSON

  "debug": {
    "parsedquery":"+DisjunctionMaxQuery((cat:notebook | name:notebook | name:laptop | cat:laptop)) FunctionQuery(AdditiveBoostFunction(100.0,query(+(cat:AMD | name:amd),def=0.0))) FunctionQuery(AdditiveBoostFunction(-100.0,query(+(cat:sleeve name:sleeve),def=0.0)))",
    "parsedquery_toString":"+(cat:notebook | name:notebook | name:laptop | cat:laptop) AdditiveBoostFunction(100.0,query(+(cat:AMD | name:amd),def=0.0)) AdditiveBoostFunction(-100.0,query(+(cat:sleeve name:sleeve),def=0.0))"
  }


provided that there was a CommonRulesRewriter rewriter defined for the name
``common`` with the following rules:

.. code-block::

  notebook =>
    SYNONYM: laptop
    UP(100): AMD
    DOWN(50): sleeve


You will probably recognise the notebook / laptop synonyms in the parsed query
representation in the debug output. It also shows AdditiveBoostFunction
sub-queries. ``AdditiveBoostFunction`` is a custom Lucene query that is provided
by Querqy to deal with UP/DOWN boosting. It especially avoids producing negative
document scores, which are not allowed by Lucene, and it guarantees that
documents that match for both UP(100) and DOWN(100) yield the same score like
documents that match neither UP(100) nor DOWN(100).

.. rst-class:: solr


Querqy details in Solr debug mode
=================================

.. warning:: Note that the additional details that Querqy provides to Solr's
  debug output have changed in structure and content with the release of
  'Querqy for Solr' version **5.5.lucene900.0**.


Calling a Solr SearchHandler with ``debugQuery=true`` will add
an additional section ``querqy`` to the ``debug`` section in Solr's response,
for example:

.. code-block:: JSON
  :linenos:
  :emphasize-lines: 2-4

  "debug":  {
    "querqy": {
      "parser":"querqy.parser.WhiteSpaceQuerqyParser",
      "rewrite":{
        "rewriteChain":[
          {
            "rewriterId":"common",
            "actions":[
              {
                "message":"notebook#0",
                "match":{
                  "term":"notebook",
                  "type":"exact"
                },
                "instructions":[
                  {
                    "type":"down",
                    "param":"100",
                    "value":"sleeve"
                  },
                  {
                    "type":"up",
                    "param":"100",
                    "value":"AMD"
                  },
                  {
                    "type":"synonym",
                    "value":"laptop"
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }

The output tells you under ``parser`` which
:ref:`query string parser <solr-query-string-parser>` Querqy used for processing
the user's query string.

The section under ``rewrite`` contains information about how the query was
processed in the rewrite chain. The content of this section is the same as the
output that is produced by Querqy's :ref:`Info Logging <info-logging>` with
parameter ``querqy.rewriteLogging=details`` with the difference that it is added
to the debug section here.




.. _info-logging:

Info Logging
------------

Info logging is a powerful tool when you want to understand how a specific
rewriter manipulated a query.


Concepts
========

Querqy rewriters can produce information whether
they were triggered at all and about how they changed the query. Within the
framework of Info Logging, we call this information the info logging
**output**.

Depending on the required granularity of the logging output, we distinguish
between two **types**: one that contains all *details* that a rewriter can
possibly produce as logging output, and one that contains only the *rewriter ID*.

The info logging output needs to be sent somewhere where we can pick
it up and analyse or collect it for later analysis. We call the place to which
we send the output a **sink**. The same output could, at least in theory, be
sent to more than one sink.

Setting up Info Logging
=======================

Setting up Info Logging requires two steps: Configuring sinks and enabling the
logging per request.


.. include:: se-section.txt

.. rst-class:: solr

.. raw:: html

   <div>

.. warning:: Note that the configuration of info logging and the required
  parameters have changed in an incompatible way with the release of 'Querqy
  for Solr' version **5.5.lucene900.0**. The documentation for info logging in
  older Querqy versions can be found :ref:`here <info-logging-before-5-5>`.
  When migrating to a newer Querqy for Solr version, you might also consider
  using the more detailed output that Querqy provides for rewriters when you
  call Solr with ``debugQuery=true`` instead of Info Logging, depending on your
  use case.

.. raw:: html

   </div>

Sinks
_____

To use Info Logging we need a mapping between each rewriter and the sink(s) to
which this rewriter should send its log output. This mapping is configured
within the rewriter definition:

.. rst-class:: elasticsearch

.. raw:: html

 <div>

``PUT  /_querqy/rewriter/common_rules``

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 6-8

   {
       "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
       "config": {
           "rules" : "notebook =>\nSYNONYM: laptop"
       },
       "info_logging": {
         "sinks": ["log4j"]
       }
   }

.. include:: hint-opensearch.txt



As you probably recognise at this stage, the example shows the configuration for
a Common Rules Rewriter. Lines 6-8 are new. They contain the configuration for
Info Logging. The ``sink`` property is a list of named sinks to which this
rewriter should send its log messages.

In this case, the list contains only one
element, ``log4j``, which is a predefined sink that routes the output to the
Log4j logging framework, which is used in Elasticsearch and Opensearch and which
can be configured further. At the current stage, ``log4j`` is the only available
sink for Info Logging under Elasticsearch/Opensearch and it is not possible
(yet) to provide a custom sink implementation.

The output in Log4j will look like this (using a file appender):

.. code-block:: text
  :linenos:

  [2021-03-26T13:23:43,006][INFO ][q.e.i.Log4jSink ] [node_s_0]DETAIL[ QUERQY ] {"id":"id-1001","msg":{"common_rules1":[{"APPLIED_RULES":["msg1"]}],"common_rules2":[{"APPLIED_RULES":["msg2"]}]}}
  [2021-03-26T13:28:47,454][INFO ][q.e.i.Log4jSink ] [node_s_0]REWRITER_ID[ QUERQY ] {"id":"id-1002","msg":["common_rules"]}

Let's decompose this. ``DETAIL[ QUERQY ]`` (line 1) and ``REWRITER_ID[ QUERQY ]``
(line 2) are `Log4j markers
<https://logging.apache.org/log4j/2.x/manual/markers.html>`_ that Querqy
provides and that you can use to `filter log messages <https://logging.apache.org/log4j/2.x/manual/configuration.html#Filters>`_.
The `DETAIL` and `REWRITER_ID` markers correspond to the output types that you
can set per request and that are described below. They are both children of a
common parent marker `QUERQY`.

The log message itself is a small JSON document. The ``msg`` element contains
the messages as they were produced by the rewriters with the rewriter IDs
(such as `common_rules1`) as keys and further rewriter-specific information as
values.

The ``id`` element is an ID that can be passed per request to help trace
requests across nodes (see below).


.. raw:: html

  </div>


.. rst-class:: solr

.. raw:: html

 <div>

| :code:`POST /solr/mycollection/querqy/rewriter/common_rules?action=save`
| :code:`Content-Type: application/json`

.. code-block:: JSON
  :linenos:
  :emphasize-lines: 6-8

  {
      "class": "querqy.solr.rewriter.commonrules.CommonRulesRewriterFactory",
      "config": {
          "rules" : "notebook =>\nSYNONYM: laptop"
      },
      "info_logging": {
        "sinks": ["response"]
      }
  }


As you probably recognise at this stage, the example shows the configuration for
a Common Rules Rewriter. Lines 6-8 are new. They contain the configuration for
Info Logging. The ``sink`` property is a list of named sinks to which this
rewriter sends its log messages.

In this case, the list contains only one element, ``response``, which is a
predefined sink that adds the Info Logging output to the search response
returned by Solr.

.. _custom_solr_sinks:

Expert: Predefined and custom sinks in Solr
...........................................

The ``response`` sink is currently the only predefined sink that comes with
Querqy for Solr. However, you can use your own sink by implementing the
``querqy.infologging.Sink`` interface and making it available by adding the
following configuration to the ``QuerqyRewriterRequestHandler`` in
``solrconfig.xml``:


.. code-block:: xml

  <requestHandler name="/querqy/rewriter" class="querqy.solr.QuerqyRewriterRequestHandler">
    <lst name="infoLogging">
      <lst name="sink">
        <str name="id">customSink1</str>
        <str name="class">my.name.CustomSinkOne</str>
      </lst>
      <lst name="sink">
        <str name="id">customSink2</str>
        <str name="class">my.name.CustomSinkTwo</str>
      </lst>
    </lst>
  </requestHandler>


and then add the mappings to the sink(s) in the rewriter configurations:

 | :code:`POST /solr/mycollection/querqy/rewriter/common_rules?action=save`
 | :code:`Content-Type: application/json`

.. code-block:: JSON
  :linenos:
  :emphasize-lines: 6-8

  {
       "class": "querqy.solr.rewriter.commonrules.CommonRulesRewriterFactory",
       "config": {
                  "rules" : "notebook =>\nSYNONYM: laptop"
       },
       "info_logging": {
         "sinks": ["response", "customSink1", "customSink2"]
       }
  }

As the sink mappings are configured per rewriter, you can decide per rewriter
to which sink you want to send their Info Logging output and even have one sink
per rewriter.


.. _logging-per-request:

Enabling info logging per request
_________________________________

.. rst-class:: solr

.. raw:: html

 <div>

Once you have set up you sinks and mapped rewriters to sinks, you can start
using it. To trigger the rewriters to send logging output to the sinks, you need
to pass the following request parameters to enable the logging per request:

querqy.rewriteLogging.rewriters
  A comma-separated list of rewriter IDs for which info logging should be
  enabled. Use ``querqy.rewriteLogging.rewriters=*`` if you want to enable it
  for all rewriters in the rewrite chain.
  Note that not all rewriters have implemented info logging. The are also
  expected to remain 'silent' if they did not modify the query.

querqy.rewriteLogging
  Values: ``details`` ``rewriter_id`` ``off``

  Defines the type of the output.

  * ``details``: Gives you all details that the rewriter produces as logging
    output. For example, the CommonRulesRewriter will return information about
    the rules that were applied and the log message that was configured.
  * ``rewriter_id``: Only returns the IDs of the rewriters.
  * ``off``: Returns nothing at all.

  Default: ``off``

Examples:

| :code:`GET https://<MYHOST>:<PORT>/solr/<collection>/select?q=notebook&querqy.rewriters=common&querqy.rewriteLogging.rewriters=common&querqy.rewriteLogging=rewriter_id`

returns

.. code-block:: JSON
  :linenos:
  :emphasize-lines: 4-10

  {
    "responseHeader":{  },
    "response":{ },
    "querqyRewriteLogging":{
      "rewriteChainLogging":[
        {
          "rewriterId":"common"
        }
      ]
    }
  }

provided that rewriter 'common' changed the query.

The same query with detailed output (setting ``querqy.rewriteLogging=details``):

| :code:`GET https://<MYHOST>:<PORT>/solr/<collection>/select?q=notebook&querqy.rewriters=common&querqy.rewriteLogging.rewriters=common&querqy.rewriteLogging=details`


.. code-block:: JSON
  :linenos:
  :emphasize-lines: 4-35

  {
    "responseHeader":{},
    "response":{},
    "querqyRewriteLogging":{
      "rewriteChainLogging":[
        {
          "actions":[
            {
              "message":"notebook#0",
              "match":{
                "term":"notebook",
                "type":"exact"
              },
              "instructions":[
                {
                  "type":"down",
                  "param":"100",
                  "value":"sleeve"
                },
                {
                  "type":"up",
                  "param":"100",
                  "value":"AMD"
                },
                {
                  "type":"synonym",
                  "value":"laptop"
                }
              ]
            }
          ],
          "rewriterId":"common"
        }
      ]
    }
  }

The ``actions`` element is specific to the CommonRulesRewriter. It reflects that
the following block in the rule definition was applied and it should be easy to
map the ``instructions`` output with the following rule
definition:

.. code-block::

  notebook =>
    SYNONYM: laptop
    UP(100): AMD
    DOWN(50): sleeve

Should more than one such blocks of rules be applied to a query, they would each
occur as their own object in the ``actions`` list of the Info Logging output.

Besides ``instructions`` output, we also get a ``match`` and a ``message``
element. ``match`` tells what input triggered the application of rules and how it was
matched. In this case, *notebook* was matched exactly.

Had we used a wildcard in the rule, the logging output would
still tell us the full matching term and also that the type is *affix* for
the above query:

.. code-block::

  note* =>
    SYNONYM: laptop
    ...

...would thus produce the following output for query *notebook*:

.. code-block:: JSON

  {
      "match":{
        "term":"notebook",
        "type":"affix"
      }
  }

The ``message`` element of the ``action`` was auto-generated above:

.. code-block:: JSON
  :linenos:
  :emphasize-lines: 7

  {
    "querqyRewriteLogging":{
      "rewriteChainLogging":[
        {
          "actions":[
            {
              "message":"notebook#0",
              "match": {},
              "instructions": []
            }

          ]
         }
        ]
      }
    }


``"notebook#0"`` is a generated from the input `notebook` and a count of rule
definition blocks. In this case it is the first block in our rule definitions
(the count starts at 0).


.. raw:: html

 </div>

.. rst-class:: elasticsearch

.. raw:: html

  <div>

Once you have mapped rewriters to sinks, you can start using Info Logging. To
trigger the rewriters to send logging output to the sinks, you need
to enable Info Logging in your search requests:

:code:`POST /myindex/_search`

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 12-15

   {
      "query": {
          "querqy": {
              "matching_query": {
                  "query": "notebook"
              },
              "query_fields": [ "title^3.0", "brand^2.1", "shortSummary"],
              "rewriters": [
                "word_break",
                "common_rules"
              ],
              "info_logging": {
                "id":"REQ-ID-0043",
                "type": "DETAIL"
              }
          }
      }
   }


Info Logging is controlled by the properties specified under `info_logging`
(lines 12-15). You can set the properties as follows:

`type`
  Values: ``DETAIL`` ``REWRITER_ID`` ``NONE``

  Controls whether a logging output is generated at all together with the format
  of the output. It can take the values:

  * ``DETAIL`` - Logs all details that the rewriter produces as logging
    output.
  * ``REWRITER_ID`` - Only logs the IDs of the rewriters.
  * ``NONE`` - Logs nothing at all.

  Default: ``NONE``

`id`
  An identifier. This can be used for identifying search requests. For example,
  when you use more than one shard, the same search request will be executed on
  more than one shard and create a log message on each shard. You can use this
  ID to trace and aggregate the messages across shards. It is up to the client
  that makes the search request to supply the ID.

  Default: not set

For examples of the output format for types ``DETAIL`` and ``REWRITER_ID`` see
the Log4j sink output above. It is up to the individual rewriter what log
message the emit for type ``DETAIL``.


.. raw:: html

   </div>

.. rst-class:: solr

.. raw:: html

     <div>


This default log message can be overridden in the rule definitions using the
``_log`` and ``_id_`` properties:


.. code-block:: text
  :emphasize-lines: 5,11,16

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

The query 'samusng notebook 32g' will now produce the following log messages
(we're skipping the `instructions` details):

.. code-block:: JSON
  :emphasize-lines: 7,15,23


  {
    "querqyRewriteLogging":{
      "rewriteChainLogging":[
        {
          "actions":[
            {
              "message":"Log message for samusng typo",
              "match":{
                "term":"samusng",
                "type":"exact"
              },
              "instructions":[ ]
            },
            {
              "message":"Log message for notebook",
              "match":{
                "term":"notebook",
                "type":"exact"
              },
              "instructions":[ ]
            },
            {
              "message":"ID3",
              "match":{
                "term":"32g",
                "type":"exact"
              },
              "instructions":[ ]
            }
          ],
          "rewriterId":"common"
        }
      ]
    }

  }


As the third block doesn't have a '_log' property, the ``_id`` property (*ID3*) will be
used as the message, and if that didn't exist, we'd fall back to the
`<input>#<rule number>` scheme  that we saw above.


.. raw:: html

   </div>
