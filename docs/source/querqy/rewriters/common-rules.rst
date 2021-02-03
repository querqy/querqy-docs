.. _querqy-rewriters-common-rules:

=====================
Common Rules Rewriter
=====================

The Common Rules Rewriter uses configurable rules to manipulate the matching and
ranking of search results depending on the input query. In e-commerce search it
is a powerful tool for merchandisers to fine-tune search results, especially for
high-traffic queries.

The rule definition format is the same for Solr and Elasticsearch with two
exceptions:

* Filters and boostings can optionally be expressed in the syntax of the search
  engine instead of in the generic Querqy syntax.
* Very few features are not available in Elasticsearch (yet) which will be
  mentioned at the feature.

Configuring rules
=================

.. include:: ../se-section.txt

.. rst-class:: elasticsearch

.. raw:: html

 <div>

The rules for the 'Common Rules Rewriter' are passed as the value of the
``rules`` element when you create a configuration with the
SimpleCommonRulesRewriterFactory in Elasticsearch.

``PUT  /_querqy/rewriter/common_rules``

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 4

   {
       "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
       "config": {
           "rules" : "notebook =>\nSYNONYM: laptop"
       }
   }


.. raw:: html

  </div>

.. rst-class:: solr

.. raw:: html

 <div>

The rules for the 'Common Rules Rewriter' are maintained in the resource that
you configured as property ``rules`` for the
SimpleCommonRulesRewriterFactory.

.. code-block:: xml
   :linenos:
   :emphasize-lines: 5

   <queryParser name="querqy" class="querqy.solr.DefaultQuerqyDismaxQParserPlugin">
     <lst name="rewriteChain">
        <lst name="rewriter">
          <str name="class">querqy.solr.SimpleCommonRulesRewriterFactory</str>
          <str name="rules">rules.txt</str>
       </lst>
     </lst>
   </queryParser>

This `rules` files must be in UTF-8 character encoding. The maximum file size of
is 1 MB if Solr runs as SolrCloud and if you didn't change the maximum file size
in Zookeeper. You can however gzip the file - Querqy will automatically detect
this and uncompress the file.

.. raw:: html

  </div>

Structure of a rule
-------------------

We will introduce some terminology and explain the rule structure using the
follow example:

.. code-block:: Text
   :linenos:

   # if the input contains 'personal computer', add two synonyms, 'pc' and
   # 'desktop computer', and rank down by factor 50 documents that
   # match 'software':

   personal computer =>
     SYNONYM: pc
     SYNONYM: desktop computer
     DOWN(50): software
     @_id: "ID1"
     @enabled: true
     @{
       priority: 100,
       tenant: ["t1", 	"t2", "t3"],
     }@

