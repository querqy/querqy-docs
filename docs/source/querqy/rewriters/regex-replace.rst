.. _querqy-rewriters-regex-replace:

=======================
Regex Replace Rewriter
=======================

What it does
============

The Regex Replace Rewriter is a query preprocessing step that rewrites query tokens
using regular expression rules. It is similar in purpose to the
:ref:`Replace Rewriter <querqy-rewriters-replace>` but uses a custom regex engine
instead of simple prefix/suffix wildcards, giving you more expressive matching power.

Typical use cases include:

* Normalising measurement notations (``8 x 12`` → ``8x12``, ``32 gb ram`` → ``32gb``)
* Removing optional noise words from structured queries
* Standardising punctuation or whitespace variants of product identifiers

Rules are applied token-by-token across the query. When multiple rules match
different parts of the input, all of them are applied. When multiple rules match
the same part of the input, the later rule in the rule file wins.

.. note::

   The Regex Replace Rewriter is still experimental. It is recommended to use it
   for up to a few hundred patterns.

Setup
=====

.. tabs::

   .. group-tab:: Elasticsearch

      ``PUT  /_querqy/rewriter/regex_replace``

      .. code-block:: JSON
        :linenos:

        {
            "class": "querqy.elasticsearch.rewriter.RegexReplaceRewriterFactory",
            "config": {
                "rules": "(\\d+) ?x ?(\\d+) => ${1}x${2}",
                "ignoreCase": true
            }
        }

      The ``class`` property (line #2) references the Elasticsearch factory
      implementation.

      The ``config`` object (line #3) accepts the following properties:

      ``rules`` (required)
        A string containing the rewriting rules, one rule per line.
        Remember to JSON-escape the value (e.g. escape backslashes as ``\\``).

      ``ignoreCase`` (optional, default: ``true``)
        When ``true``, pattern matching is case-insensitive.

   .. group-tab:: OpenSearch

      Coming soon

   .. group-tab:: Solr

      Coming soon


Configuring rules
=================

Each non-empty line that does not start with ``#`` defines one rule. The format is:

.. code-block:: text

   <regex> => <replacement>

Characters following ``#`` on any line are treated as a comment and are ignored.

.. code-block:: text

   # This is a comment
   abc => def                           # replace "abc" with "def"
   a?bc => def                          # matches "abc" and "bc"
   (\d{2,3}) gb( ram)? => ${1}gb        # "32 gb ram" → "32gb", "128 gb" → "128gb"
   (\d+) ?x ?(\d+) => ${1}x${2}        # "8 x 12" → "8x12", "10 x16" → "10x16"

Supported regex syntax
======================

The Regex Replace Rewriter implements a custom regex engine that supports the
following subset of standard regex syntax.

**Literals**

.. code-block:: text

   x     matches the literal character 'x'

**Character classes**

.. code-block:: text

   \d    matches any digit (0–9)
   .     matches any single character

**Ranges**

.. code-block:: text

   [def]                  matches 'd', 'e', or 'f'
   [a-zA-Z0-9&&[^bc]]    matches a letter or digit that is not 'b' or 'c'

**Quantifiers**

.. code-block:: text

   ?         zero or one occurrence
   +         one or more occurrences
   *         zero or more occurrences (Kleene star)
   {min,max} between min and max occurrences, e.g. \d{2,4}
   {min,}    min or more occurrences

**Grouping and backreferences**

Parentheses create numbered capture groups. Captured text can be referenced in
the replacement using ``${n}``, where ``n`` is the group index (following the
same numbering convention as Java Regex — see
`java.util.regex.Pattern <https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html>`_):

.. code-block:: text

   (height) (\d+) ?cm => h: ${2}0mm

For nested groups the numbering follows left-to-right opening-parenthesis order:

.. code-block:: text

   Pattern: ((A)(B(C)))

   Group 1: ((A)(B(C)))
   Group 2: (A)
   Group 3: (B(C))
   Group 4: (C)

**Alternatives**

.. code-block:: text

   a(b|c)d   matches "abd" and "acd"

Rule ordering
=============

When two rules match the **same part** of the input, the later rule in the rule
file wins. Given:

.. code-block:: text

   a(b|c)d => xyz
   abc => klm

the input ``abc`` is replaced with ``klm`` because the second rule appears later.

When rules match **different parts** of the input, all rules are applied:

.. code-block:: text

   abc => klm
   def => xyz

The input ``abc def`` produces the output ``klm xyz``.

Current limitations
===================

* It is not possible to anchor a rule to the complete input — a rule for ``def``
  will also match ``abc def``, not only the input ``def`` in isolation.
* The rewriter is intended for up to a few hundred patterns. For larger rule
  sets, consider the :ref:`Replace Rewriter <querqy-rewriters-replace>`
  or the :ref:`Common Rules Rewriter <querqy-rewriters-common-rules>`.
