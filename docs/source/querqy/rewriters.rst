=========
Rewriters
=========

Rewriters manipulate the query that was entered by the user. They can change the
result set by adding alternative tokens, by removing tokens or by adding
filters. They can also influence the ranking by adding boosting information.

A single query can be rewritten by more than one rewriter. Together they
form the **rewrite chain**.

Before you can apply a rewrite chain, you need to configure one or more
rewriters.

.. _configuring-and-applying-a-rewriter:

Configuring and applying a rewriter
===================================

We will use a minimal example of the 'Common Rules Rewriter' -
Querqy's most popular rewriter - to demonstrate how a rewrite chain is
configured in principle.

As search engines differ in how configurations are supplied to them, select your
search engine below.


.. include:: se-section.txt

.. rst-class:: elasticsearch

Rewriters in Elasticsearch/OpenSearch
-------------------------------------

Querqy adds a REST endpoint to Elasticsearch/OpenSearch for managing rewriters at

:code:`/_querqy/rewriter`

Creating/configuring a 'Common Rules rewriter':


:code:`PUT  /_querqy/rewriter/common_rules`

.. code-block:: JSON
   :linenos:

   {
       "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
       "config": {
           "rules" : "notebook =>\nSYNONYM: laptop"
       }
   }

.. include:: rewriters/hint-opensearch.txt

Rewriter definitions are uploaded by sending a PUT request to the rewriter
endpoint. The last part of the request URL path (:code:`common_rules`) will
become the name of the rewriter.

