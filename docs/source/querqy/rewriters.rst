=========
Rewriters
=========

Rewriters manipulate the query that was entered by the user. They can change the
result set by adding alternative tokens, by removing tokens or by adding
filters. They can also influence the ranking by adding boosting information.

A single query can be rewritten by more than one rewriter. Together they
form the *rewrite chain*.

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

Rewriters in Elasticsearch
--------------------------

Querqy adds a REST endpoint to Elasticsearch for managing rewriters at

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
will see a 'word break rewriter' configuration later @TODO). The second rewriter
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

The rewrite chain is configured in solrconfig.xml:

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

The :code:`id` property (#13) is optional. In some cases the id is used to pass
request parameters to a specific rewriter.

The id and class properties are the only properties that are available for all
rewriters. Rewriters can have additional properties that will only have a
meaning for the specific rewriter implementation. In the example, the
:code:`rules` property specifies the resource that contains rule definitions for
the 'Common Rules' rewriter.

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

:ref:`Number/Unit Rewriter <querqy-rewriters-number-unit>`
  Recognises numerical values and units of measurement in the query and matches
  them with indexed fields. Allows for range matches and boosting of the exactly
  matching value.

:ref:`Shingle Rewriter <querqy-rewriters-shingle>`
  Creates shingles (compounds) from adjacent query tokens and adds them as
  synonyms.
