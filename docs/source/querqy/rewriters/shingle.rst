.. _querqy-rewriters-shingle:

================
Shingle Rewriter
================

The Shingle Rewriter combines adjacent query tokens into a new token and adds
this token to the query as a synonym. For example, if the user searches for
'wall mount tv', it would create the tokens 'wallmount' and 'mounttv' and
add them as synonyms, improving the recall of documents containing the
compound form 'wallmount'.

This rewriter is only available for Solr. You might want to consider using the
more powerful :ref:`Word Break Rewriter <querqy-rewriters-word-break>` for both,
Solr and Elasticsearch. Amongst other features, the Word Break Rewriter also
allows to add shingles to the query. It adds the option to validate the newly
created token against tokens in a 'dictionary field'.

Due to its simplicity, the
`source code <https://github.com/querqy/querqy/blob/master/querqy-core/src/main/java/querqy/rewrite/contrib/ShingleRewriter.java>`_
of the Shingle Rewriter is also a good starting point for writing your own
rewriter.

Reference
=========

Configuration
-------------

.. code-block:: xml

   <lst name="rewriter">
     <str name="class">querqy.solr.contrib.ShingleRewriterFactory</str>
     <bool name="acceptGeneratedTerms">false</bool>
   </lst>


acceptGeneratedTerms
  If true, also create shingle tokens from terms that were created by other
  rewriters earlier in the rewrite chain. Otherwise, only create shingles for
  tokens found in the original user query.

  Default: ``false``
