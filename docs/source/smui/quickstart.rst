.. _smui-quickstart:

===============
SMUI quickstart
===============

SMUI is meant to be run as a Docker container and thus provides an `official image`_.

.. _official image: https://hub.docker.com/r/querqy/smui

To quickly get SMUI up and running on your machine, you may use the bundled `docker-compose file`_:

.. _docker-compose file: https://github.com/querqy/smui/blob/master/docker-compose.yaml

.. code:: bash

    git clone https://github.com/querqy/smui.git smui
    cd smui
    docker-compose up

Alternatively, you may start the containers manually like this:

.. code:: bash

    # Launch a MariaDB database container (running in the background)
    docker run -d \
        -e MYSQL_DATABASE=smui \
        -e MYSQL_USER=smui \
        -e MYSQL_PASSWORD=smui \
        -e MYSQL_RANDOM_ROOT_PASSWORD=yes \
        --name smui-mariadb \
        mariadb:10
    # Run SMUI
    docker run -p 9000:9000 \
        --link=smui-mariadb \
        -e SMUI_DB_URL=jdbc:mysql://smui-mariadb/smui \
        querqy/smui

The first call runs a MariaDB container containing the database `smui`, with the user `smui` (password: `smui`) having
sufficient permissions on the database. The second call runs the latest version of SMUI, serving its content on http://localhost:9000.

Before you manage your first search input with SMUI, you need to create a Deployment Channel:

::

   curl -Ss -X PUT -H "Content-Type: application/json" -d '{"name":"ecommerce", "description":"Ecommerce Demo"}' http://localhost:9000/api/v1/solr-index

Now, everything is all set up and you are ready to use SMUI. You now may create and manage search inputs and rules.
You can also download the resulting rules.txt file via the SMUI REST interface:

::

   curl -Sso rules.zip http://localhost:9000/api/v1/allRulesTxtFiles

You will receive a ZIP file (``rules.zip``) containing the rules.txt for the configured channel..

That's a minimum setup to explore the capabilities of SMUI. Visit :ref:`the installation and full configuration guide <smui-config>`
to learn more about how to properly configure SMUI for your production setup.
