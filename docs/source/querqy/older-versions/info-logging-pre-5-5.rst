.. _info-logging-before-5-5:

Solr Info Logging before 'Querqy for Solr' 5.5
----------------------------------------------

.. warning:: This page contains information about how to set up info logging
  before 'Querqy for Solr' version **5.5.lucene900.0**. Documentation for newer
  Querqy versions can be found :ref:`here <logging-and-debugging-rewriters>`.


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