A rewriter definition must contain a class element (line #2). Its value
references an implementation of a querqy.elasticsearch.ESRewriterFactory which
will provide the rewriter that we want to use.

The rewriter definition can also have a config object (#3) which contains the
rewriter-specific configuration.

In the case of the SimpleCommonRulesRewriter, the configuration must contain the
rewriting rules (#4). Remember to escape line breaks etc. when you include your
rules in a JSON document.


We can now apply one or more rewriters to a query:

:code:`POST /myindex/_search`

.. code-block:: JSON
   :linenos:

   {
     "query": {
        "querqy": {
            "matching_query": {
                "query": "notebook"
            },
            "query_fields": [ "title^3.0", "brand^2.1", "shortSummary"],
            "rewriters": ["common_rules"]
        }
     }
   }

The rewriters are added to the
:ref:`minimal query that we constructed earlier <querqy-making-queries>` using a
list of named :code:`rewriters` (line #8). This list contains the rewrite chain
- the list of rewriters in the order in which they will be applied and in which
they will manipulate the query. The above example contains only a single
rewriter.

Rewriters are referenced in the :code:`rewriters` element either just by their
name or by the :code:`name` property of an object which allows to pass request
parameters to the rewriter. The following example shows two rewriters, one of
them with additional parameters:

:code:`POST /myindex/_search`

.. code-block:: JSON
   :linenos:

   {
     "query": {
        "querqy": {
            "matching_query": {
                "query": "notebook"
            },
            "query_fields": [ "title^3.0", "brand^2.1", "shortSummary"],
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
            ]
        }
      }
   }


The first rewriter, word_break (line #9), is just referenced by its name (we
will see a 'word break rewriter' configuration later. The second rewriter
is called in a JSON object. Its :code:`name` property references the rewriter
definition by the rewriter name, 'common_rules' (#11). The :code:`params` object
(#12) is passed to the rewriter.

In the example, params contains a :code:`criteria` object (#13). This parameter
is specific to the Common Rules rewriter. The filter expression in the example
ensures that only rules that either have a prio property set to 1 or that don't
have any prio property at all will be applied.

In the above example rewrite chain, the word_break rewriter will be applied
before the common_rules rewriter due to the order of the rewriters in the
:code:`rewriters` JSON list element.

Updating and deleting rewriters
...............................

To update a rewriter configuration, just send the updated configuration in a
:code:`PUT` request to the same rewriter URL again.

To delete a rewriter, send a request with HTTP method :code:`DELETE` to the
rewriter URL. For example,

:code:`DELETE  /_querqy/rewriter/common_rules`

will delete your common_rules rewriter.


.. rst-class:: solr

Rewriter configuration in Solr
------------------------------

.. include:: hint-querqy-5-solr.txt

**Querqy 5**

Querqy adds a URL endpoint to Solr for managing rewriters. When you set up
Querqy in :code:`solrconfig.xml`, you've added a request handler for this:

.. code-block:: XML

  <requestHandler name="/querqy/rewriter" class="querqy.solr.QuerqyRewriterRequestHandler" />

You can then manage your rewriters at

:code:`http://<solr host>:<port>/solr/mycollection/querqy/rewriter`

Creating/configuring a 'Common Rules rewriter':


| :code:`POST /solr/mycollection/querqy/rewriter/common_rules?action=save`
| :code:`Content-Type: application/json`

.. code-block:: JSON
   :linenos:

   {
       "class": "querqy.solr.rewriter.commonrules.CommonRulesRewriterFactory",
       "config": {
           "rules" : "notebook =>\nSYNONYM: laptop"
       }
   }

Rewriter definitions are uploaded by sending a POST request and appending the
:code:`action=save` parameter to the rewriter endpoint. The last part of the
request URL path (:code:`common_rules`) will become the name of the rewriter.

A rewriter definition must contain a class element (line #2). Its value
references an implementation of a querqy.solr.SolrRewriterFactoryAdapter which
will provide the rewriter that we want to use.

The rewriter definition can also have a config object (#3-5), which contains the
rewriter-specific configuration. In the case of the CommonRulesRewriterFactory,
the configuration must contain the rewriting rules (#4). Remember to escape line
breaks etc. when you include your rules in a JSON document.

If you work with SolrJ, you can create your configuration request using a
request that comes with most of the Querqy-supplied rewriters. Just look out for
the :code:`*ConfigRequestBuilder` classes in the Java packages under
:code:`querqy.solr.rewriter`.

Once we have managed our rewriter configuration, We can apply one or more
rewriters to a query:

:code:`GET /solr/mycollection/select?q=notebook&defType=querqy&querqy.rewriters=common_rules&qf=title^3.0...`

The parameter :code:`defType=querqy` enables the Querqy query parser. The
optional parameter :code:`querqy.rewriters` contains a list of comma-separated
rewriter names. These rewriters form the rewrite chain and they are processed in
their order of occurrence. In this specific example, we only used the rewriter
that we defined in our POST request above and we reference it by its name
:code:`common_rules`. Had we configured another rewriter under
:code:`/solr/mycollection/querqy/rewriter/replace`, we could apply the
'replace' rewriter before the 'common_rules' rewriter using the URL parameter
:code:`querqy.rewriters=replace,common_rules`.

By default, Solr will reply with a :code:`400 Bad Request` response, if a
rewriter that was passed in in the 'querqy.rewriters' parameter does not exist.
Please see :ref:`this section <querqy-unknown-rewriters>` in the 'Advanced Solr
Plugin Configuration' documentation for an option to ignore missing rewriters.

Updating and deleting rewriters (Querqy 5)
..........................................

To update a rewriter configuration, just send the updated configuration in a
POST request with :code:`action=save` to the same rewriter URL again.

To delete a rewriter, send a POST request with :code:`action=delete` to the
rewriter URL. For example,

:code:`POST /solr/mycollection/querqy/rewriter/common_rules?action=delete`

will delete your common_rules rewriter.

Getting rewriter information (Querqy 5)
.......................................

You can get a list of configured rewriters at:

:code:`GET /solr/mycollection/querqy/rewriter`

To retrieve the configuration of a specific rewriter, you can make a GET call
against its endpoint. In the case of the :code:`common_rules` rewriter above,
the call would be:

:code:`GET /solr/mycollection/querqy/rewriter/common_rules`


**Querqy 4**

The rewrite chain is configured at the Querqy query parser in solrconfig.xml:

.. code-block:: xml
   :linenos:
   :emphasize-lines: 6,8-22

   <!--
     Add the Querqy query parser.
   -->
   <queryParser name="querqy" class="querqy.solr.DefaultQuerqyDismaxQParserPlugin">

     <lst name="rewriteChain">

        <!--
          Common Rules Rewriter
        -->
        <lst name="rewriter">

          <str name="id">commonRules</str>

          <str name="class">querqy.solr.SimpleCommonRulesRewriterFactory</str>

            <!--
              The file that contains rules for synonyms, boosting etc.
             -->
          <str name="rules">rules.txt</str>

        </lst>

        <!--

          You can add more rewriters here

        <lst name="rewriter">
          <str name="id">rewriter2</str>
          <str name="class">...</str>
           ....
        </lst>

        <lst name="rewriter">
          <str name="class">...</str>
           ....
        </lst>

        -->


   </queryParser>


The :code:`lst` element :code:`rewriteChain` (line #6) serves as a container for
the rewriters.

Each rewriter is defined in a :code:`rewriter` :code:`lst` element (#11).

All rewriters must have a :code:`class` property (#15) that specifies a factory
for creating the rewriter.

The :code:`id` property (#13) is optional. In some cases the id is used to route
request parameters to a specific rewriter.

The 'id' and 'class' properties are the only properties that are available for
all rewriters. Rewriters can have additional properties that will only have a
meaning for the specific rewriter implementation.

In the example, the ``rules`` property specifies the resource that contains rule
definitions for the 'Common Rules Rewriter'. Resources are files that are either
kept in ZooKeeper as part of the configset (SolrCloud) or in the 'conf' folder
of a Solr core in standalone or master-slave Solr. They can be gzipped, which
will be auto-detected by Querqy, regardless of the file name. If you keep your
files in ZooKeeper, remember the maximum file size in ZooKeeper (default: 1 MB).


Example: Configuring rewriter via curl (Querqy 5)
.................................................

.. note::
  In these examples we use :code:`curl` and :code:`jq` to retrieve and edit
  rewriter configuration from a running Solr installation. We assume, that
  the Solr instance is reachable at :code:`http://localhost:8983`. Configure
  your Solr target using the environment variables below.

**List configured rewriters**

This will list all configured rewriters as JSON response. Use the
rewriters :code:`id` to retrieve it's details using the subsequent
examples.

.. code-block:: console
    :linenos:

    SOLR_URL="http://localhost:8983"
    SOLR_COLLECTION="collection"
    curl -s "${SOLR_URL}/solr/${SOLR_COLLECTION}/querqy/rewriter" \
        | jq '.response.rewriters'

.. code-block:: JSON
    :linenos:

    {
      "filter": {
        "id": "filter",
        "path": "/querqy/rewriter/filter"
      },
      "synonyms": {
        "id": "synonyms",
        "path": "/querqy/rewriter/synonyms"
      }
    }

**Get rules for a single rewriter**

This example will return the Querqy rules configured for a single rewriter as raw
output on the console.

.. code-block:: console
    :linenos:

    SOLR_URL="http://localhost:8983"
    SOLR_COLLECTION="collection"
    QUERQY_REWRITER="synonyms"
    curl -s "${SOLR_URL}/solr/${SOLR_COLLECTION}/querqy/rewriter/${QUERQY_REWRITER}" \
        | jq -r '.rewriter.definition.config.rules'

**Edit rules for a single rewriter**

Downloads the Querqy rules for a single rewriter into
a temporary file to edit.

.. code-block:: console
    :linenos:

    SOLR_URL="http://localhost:8983"
    SOLR_COLLECTION="collection"
    QUERQY_REWRITER="synonyms"
    curl -s "${SOLR_URL}/solr/${SOLR_COLLECTION}/querqy/rewriter/${QUERQY_REWRITER}" \
        | jq -r '.rewriter.definition.config.rules' \
        > /tmp/${QUERQY_REWRITER}.txt

Edit the Querqy rules in :code:`/tmp/${QUERQY_REWRITER}.txt`. Afterwards upload them
using the following :code:`curl` call.

.. code-block:: console
    :linenos:

    curl -s "${SOLR_URL}/solr/${SOLR_COLLECTION}/querqy/rewriter/${QUERQY_REWRITER}" \
        | jq -r --arg rules "$(cat /tmp/${QUERQY_REWRITER}.txt)" \
            '.rewriter.definition | .config.rules |= $rules' \
        | curl -X POST -H "Content-Type: application/json" --data-binary @- \
            "${SOLR_URL}/solr/${SOLR_COLLECTION}/querqy/rewriter/${QUERQY_REWRITER}?action=save"


.. _querqy-list-of-rewriters:

List of available rewriters
===========================

.. toctree::
   :maxdepth: 4
   :hidden:

   rewriters/common-rules
   rewriters/replace
   rewriters/word-break
   rewriters/number-unit
   rewriters/shingle

The list below contains all rewriters that come with Querqy. Click on the
rewriter name to see the documentation.

.. TODO link to 'write your own rewriter'

:ref:`Common Rules Rewriter <querqy-rewriters-common-rules>`
  Query-dependent rules for synonyms, result boosting (up/down), filters;
  'decorate' result with addition information

:ref:`Replace Rewriter <querqy-rewriters-replace>`
  Replace query terms. Used as a query normalisation step, usually applied
  before the query is processed further, for example, before the Common Rules
  Rewriter is applied

:ref:`Word Break Rewriter <querqy-rewriters-word-break>`
  (De)compounds query tokens. Splits compound words or creates compounds from
  separate tokens.

:ref:`Number-Unit Rewriter <querqy-rewriters-number-unit>`
  Recognises numerical values and units of measurement in the query and matches
  them with indexed fields. Allows for range matches and boosting of the exactly
  matching value.

:ref:`Shingle Rewriter <querqy-rewriters-shingle>`
  Creates shingles (compounds) from adjacent query tokens and adds them as
  synonyms.
