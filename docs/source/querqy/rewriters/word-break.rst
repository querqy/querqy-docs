.. _querqy-rewriters-word-break:

===================
Word Break Rewriter
===================

What it does
============

The Word Break Rewriter deals with compound words in queries. It works in two
directions: it will split compound words found in queries and it will create
compound words from adjacent query tokens.

Let's use *wall mount* vs. *wallmount* as an example. Some documents in our
index will have the form *wall mount*, others will have the compound form
*wallmount*. If a user submits a query *wall mount*, she would only find the
documents for *wall mount* and users searching for *wallmount* would only see
the *wallmount* documents - both missing out on recall because of the variation
in word compounding.

The Word Break Rewriter will split the query *wallmount* and add *wall mount*
as a synonym, and vice-versa, it will add the synonym *wallmount* to the query
*wall mount*.

As this rewriter manipulates the query before it is applied to fields, the parts
of the broken-up compound word can match in different fields. This makes the
rewriter very powerful for languages with very productive word compounding. For
example, splitting the German query 'lederhut' (leather hat) into 'leder hut'
will allow to search for 'leder' in the field 'material' and 'hut' in the
category and product type fields.

Setting up a Word Break Rewriter
================================

.. include:: ../se-section.txt

.. rst-class:: elasticsearch

.. raw:: html

 <div>

``PUT  /_querqy/rewriter/word_break``

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 4-10

   {
       "class": "querqy.elasticsearch.rewriter.WordBreakCompoundRewriterFactory",
       "config": {
            "dictionaryField" :  "dictionary",
            "lowerCaseInput": true,
            "decompound": {
                "maxExpansions": 5,
                "verifyCollation": true
            },
            "reverseCompoundTriggerWords": ["for"]

       }
   }

.. raw:: html

 </div>

.. rst-class:: solr

.. raw:: html

 <div>

.. code-block:: xml
   :linenos:

   <lst name="rewriter">
     <str name="class">querqy.solr.contrib.WordBreakCompoundRewriterFactory</str>
     <str name="dictionaryField">f1</str>
     <bool name="lowerCaseInput">true</bool>
     <int name="decompound.maxExpansions">5</int>
     <bool name="decompound.verifyCollation">true</bool>
     <str name="morphology">GERMAN</str>
     <arr name="reverseCompoundTriggerWords">
       <str>for</str>
     </arr>
   </lst>


.. raw:: html

    </div>



The Word Break Rewriter is backed by a dictionary of known words. The
dictionary is just a field in the index - the ``dictionaryField`` (line
:raw-html:`<span class="elasticsearch">#4</span><span class="solr">#3</span>`).
This field is normally a 'copy field' to which contents from  high-quality
content fields is copied - usually fields like 'title', 'product type',
'category', 'brand', 'colour' or other textual attributes. The Analyzer of this
field should not apply any stemming. Using a Standard Tokenizer and a Lowercase
Token Filter will be a good start.

Setting ``lowerCaseInput`` to ``true``
(:raw-html:`<span class="elasticsearch">#5</span><span class="solr">#4</span>`)
assures that the query token lookup in the dictionary will match the lowercased
words in the dictionary field, making the word break handling case-insensitive.

When the rewriter splits a compound word, it could find more than one position
in the word at which a split is possible. The ``decompound.maxExpansions``
(:raw-html:`<span class="elasticsearch">#7</span><span class="solr">#5</span>`)
setting specifies how many of these split variants should be added as synonyms
to the query.

Setting ``decompound.verifyCollation`` to ``true``
(:raw-html:`<span class="elasticsearch">#8</span><span class="solr">#6</span>`)
assures that only those variants will be added that co-occur in the
dictionaryField value of at least one document. This can prevent many unwanted
word splits. For example, the word 'action' will not be split into 'act + ion'
as long as the 'act' and 'ion' do not co-occur in the dictionaryField of a
document.

.. rst-class:: solr

.. raw:: html

 <div>

