.. _smui-quickstart:

===============
Quickstart SMUI
===============

TODO Intro

::

   cd /into/smui/repository/path
   docker-compose up

It is all set up and you are ready to use SMUI now.

* Open SMUI in a browser under http://localhost:9000.
* TODO Setup a first DeploymentChannel
* Maintain search inputs and rules.
* Deploy and see how the resulting rules.txt file was generated into the `export` folder of the SMUI docker container:

::

   docker exec smui-smui cat /TODO/export/rules.txt

You can also query the resulting rules.txt file via SMUI's REST interface:

::

   curl http://localhost:9000/TODO/rules.txt
