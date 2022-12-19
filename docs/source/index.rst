========
Welcome!
========

querqy.org is an umbrella for open source tools and libraries that
helps you create a powerful e-commerce search platform quickly, with a focus on
optimising search relevance from day one, beyond the out-of-the-box capabilities
of the Solr, Elasticsearch and OpenSearch search engines.

What's included?
================

*Querqy*
  A query rewriting library. It helps you to tune your search results for
  specific search terms. It also comes with some query-independent search
  relevance optimisations. You can plugin in your own query rewriter. Available
  for Solr, Elasticsearch and OpenSearch.
*SMUI*
  Search Management UI. A web UI to manage rules for query rewriting with
  Querqy (query-dependent synonyms, filters, boost/demote documents, ...)
  Supports rule management per language, multiple rule deployment targets,
  per-tenant rules. Currently available for Solr.
*Chorus*
  Docker compose based reference implementations for Solr and Elasticsearch to ramp up your
  search project quickly.

Where to go from here
=====================


**Chorus:** You can see all components in action together using the Chorus
Docker image. :ref:`Get started here <chorus-index>`!


**Querqy:** If you want to install Querqy under Solr, Elasticsearch or
OpenSearch, :ref:`get started here <querqy-index>`!

**Further quick links:**

* Setting up SMUI (requires Querqy)
* Querqy :ref:`'Common Rules Rewriter' <querqy-rewriters-common-rules>`
  (synonyms, boostings, filters etc.)


.. toctree::
   :glob:
   :maxdepth: 4
   :caption: Querqy
   :includehidden:
   :hidden:

   querqy/index
   querqy/rewriters
   querqy/more-about-queries
   querqy/logging-and-debugging-rewriters
   querqy/elasticsearch-plugin-configuration
   querqy/solr-plugin-configuration
   querqy/release-notes
   querqy/older-querqy-versions
   querqy/contributors

.. toctree::
   :glob:
   :maxdepth: 4
   :caption: Search Management UI (SMUI)
   :hidden:

   smui/index
   smui/quickstart
   smui/config
   smui/using-smui
   smui/dev-setup
   smui/release-notes
   smui/contributors

.. toctree::
   :glob:
   :maxdepth: 4
   :caption: Chorus
   :hidden:

   chorus/*