Each rule must have an *input* definition (line #5). A rule will only be
applied if the query matches the input expression. An input definition starts at
a new line and it ends at ``=>`` followed by a line break.

An input definition is followed by one or more *instructions* (#6 to #8), which
define how the query should be rewritten.

An instruction must have a predicate (``SYNONYM``, ``UP/DOWN``, ``FILTER``,
``DELETE``, ``DECORATE``). The predicate can be followed
by a colon and some arguments after the colon - the *right-hand side*.

The right-hand side expression contains tokens or subqueries that are to be
added to or to be removed from the query. For example, line #7 defines that the
synonym 'desktop computer' should be added to the query. Some predicates allow
to specify additional arguments in brackets, like the boost factor 50 in
``DOWN(50)`` (#8).

Lines #9 to #14 define optional rule *properties*. They can be used for sorting
and filtering rules. For example: if multiple rules match the query, only apply
the rule with the highest priority value. Properties must be defined at the end
of a rule. They start with a ``@`` sign, either followed by a single-line
property (lines #9 und #10), or by a multi-line JSON document (#11 to #14) that
must be terminated with another ``@``.

Input matching
--------------

.. code-block:: Text
   :linenos:
   :emphasize-lines: 1

   personal computer =>
     SYNONYM: pc
     SYNONYM: desktop computer
     DOWN(50): software

Querqy applies the above rule if it can find the matching criteria 'personal
computer' anywhere in the query, provided that there is no other term between
'personal' and 'computer'. It would thus also match the input 'cheap personal
computer'. If you want to match the input exactly, or at the beginning or end of
the input, you have to mark the input boundaries using double quotation marks:

.. code-block:: Text
   :linenos:

   # only match the exact query 'personal computer'.
   "personal computer" =>
       ....

   # only match queries starting with 'personal computer'
   "personal computer =>
       ....

   # only match queries ending with 'personal computer'
   personal computer" =>
       ....

Each input token is matched exactly except that input matching is
case-insensitive. (You can make it case-sensitive in the `configuration`_).

There is no stemming or fuzzy matching applied to the input. If you want to make
'pc' a synonym for both, 'personal computer' and 'personal computers', you will
have to declare two rules:

.. code-block:: Text
   :linenos:

   personal computer =>
     SYNONYM: pc

   personal computers =>
     SYNONYM: pc

You can use a wildcard at the very end of the input declaration:

.. code-block:: Text
   :linenos:

   sofa* =>
     SYNONYM: sofa $1

The above rule matches if the input contains a token that starts with 'sofa-'
and adds a synonym 'sofa + wildcard matching string' to the query. For example,
a user query 'sofabed' would yield the synonym 'sofa bed'.

The wildcard matches 1 (!) or more characters. It is not intended as a
replacement for stemming but to provide some support for decompounding in
languages like German where compounding is very productive. For example,
compounds of the structure 'material + product type' and 'intended audience +
product type' are very common in German. Wildcards in Querqy can help to
decompound them and allow to search the components accross multiple fields:

.. code-block:: Text
   :linenos:

   # match queries like 'kinderschuhe' (= kids' shoes) and
   # 'kinderjacke' (= kids' jacket) and search for
   # 'kinder schuhe'/'kinder jacke' etc. in all search fields
   kinder* =>
     SYNONYM: kinder $1

Wildcard matching can be used for all rule types. There are some restrictions in
the current wildcard implementation, which might be removed in the future:

* Synonyms and boostings (UP/DOWN) are the only rule types that can pick up the
  '$1' placeholder.
* The wildcard can only occur at the very end of the input matching.
* It cannot be combined with the right-hand input boundary marker (...").



SYNONYM rules
-------------

Querqy gives you a powerful toolset for using synonyms at query time.

As opposed to the solutions that exist in Elasticsearch and Solr, it does not
use a Lucene TokenFilter for synonyms but relies purely on query rewriting. This
makes matching multi-term input and adding multi-term synonyms work flawlessly.
Querqy can cope with applying multiple synonym rules at the same time, even if
they have overlapping multi-token inputs. In addition it avoids issues with
scoring that are related to different document frequencies of the original input
and synonym terms. Last but not least, Querqy also allows to configure synonym
rules in a field-independent manner, making the maintenance of synonyms a lot
more intuitive than in Elasticsearch or Solr.

You have already seen rules for synonyms:

.. code-block:: Text
   :linenos:

   personal computer =>
     SYNONYM: pc

   sofa* =>
     SYNONYM: sofa $1

Synonyms work in only one direction in Querqy. It always tries to match the
input that is specified in the rule and adds a synonym if a given user query
matches this input. If you need bi-directional synonyms or synonym groups, you
have to declare a rule for each direction. For example, if the query 'personal
computer' should also search for 'pc' while query 'pc' should also search for
'personal computer', you would write these two rules:

.. code-block:: Text
   :linenos:

   personal computer =>
     SYNONYM: pc

   pc =>
	   SYNONYM: personal computer


.. rubric:: Expert: Structure of expanded queries

Querqy preserves the 'minimum should match' semantics for boolean queries
as defined in parameter ``minimum_should_match`` (Elasticsearch) / ``mm``
(Solr). In order to provide this semantics, given mm=1, the rule


.. code-block:: Text
   :linenos:

   personal computer =>
     SYNONYM: pc

produces the query

.. code-block:: Text
   :linenos:

   boolean_query (mm=1) (
	   dismax('personal','pc'),
	   dismax('computer','pc')
   )

and NOT

.. code-block:: Text
   :linenos:

   boolean_query(mm=??) (
	   boolean_query(mm=1) (
		   dismax('personal'),
		   dismax('computer')
	   ),
	   dismax('pc')
   )


UP/DOWN rules
-------------

UP and DOWN rules add a positive or negative boost query to the user query,
which helps to bring documents that match the boost query further up or down
in the result list.

The following rules add UP and DOWN queries to the input query 'iphone'. The UP
instruction promotes documents also containing 'apple' further to the top of the
result list, while the DOWN query puts documents containing 'case' further down
the search results:

.. code-block:: Text
   :linenos:

   iphone =>
     UP(10): apple
   	 DOWN(20): case

UP and DOWN both take boost factors as parameters. The default boost factor is
1.0. The interpretation of the boost factor is left to the search engine.
However, UP(10):x and DOWN(10):x should normally equal each other out.

By default, the right-hand side of UP and DOWN instructions will be parsed using
a simple parser that splits on whitespace and marks tokens prefixed by ``-`` as
'must not match' and tokens starting with ``+`` as 'must match'. (See
'querqyParser' in the `configuration` to set a different parser.)

A special case are right-hand side definitions that start with ``*``. The
string following the \* will be treated as a query in the syntax of the
search engine.

In the following example we favour a certain price range as an interpretation of
'cheap' and penalise documents from category 'accessories' using raw Solr
queries:

.. code-block:: Text
   :linenos:

   cheap notebook =>
     UP(10): * price:[350 TO 450]
     DOWN(20): * category:accessories

The same example in Elasticsearch:

.. code-block:: Text
   :linenos:

   cheap notebook =>
   	 UP(10): * {"range": {"price": {"gte": 350, "lte": 450}}}
   	 DOWN(20): * {"term": {"category": "accessories"}}



FILTER rules
------------

.. include:: ../se-section.txt

Filter rules work similar to UP and DOWN rules, but instead of moving search
results up or down the result list they restrict search results to those that
match the filter query. The following rule looks similar to the 'iphone' example
above but it restricts the search results to documents that contain 'apple' and
not 'case':

.. code-block:: Text
   :linenos:

   iphone =>
	   FILTER: apple
	   FILTER: -case

The filter is applied to all query fields defined in the
:raw-html:`<span class="elasticsearch">'generated.query_fields' or 'query_fields'</span>
<span class="solr">'gqf' or 'qf'</span>` :ref:`request parameters <querqy_query_params>`.
In the case of a required keyword ('apple') the filter matches if the keyword
occurs in one or more query fields. The negative filter ('-case') only matches
documents where the keyword occurs in none of the query fields.

The right-hand side of filter instructions accepts raw queries. To completely
exclude results from category 'accessories' for query 'notebook' you would
write in Solr:

.. code-block:: Text
   :linenos:

   notebook =>
	   FILTER: * -category:accessories

The same filter in Elasticsearch:

.. code-block:: Text
   :linenos:

   notebook =>
	   FILTER: * {"bool": { "must_not": [ {"term": {"category":"accessories"}}]}}


DELETE rules
------------

Delete rules allow you to remove keywords from a query. This is comparable to
stopwords. In Querqy keywords are removed before starting the field analysis
chain. Delete rules are thus field-independent.

It often makes sense to apply delete rules in a separate rewriter in the rewrite
chain before applying all other rules. This helps to remove stopwords that could
otherwise prevent further Querqy rules from matching.

The following rule declares that whenever Querqy sees the input 'cheap iphone'
it should remove keyword 'cheap' from the query and only search for 'iphone':

.. code-block:: Text
   :linenos:

   cheap iphone =>
     DELETE: cheap


While in this example the keyword 'cheap' will only be deleted if it is followed
by 'iphone', you can also delete keywords regardless of the context:

.. code-block:: Text
   :linenos:

   cheap =>
     DELETE: cheap

or simply:

.. code-block:: Text
   :linenos:

   cheap =>
     DELETE

If the right-hand side of the delete instruction contains more than one term,
each term will be removed from the query individually (= they are not considered
a phrase and further terms can occur between them):

.. code-block:: Text
   :linenos:

   cheap iphone unlocked =>
     DELETE: cheap unlocked

The above rule would turn the input query 'cheap iphone unlocked' into search
query 'iphone'.

The following restrictions apply to delete rules:

* Terms to be deleted must be part of the input declaration.
* Querqy will not delete the only term in a query.


DECORATE rules
--------------

.. include:: ../se-section.txt

.. note::

	This feature is only available for Solr.


.. rst-class:: solr

.. raw:: html

  <div>

Decorate rules are not strictly query rewriting rules but they are quite handy
to add query-dependent information to search results. For example, in online
shops there are almost always a few search queries that have nothing to do with
the products in the shop but with deliveries, T&C, FAQs and other service
information. A decorate rule matches those search terms and adds the configured
information to the search results:

.. code-block:: Text
   :linenos:

   faq =>
     DECORATE: REDIRECT /service/faq


The Solr response will then contain an array 'querqy_decorations' with the
right-hand side expressions of the matching decorate rules:

.. code-block:: xml
   :linenos:
   :emphasize-lines: 5-8

   <response>
     <lst name="responseHeader">...</lst>
     <result name="response" numFound="0" start="0">...</result>
     <lst name="facet_counts">...</lst>
     <arr name="querqy_decorations">
       <str>REDIRECT /service/faq</str>
        ...
     </arr>
   </response>

Querqy does not inspect the right-hand side of the decorate instruction
('REDIRECT /service/faq') but returns the configured value 'as is'. You could
even configure a JSON-formatted value in this place but you have to assure that
the value does not contain any line break.

.. raw:: html

    </div>


Properties: ordering, filtering and tracking of rules
-----------------------------------------------------

Imagine you have defined a rule for input 'notebook' that pushes documents
containing 'bag' to the end of the search results. This will make a lot of
sense: users searching for 'notebook' are probably less interested in notebook
accessories, they are probably looking for a proper laptop computer!

As a next step you might want to create a rule for the query 'notebook
backpack', maybe promoting all backpacks that fit 15" notebooks to the top of
the search result list. But your first rule gets into the way: backpacks that
fit 15" notebooks get pushed to the end of the search results if they contain
the term 'bag'.

You can of course put 'notebook' into double quotes when you define the down
boost of documents containing 'bag' so that the rule would only match the exact
query 'notebook' but not 'notebook backpack'. But this would reduce the query
coverage of this rule a lot. The rule would still be useful for queries like
'notebook 16gb' or 'acer notebook'.

Using rule properties will give you an alternative solution to the problem as
they allow for very flexible context-dependent rule ordering and selection. For
example, you can also use rule properties to select rules per search platform
tenant or per search user cohort.


.. rubric:: Defining properties

There are two ways to define properties, both using the @ character. The first
syntax declares one property per line:

.. code-block:: Text
   :linenos:
   :emphasize-lines: 4-10

   notebook =>
     SYNONYM: laptop
     DOWN(100): case
     @_id: "ID1"
     @_log: "notebook,modified 2019-04-03"
     @group: "electronics"
     @enabled: true
     @priority: 100
     @tenant: ["t1", "t2", "t3"]
     @culture: {"lang": "en", "country": ["gb", "us"]}

The format of this syntax is

.. code-block:: Text

 @<property name>: <property value> (on a single line)

where the property value allows for all value formats that are known from JSON
(string, number, boolean).

The second format represents the properties as a JSON object. It can span over
multiple lines. The beginning is marked by ``@{`` and the end by ``}@``:

.. code-block:: Text
   :linenos:
   :emphasize-lines: 4-15

   notebook =>
     SYNONYM: laptop
     DOWN(100): case
     @{
       _id: "ID1",
       _log: "notebook,modified 2019-04-03",
       group: "electronics",
       enabled: true,
       priority: 100,
       tenant: ["t1", 	"t2", "t3"],
       culture: {
         "lang": "en",
         "country": ["gb", "us"]
       }
     }@

Property names can also be put in quotes. Both, single quotes and double quotes,
are allowed.

Property names starting with ``_`` (like ``_id`` and ``_log``) have
a special meaning in Querqy (See for example: 'Info logging' in the
:ref:`Advanced Solr plugin configuration <querqy_solr_info_logging>`)

Both formats can be mixed, however, the multi-line JSON object format must be
used only once per rule:

.. code-block:: Text
   :linenos:
   :emphasize-lines: 4-15

   notebook =>
     SYNONYM: laptop
     DOWN(100): case
     @_id: "ID1"
     @_log: "notebook,modified 2019-04-03"
     @enabled: true
     @{
       group: "electronics",
       priority: 100,
       tenant: ["t1", 	"t2", "t3"],
       culture: {
         "lang": "en",
         "country": ["gb", "us"]
       }
    }@


.. rubric:: Using properties for rule ordering and selection

We will use the following example to explain the use of properties for rule
ordering and selection:

.. code-block:: Text
   :linenos:

   notebook =>
     DOWN(100): bag
     @enabled: false
     @{
       _id: "ID1",
       priority: 5,
       group: "electronics",
       tenant: ["t1", "t3"]
     }@


    notebook backpack =>
      UP(100): 15"
      @enabled: true
      @{
        _id: "ID2",
        priority: 10,
        group: "accessories in electronics",
        tenant: ["t2", "t3"],
        culture: {
          "lang": "en",
          "country": ["gb", "us"]
        }
     }@

The two rules illustrate the problem that we described above: The first rule
('ID1') defines a down boost for all documents containing 'bag'
if the query contains 'notebook'. This makes sense as users probably are less
interested in notebook bags when they search for a notebook. Except, if they
search for 'notebook backpack' - in this case we would not want to apply rule
ID1 but only rule ID2. Properties will help us solve this problem by ordering
and selecting rules depending on the context.

.. rubric:: sort and limit

We will tell Querqy to only apply the first rule after sorting them by the
'priority' property in descending order.

.. include:: ../se-section.txt

.. rst-class:: solr

.. raw:: html

 <div>

In order to enable rule selection we need to make sure that a rewriter ID has
been configured for the Common Rules rewriter in solrconfig.xml:

.. code-block:: xml
   :linenos:
   :emphasize-lines: 8

   <queryParser name="querqy" class="querqy.solr.DefaultQuerqyDismaxQParserPlugin">
     <lst name="rewriteChain">

       <lst name="rewriter">
         <!--
	         Note the rewriter ID:
         -->
         <str name="id">common1</str>
         <str name="class">querqy.solr.SimpleCommonRulesRewriterFactory</str>
         <str name="rules">rules.txt</str>
                <!-- ... -->
       </lst>
     </lst>
   </queryParser>

.. raw:: html

  </div>

We can order the rules by the value of the 'priority' property in descending
order and tell Querqy that it should only apply the rule with the highest
priority using the following request parameters:

.. rst-class:: elasticsearch

.. raw:: html

 <div>

``POST /myindex/_search``

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
                 {
                     "name": "common_rules",
                     "params": {
                         "criteria": {
                             "sort": "priority desc",
                             "limit": 1
                         }
                     }
                 }
             ]
         }
     }
   }

.. raw:: html

 </div>


.. rst-class:: solr

.. raw:: html

 <div>

.. code-block:: Text

   querqy.common1.criteria.sort=priority desc
   querqy.common1.criteria.limit=1

The parameters have a common prefix 'querqy.common1.criteria' where 'common1'
matches the rewriter ID that was configured in solrconfig.xml. This allows us to
scope the rule selection and ordering per rewriter.

.. raw:: html

  </div>

``sort`` specifies the property to sort by and the sort order, which can
take the values 'asc' and 'desc'

We set ``limit`` to 1 so that only the first rule after ordering will be
applied.

Looking at the example rules again, the second rule won when we sorted the rules
by descending priority and limit the number of rules to be applied to 1
because the second rule has a priority of 10 while the first rule only has a
priority of 5. But what happens if we had a second matching rule with priority
10 that we also want to apply? We could of course set limit=2 but what if
someone added a third rule with the same priority? - we couldn't keep changing
the limit parameter, especially as we had to know *per query* how many rules
there are for the top priority value.

The problem can be solved by adding another parameter:

.. rst-class:: elasticsearch

.. raw:: html

  <div>


``POST /myindex/_search``


.. code-block:: JSON
   :linenos:
   :emphasize-lines: 15

   {
     "query": {
         "querqy": {
             "matching_query": {
                 "query": "notebook"
             },
             "query_fields": [ "title^3.0", "brand^2.1", "shortSummary"],
             "rewriters": [
                 {
                     "name": "common_rules",
                     "params": {
                         "criteria": {
                             "sort": "priority desc",
                             "limit": 1,
                             "limitByLevel": true
                         }
                     }
                 }
             ]
         }
     }
   }


.. raw:: html

  </div>

.. rst-class:: solr

.. code-block:: Text
   :emphasize-lines: 3

   querqy.common1.criteria.sort=priority desc
   querqy.common1.criteria.limit=1
   querqy.common1.criteria.limitByLevel=true



``limitByLevel`` will change the interpretation of the 'limit' parameter: if
set to ``true``, rules that have the same 'priority' (or any other sort
criterion) will only count as 1 towards the limit. For example, limit=2
would select the first 5 elements in the list [10, 10, 8, 8, 8, 5, 4, 4].

.. rubric:: filter

Rules can also be filtered by properties using `JsonPath`_ expressions, where
the general parameter syntax is:

.. rst-class:: elasticsearch

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 9

   {
     "query": {
         "querqy": {
             "rewriters": [
                 {
                     "name": "common_rules",
                     "params": {
                         "criteria": {
                             "filter": "<JsonPath expression>"
                         }
                     }
                 }
             ]
         }
     }
   }


.. rst-class:: solr

.. code-block:: Text

  querqy.common1.criteria.filter=<JsonPath expression>

The properties that where defined at a given Querqy rule are considered a
JSON document and a rule filter matches the rule if the JsonPath expression
matches this JSON document. What follows is a list of examples that relate to
the above rule definitions:

* ``$[?(@.enabled == true)]`` matches ID2 but not ID1
* ``$[?(@.group == 'electronics')]`` matches ID1 but not ID2
* ``$[?(@.priority > 5)]`` matches ID2 but not ID1
* ``$[?('t1' in @.tenant)]`` matches ID1 but not ID2
* ``$[?(@.priority > 1 && @.culture)].culture[?(@.lang=='en)]`` matches ID2
  but not ID1. The expression ``[?(@.priority > 1 && @.culture)]`` first
  tests for priority > 1 (both rules matching) and then for the existence of
  'culture', which only matches ID2. Then the 'lang' property of 'culture' is
  tested for matching 'en'.

.. rst-class:: solr

.. raw:: html

 <div>

If more than one 'filter' request parameters are passed to a Common Rules
Rewriter, a rule must match all filters to get applied.

.. raw:: html

 </div>

.. rubric:: Using properties for info logging

Querqy rewriters can emit info log messages that can be directed to various
log message sinks. If configured, the Common Rules Rewriter will emit the value
of the ``_log`` property as a log message. If this property is not defined,
it will use the value of ``_id`` property and fall back to an auto-generated
id if the '_id' property also wasn't specified.

.. include:: hint-rewrite-chain.txt

Reference
=========

Configuration
-------------

.. include:: ../se-section.txt

.. rst-class:: elasticsearch

.. raw:: html

 <div>

``PUT  /_querqy/rewriter/common_rules``

.. code-block:: JSON
   :linenos:

   {
     "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
     "config": {
        "rules" : "notebook =>\nSYNONYM: laptop",
        "ignoreCase": true,
        "querqyParser": "querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory"
     }
   }

rules
  The rule definitions

  Default: (empty = no rules)

ignoreCase
  Ignore case in input matching for rules?

  Default: ``true``

querqyParser
  The querqy.rewrite.commonrules.QuerqyParserFactory to use for parsing strings
  from the right-hand side of rules into query objects

  Default: ``querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory``

.. raw:: html

   </div>

.. rst-class:: solr

.. raw:: html

 <div>

.. code-block:: xml

   <lst name="rewriter">
     <str name="class">querqy.solr.SimpleCommonRulesRewriterFactory</str>
     <str name="rules">rules.txt</str>
     <bool name="ignoreCase">true</bool>
     <str name="querqyParser">querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory</str>
   </lst>

rules
  The rule definitions file containing the rules for rewriting. The file is kept
  in the configset of the collection in ZooKeeper (SolrCloud) or in the 'conf'
  folder of the Solr core in standalone or master-slave Solr.

  Note that the default maximum file size in ZooKeeper is 1 MB. The file can be
  gzipped. Querqy will auto-detect whether the file is compressed, regardless of
  the file name.

  Required.

ignoreCase
  Ignore case in input matching for rules?

  Default: ``true``

querqyParser
  The querqy.rewrite.commonrules.QuerqyParserFactory to use for parsing strings
  from the right-hand side of rules into query objects

  Default: ``querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory``


.. raw:: html

 </div>


Request
-------

.. rst-class:: elasticsearch

.. raw:: html

 <div>

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 8-13

   {
     "query": {
         "querqy": {
             "rewriters": [
                 {
                     "name": "common_rules",
                     "params": {
                         "criteria": {
                             "filter": "<JsonPath expression>",
                             "sort": "<sort property asc|desc>",
                             "limit": 1,
                             "limitByLevel": true
                         }
                     }
                 }
             ]
         }
     }
   }

.. raw:: html

    </div>

.. rst-class:: solr

.. raw:: html

     <div>

Parameters must be prefixed by ``querqy.<rewriter id>.``

Example: ``querqy.common1.criteria.sort=priority desc`` - set 'criteria.sort'
for rewriter 'common1'.

.. raw:: html

  </div>

criteria.filter
  Only apply rules that match the filter. A JsonPath_ expression that is
  evaluated against JSON documents that are created from the properties of the
  rules.

  Default: (not set)


criteria.sort
  Sort rules by a rule property in ascending or descending order
  '<property> <asc|desc'>)

  Default: (not set - rules are sorted in the order of definition)


criteria.limit
  The number of rules to apply after sorting

  Default: (not set - apply all rules)

criteria.limitByLevel
  If ``true``, rules having the same sort property value are counted only once
  towards the ``limit``.

  Default: ``false``







.. _`JsonPath`: https://github.com/json-path/JsonPath
