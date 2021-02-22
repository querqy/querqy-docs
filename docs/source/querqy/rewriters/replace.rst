.. _querqy-rewriters-replace:

================
Replace Rewriter
================

What it does
============

The Replace Rewriter is considered to be a preprocessor for other rewriters. In contrast to
the Common Rules Rewriter, its main scope is to handle different variants of terms rather
than enhancing the query by business logic.

For instance, the term ``smartphone`` might be needed to be defined as a synonym for the term
``mobile`` in a subsequent rewriter (Common Rules Rewriter in this case). Let's assume
that both terms exist somehow in the index and have a slightly different meaning, so
it is required not only to apply a synonym for these terms, but also a down-boost rule,
which is configured in the Common Rules Rewriter as well.

Let's now assume that it is expected that this rule is not only applied if the user input is
``mobile``, but also if it is ``mobiles`` or ``ombile`` or ``mo bile``. One possibility is to
define the rule multiple times in the Common Rules Rewriter, but this might lead to a configuration
that is spilled by repetitive rules that are finally supposed to do exactly the same. Another
approach is to use the Replace Rewriter in order to standardize all mentioned variants to
``mobile``. Furthermore, the rewriter supports the handling of term variations in a more generic
way using prefix and suffix wildcards.


Setup
=====

As a first step, the Replace Rewriter is configured

.. include:: ../se-section.txt

.. rst-class:: elasticsearch

.. raw:: html

 <div>

``PUT  /_querqy/rewriter/replace``

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 4-7

   {
       "class": "querqy.elasticsearch.rewriter.ReplaceRewriterFactory",
       "config": {
            "rules":  "mobiles => mobile",
            "ignoreCase": true,
            "inputDelimiter": ";",
            "querqyParser": "querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory"
       }
   }

.. raw:: html

 </div>

.. rst-class:: solr

.. raw:: html

 <div>

**Querqy 5**

| :code:`POST /solr/mycollection/querqy/rewriter/replace?action=save`
| :code:`Content-Type: application/json`

.. code-block:: JSON
   :linenos:
   :emphasize-lines: 4-7

   {
       "class": "querqy.solr.rewriter.replace.ReplaceRewriterFactory",
       "config": {
            "rules":  "mobiles => mobile",
            "ignoreCase": true,
            "inputDelimiter": ";",
            "querqyParser": "querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory"
       }
   }


**Querqy 4**

.. code-block:: xml
   :linenos:

   <lst name="rewriter">
     <str name="class">querqy.solr.contrib.ReplaceRewriterFactory</str>
     <str name="rules">replace-rules.txt</str>
     <str name="ignoreCase">true</str>
     <str name="inputDelimiter">;</str>
     <str name="querqyParser">querqy.rewrite.commonrules.WhiteSpaceQuerqyParserFactory</str>
   </lst>

.. raw:: html

    </div>

The replace rules must be specified in a property ``rules`` (Elasticsearch,
Querqy 5 for Solr). Remember to JSON-escape the value of this property.

In Querqy 4 for Solr, ``rules`` references a file in  ZooKeeper that contains
the rules. The property`` ignoreCase`` defines whether the rewriter
differentiates between upper- and lowercase when matching query terms to rule
inputs (default is ``true``). The property ``inputDelimiter`` enables to
configure different input definitions for the same output, separated by the
configured delimiter (default is tab).


Configuring simple replace rules
================================

Each line contains one rule definition, except for empty lines or lines starting with ``#``.
The input and the output of a rule must be separated by ``=>``. For simple replace rules, which
map input terms directly to output terms, multiple inputs can be configured for the same output.
The inputs must be delimited using the configured delimiter. Both the input and the output can
comprise multiple terms.

.. code-block:: Text
   :linenos:

   # comments
   mobiles; ombile; mo bile => mobile
   cheapest smartphones => cheap smartphone


Deleting terms
==============

Terms can be deleted simply by not defining an output. This is e. g. helpful to handle terms in
the query without a semantic meaning (outside of Lucene analyzers). In combination with
replacements, deleting terms is additionally useful to handle standalone special characters on a
granular level.

.. code-block:: Text
   :linenos:

   # comments
   the =>
   /; , =>
   + => plus

The above rules will remove the term ``the`` out of queries. Furthermore, standalone ``/`` or ``,``
characters in the query will be deleted, whereas a standalone ``+`` character will be mapped to
``plus``.


Configuring prefix replace rules
================================

In several cases, it is helpful not to map terms to terms directly, but to use wildcards.
The above rule ``cheapest mobiles`` could be required to work in a more generic manner.
This can be achieved, by using a prefix wildcard for the term ``cheapest``.

.. code-block:: Text
   :linenos:

   cheap* => cheap

This rule will map the terms ``cheaper``, ``cheapest``, ``cheaply`` and all other terms starting
with ``cheap`` to the term ``cheap``. In contrast to the Common Rules Rewriter, input terms with a
wildcard even match to a term if the term matches exactly to the prefix. It has to be taken into
account, that the output of the rule is not needed to match to the prefix part of the input. Any
output could be defined here (e. g. ``inexpensive``).

Additionally, the rewriter supports handling the wildcard match. This is e. g. helpful for
handling typical spellings in a more generic manner or for splitting terms. The wildcard match
can be added to the output using ``$1``.

.. code-block:: Text
   :linenos:

   samrt* => smart$1
   computer* => computer $1

The above rules will e. g. map ``samrtwatch`` to ``smartwatch`` or ``samrtphone`` to
``smartphone``. Furthermore, terms like ``computerdesk`` will be mapped to ``computer desk``.


Configuring suffix replace rules
================================

The rewriter furthermore supports using wildcards at the beginning of terms for suffix matches.
This is helpful for handling typical variations of term endings (e. g. singular-plural). The suffix
wildcard is used in the same way like the prefix wildcard.

.. code-block:: Text
   :linenos:

   *phones => $1phone
   *hpone => $1phone
   *hpones => $1phone

The above rules will map ``iphones`` to ``iphone``, ``smarthpones`` to ``smartphone`` or
``smarthpone`` to ``smartphone``.

The suffix wildcard is also helpful to handle special characters at the end of terms in a generic
way.

.. code-block:: Text
   :linenos:

   *+ => $1 plus
   *. => $1
   *) => $1
   (* => $1

The above rules will e. g. map terms like ``s8+`` to ``s8 plus`` or remove dots at the end of
terms. The combination of a prefix and a suffix rule for brackets will map terms like ``(2018)``
to ``2018``.


Order of rules
==============

The three types of replace rules are applied in the following order:

* Simple mappings
* Suffix mappings
* Prefix mappings

Applying the simple mappings before the wildcard mappings helps to apply edge case mappings
before the more generic wildcard mappings are applied.


(Current) Limitations
=====================

* Using multiple wildcards in the same input is not supported (e. g. ``\*input\*``).
* The rewriter does not support defining multiple input terms for a wildcard rule
  (e. g. ``term1 term2*``).
* Using delimiters to configure multiple inputs for the same output is only supported for
  simple replace rules not containing a wildcard.