By default, it is assumed that words that together form compound word
were just joined together without changing their form. But in some languages
words can take a specific form when they are used in compounds. For
example, when combining 'baumwolle' (cotton) with 'jacke' (jacket) to form
'baumwolljacke' (cotton jacket) in German, the final -e is removed from the
modifier word 'baumwolle'. `[S. Langer (1998)] <https://www.cis.uni-muenchen.de/~stef/veroeffentlichungen/konvens1998.pdf>`_.
mentions 68 different forms that modifier words can take in German compounds.
The ``morphology`` setting enables language-specific word forms in
compounds. Currently, the only available morphology implementation is GERMAN,
which applies the 20 most popular compound forms listed on page 6 in [S. Langer
(1998)]. The rewriter currently applies the morphology only when splitting
compounds but not when creating them.


 .. raw:: html

  </div>



``reverseCompoundTriggerWords``
(:raw-html:`<span class="elasticsearch">#10</span><span class="solr">#8-10</span>`)
support an additional compound creation strategy that drops the trigger word and
creates a compound from the left and right tokens in reverse order. In languages
with very productive compounding, like Dutch and German, this strategy helps to
map phrases with prepositions like 'for' and 'of' to compounds. For example,
let's assume we have configured 'voor' (Dutch 'for') in
'reverseCompoundTriggerWords'. The query 'voer voor honden' ('food for dogs')
will then trigger a synonym 'hondenvoer' ('dog food') to be added to the query.

The rewriter will create compounds of adjacent query tokens without any further
configuration.

.. include:: hint-rewrite-chain.txt

Reference
=========

Configuration
-------------

.. include:: ../se-section.txt

.. rst-class:: elasticsearch

.. raw:: html

 <div>

``PUT  /_querqy/rewriter/word_break``

.. code-block:: JSON
   :linenos:

   {
       "class": "querqy.elasticsearch.rewriter.WordBreakCompoundRewriterFactory",
       "config": {
            "dictionaryField" :  "dictionary",
            "minSuggestionFreq": 3,
            "minBreakLength": 4,
            "maxCombineLength": 30,
            "lowerCaseInput": true,
            "decompound": {
                "maxExpansions": 5,
                "verifyCollation": true
            },
            "reverseCompoundTriggerWords": ["for", "from", "of"],
            "alwaysAddReverseCompounds": true

       }
   }

.. raw:: html

 </div>


dictionaryField
  The field containing the words for splitting compounds. Should be lowercased.
  Punctuation should be removed. No stemming should be applied. Typically a
  'copy field'.

  Required.

:raw-html:`<span class="elasticsearch">minSuggestionFreq</span><span class="solr">minSuggestionFrequency</span>`
  How many documents must contain a term in the dictionaryField before it is
  added as a synonym?

  Default: ``1``

minBreakLength
  The minimum number of characters a word part must have when splitting a
  compound.

  Default: ``3``

maxCombineLength
  The maximum number of characters a word can have when generating compounds.

  Default: ``30``

lowerCaseInput
  Lowercase the input query?

  Default: ``false``

decompound.maxExpansions
  If a compound can be split at more than one position, how many variants at
  maximum should be added as a synonym?

  Default: ``3``

decompound.verifyCollation
  Verify that parts of a split-up compound co-occur in the dictionaryField of
  a document?

  Default: ``false``

morphology
  Apply language-specific morphology in compound words. Currently only used
  for compound splitting. Available morphologies: ``DEFAULT``, ``GERMAN``.

  Default: ``DEFAULT``

reverseCompoundTriggerWords
  List of words for which the compound of the left and right neighbour tokens
  should be added as a synonym in reverse order (add synonym 'YX' to
  'X <triggerWord> Y').

  Default: (empty list)

alwaysAddReverseCompounds
  Create an additional compound from adjacent tokens after reversing their
  order? (also add synonym 'YX' to query 'X Y' in addition to synonym 'XY')

  Default: ``false``

Request
-------

No request parameters for the Word Break Rewriter.
