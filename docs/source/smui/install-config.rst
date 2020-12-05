.. _smui-install-config:

=========================================
Installation and full configuration guide
=========================================

Create and configure database
-----------------------------

SMUI needs a database backend in order to manage and store search
management rules.

Supported (tested) databases:

Generally SMUI database connection implementation is based on JDBC and
only standard SQL is used, so technically every database management
system supported by JDBC should feasible when using SMUI. However as
database management systems potentially come with specific features,
SMUI explicity is tested (and/or productively used) only with the
following database management systems:

-  MySQL & MariaDB
-  PostgreSQL
-  SQLite
-  HSQLDB

You can decide, where your database backend application should be run
and host its data. In an productive environment, e.g. you could run a
docker based database application (e.g.
`https://hub.docker.com/_/mariadb <official%20dockerhub%20MariaDB%20image>`__)
within the same (docker) network like SMUI. However, for the sake of
simplicity, the following sections assumes you have a local (MariaDB)
database application running on the host environment.

Create SMUI database, user and assign according permissions. Example
script (SQL, MariaDB / MySQL):

::

   CREATE USER 'smui'@'localhost' IDENTIFIED BY 'smui';
   CREATE DATABASE smui;
   GRANT ALL PRIVILEGES ON smui.* TO 'smui'@'localhost' WITH GRANT OPTION;

Migrate pre-v2 SMUI databases
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As of version 3.3 it has become possible to migrate prior version’s
search management input and rules via the ``rules.txt`` file. See
“Import existing rules.txt” for details.

Install SMUI application (using docker image or Docker Hub repository)
----------------------------------------------------------------------

Use SMUI docker image from Docker Hub (recommended)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SMUI is also integrated into a Travis CI build pipeline, that provides a
Docker Hub SMUI image. You can pull the latest SMUI (master branch) from
its public dockerhub repository, e.g. (command line):

::

   docker pull querqy/smui:latest

Manually build the SMUI docker container
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SMUI provides a `Makefile <Makefile>`__ to help you with the manual
docker build process. You can use ``make`` to build as a docker
container, e.g. (command line):

::

   make docker-build-only

NOTE: If you are not having ``make`` available, you can manually
reproduce the according ``docker build`` command.

Minimum SMUI configuration and start of the application
-------------------------------------------------------

SMUI is configured passing environment variables to the docker container
SMUI runs on. The following section describes all parameters, that you
can configure SMUI with. Mappings of config keys to environment
variables can be found in ``application.conf``
(e.g. ``SMUI_DB_JDBC_DRIVER`` environment variable sets
``db.default.driver``).

NOTE: Environment variables are the preferred way to configure your
production environment. In contrast, while developing (outside a docker
environment) it is possible to use a local ``smui-dev.conf`` file (see
“DEVELOPMENT SETUP”).

The following sections describe application configs in more detail.

Configure basic settings
~~~~~~~~~~~~~~~~~~~~~~~~

The following settings can (and should) be overwritten on
application.conf in your own ``smui-prod.conf`` level:

.. list-table:: SMUI basic settings
   :widths: 20 50 30
   :header-rows: 1

   * - Config key
     - Description
     - Default
   * - ``db.default.driver``
     - JDBC database driver
     - MySQL database on localhost for ``smui:smui``.
   * - ``db.default.url``
     - Database host and optional connection parameters (JDBC connection string).
     - MySQL database on localhost for ``smui:smui``.
   * - ``db.default.username`` and ``db.default.password``
     - Database credentials.
     - MySQL database on localhost for smui:smui.
   * - ``smui2solr.SRC_TMP_FILE``
     - Path to temp file (when ``rules.txt`` generation happens)
     - local /tmp file in docker container (recommended: leave default). WARNING: Deprecated as of v3.4, will be replaced soon.
   * - ``smui2solr.DST_CP_FILE_TO``
     - ``/usr/bin/solr/defaultCore/conf/rules.txt``
     - LIVE ``rules.txt`` destination file for the default deployment script. See “Details on rules.txt deployment” for more info. WARNING: Deprecated as of v3.4, will be replaced soon.
   * - ``smui.deployment.git.repo-url``
     - Needed for git deployment (see “Deploy rules.txt to a git target“).
     - Empty.
   * - ``smui2solr.deployment.git.filename.common-rules-txt``
     - Bare filename of the common ``rules.txt`` file, that should be pushed to the git repository.
     - ``rules.txt``
   * - ``smui2solr.SOLR_HOST``
     - Solr host
     - Virtual local Solr instance. WARNING: Deprecated as of v3.4, will be replaced soon.
   * - ``play.http.secret.key``
     - Encryption key for server/client communication (Play 2.6 standard)
     - unsecure default.

Start SMUI (docker) application
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Using the config key’s environment variable equivalents (as defined in
the ``application.conf``), the following start
command can be used to bootstrap the SMUI (docker) application.

NOTE: For security reasons, within the docker container, SMUI is run as
``smui`` user (group: ``smui``) with a ``uid`` of ``1024``. For
rules.txt deployment onto the host file system, you need to make sure,
that an according user (``uid``) exists on the host (see “Details on
rules.txt deployment” for more info).

A minimum start command can look like this (working with the default
setup as described above) running SMUI on its default port 9000, e.g.
(command line):

::

   docker run \
     -p 9000:9000 \
     -v /tmp/smui_deployment_path:/usr/bin/solr/defaultCore/conf \
     querqy/smui

This will deploy a ``rules.txt`` to the ``/tmp/smui_deployment_path`` of
the host (if user and permission requirements are set accordingly).

NOTE: In a productive scenario, you can as well use a
``docker-compose.yml`` to define the SMUI (docker) runtime environment.

Full feature configuration for SMUI
-----------------------------------

The following sections describe:

-  Configuration of the application behaviour / feature toggles
   (e.g. rule tagging)
-  Details and options for the deployment (of Querqy’s ``rules.txt``
   file)
-  Configuration of authentication

Configure application behaviour / feature toggles
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Optional. The following settings in the ``application.conf`` define its
(frontend) behaviour:

.. list-table:: SMUI advanced application settings
   :widths: 20 50 30
   :header-rows: 1

   * - Config key
     - Description
     - Default
   * - ``toggle.ui-concept.updown-rules.combined``
     - Show UP(+++) fields instead of separated rule and intensity fields.
     - ``true``
   * - ``toggle.ui-concept.all-rules.with-solr-fields``
     - Offer a separated “Solr Field” input to the user (UP/DOWN, FILTER).
     - ``true``
   * - ``toggle.rule-deployment.log-rule-id``
     - With every exported search input, add an additional ``@_log`` line that identifies the ID of the rule (if info logging in the search-engine / Solr for querqy is activated, see ``querqy.infoLogging= on``, it is being communicated in the search-engine’s / Solr response).
     - ``false``
   * - ``toggle.rule-deployment.split-decompound-rule-txt``
     - Separate decompound synonyms (``SOME\* => SOME $1``) into a separated rules.txt file. WARNING: Activating this results in the need of having the second special-purpose-DST_CP_FILE_TO configured (see below). Temp file path for this purpose will be generated by adding a ``-2`` to ``smui2solr.SRC_TMP_FILE``. WARNING: Deprecated as of v3.4, will be replaced soon.
     - ``false``
   * - ``toggle.rule-deployment.split-decompound-rule-txt-DST_CP_FILE_TO``
     - Path to productive querqy ``decompound-rules.txt`` (within Solr context). WARNING: Deprecated as of v3.4, will be replaced soon.
     -  Example content, that needs to be adjusted, if split for decompound rules.txt has been activated.
   * - ``toggle.rule-deployment.pre-live.present``
     - Make separated deployments PRELIVE vs. LIVE possible (and display a button for that on the frontend).
     - ``false``
   * - ``smui2solr.deploy-prelive-fn-rules-txt``
     - PRELIVE ``rules.txt`` destination file for the default deployment script. See “Details on rules.txt deployment” for more info.
     -  ``/usr/bin/solr/defaultCore/conf/rules.txt``
   * - ``smui2solr.deploy-prelive-solr-host``
     - Host and port (e.g. ``localhost:8983``) of Solr PRELIVE instance. If left empty, the default deployment script will not trigger a core reload after deployment.
     - Empty. In case core reload on PRELIVE deployments should be triggered, this needs to be set.
   * - ``smui2solr.deploy-prelive-fn-decompound-txt``
     - Separate decompound synonyms for PRELIVE (see above).
     -  ``/usr/bin/solr/defaultCore/conf/rules-decompound.txt``
   * - ``toggle.rule-deployment.custom-script``
     - If set to ``true`` the below custom script (path) is used for deploying the rules.txt files.
     - ``false``
   * - ``toggle.rule-deployment.custom-script-SMUI2SOLR-SH_PATH``
     - Path to an optional custom script (see above).
     - Example content, that needs to be adjusted, if a custom deployment script is activated.
   * - ``toggle.rule-tagging``
     - Should tagging feature be activated.
     - ``false``
   * - ``toggle.predefined-tags-file``
     - Path to optional file, that provides pre-defined rule tags (see “Configure predefined rule tags”).
     -
   * - ``smui.auth.ui-concept.simple-logout-button-target-url``
     - Target URL of simple logout button (see "Configure Authentication").
     -
   * - ``toggle.activate-spelling``
     - Activate spelling items: Add spelling items to maintain common misspellings using the querqy replace rewriter. The spelling items are exported in a seperate replace_rules.txt that is uploaded to Solr.
     - ``false``
   * - ``toggle.ui-list.limit-items-to``
     - Activate list limitation: Limits the list of visible items to the configured number and shows toggle button (*"show more/less"*). Set value to -1 to deactivate list limitation.
     - ``-1``
   * - ``smui2solr.replace-rules-tmp-file``
     - Path to temp file (when ``replace_rules.txt`` generation happens)
     - ``/tmp/search-management-ui_replace-rules-txt.tmp``
   * - ``smui2solr.replace-rules-dst-cp-file-to``
     - ``/usr/bin/solr/defaultCore/conf/rules.txt``
     - ``/usr/bin/solr/liveCore/conf/replace-rules.txt``
   * - ``smui2solr.deploy-prelive-fn-replace-txt``
     - PRELIVE ``replace_rules.txt`` destination file for the default deployment script. See “Details on rules.txt deployment” for more info.
     -  ``/usr/bin/solr/preliveCore/conf/replace-rules.txt``
   * - ``toggle.display-username.default``
     - Default username for being displayed on the frontend, if no username is available (e.g. for event history).
     - ``Anonymous Search Manager``
   * - ``toggle.activate-eventhistory``
     - Persist an event history for all updates to the search management configuration, and provide an activity log for the search manager. WARNING: If this setting is changed over time (especially from ``true`` to ``false``) events in the history might get lost!
     - ``false``
   * - ``toggle.ui-concept.custom.up-down-dropdown-mappings``
     - Provide custom mapping / step sizes for UP/DOWN boosting/penalising values as JSON (used, if ``toggle.ui-concept.updown-rules.combined`` is set to ``true``). See below for details.
     - ``null`` (No custom mappings)

NOTE: The above described feature toggles are passed to SMUI’s docker
container using according environment variables. The mappings can be
found in the ``application.conf``.

Configure predefined rule tags (optional)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Optional. You can define pre-defined rule tags, that can be used by the
search manager to organise or even adjust the rules exported to the
rules.txt. See
`TestPredefinedTags.json <test/resources/TestPredefinedTags.json>`__ for
structure.

Configure custom UP/DOWN dropdown mappings (optional)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

SMUI makes life easier when dealing with UP/DOWN boosting/penalising intensities. It translates raw values passed to querqy to a more comprehensible format to the search manager working with ``+++`` and ``---`` on the frontend. By default a typical intensity range from ``500`` to ``5`` is covered, which should work with most search engine (e.g. Solr) schema configurations and the according querqy setup.

However, if SMUI's default does not match the specific needs, the default can be adjusted. This can be achieved by passing a JSON object, describing the desired custom UP/DOWN dropdown mappings to SMUI while using the ``toggle.ui-concept.custom.up-down-dropdown-mappings`` configuration. The JSON is passed as a raw string, that is then validated by SMUI.

Note: If for any reason your custom mappings do not apply, check SMUI's (error) logs, as it is likely, that the validation yielded an error.

::

   toggle.ui-concept.custom.up-down-dropdown-mappings="[{\"displayName\":\"UP(+++++)\",\"upDownType\":0,\"boostMalusValue\":750},{\"displayName\":\"UP(++++)\",\"upDownType\":0,\"boostMalusValue\":100},{\"displayName\":\"UP(+++)\",\"upDownType\":0,\"boostMalusValue\":50},{\"displayName\":\"UP(++)\",\"upDownType\":0,\"boostMalusValue\":10},{\"displayName\":\"UP(+)\",\"upDownType\":0,\"boostMalusValue\": 5},{\"displayName\":\"DOWN(-)\",\"upDownType\":1,\"boostMalusValue\": 5},{\"displayName\":\"DOWN(--)\",\"upDownType\":1,\"boostMalusValue\": 10},{\"displayName\":\"DOWN(---)\",\"upDownType\":1,\"boostMalusValue\": 50},{\"displayName\":\"DOWN(----)\",\"upDownType\":1,\"boostMalusValue\": 100},{\"displayName\":\"DOWN(-----)\",\"upDownType\":1,\"boostMalusValue\": 750}]"

Here is Docker example (command line):

::

   docker run \
   ...
     -e SMUI_CUSTOM_UPDOWN_MAPPINGS="[{\"displayName\":\"UP(+++++)\",\"upDownType\":0,\"boostMalusValue\":750},{\"displayName\":\"UP(++++)\",\"upDownType\":0,\"boostMalusValue\":100},{\"displayName\":\"UP(+++)\",\"upDownType\":0,\"boostMalusValue\":50},{\"displayName\":\"UP(++)\",\"upDownType\":0,\"boostMalusValue\":10},{\"displayName\":\"UP(+)\",\"upDownType\":0,\"boostMalusValue\": 5},{\"displayName\":\"DOWN(-)\",\"upDownType\":1,\"boostMalusValue\": 5},{\"displayName\":\"DOWN(--)\",\"upDownType\":1,\"boostMalusValue\": 10},{\"displayName\":\"DOWN(---)\",\"upDownType\":1,\"boostMalusValue\": 50},{\"displayName\":\"DOWN(----)\",\"upDownType\":1,\"boostMalusValue\": 100},{\"displayName\":\"DOWN(-----)\",\"upDownType\":1,\"boostMalusValue\": 750}]"
   ...

Note: Quotations used for JSON attributes/values must be escaped (``\"``) in complete string sequence!

Details and options for the deployment (``rules.txt``)
------------------------------------------------------

The default deployment script supports ``cp`` or ``scp`` file transfer
method to deploy the ``rules.txt`` and ``replace_rules.txt`` and triggers a Solr core on the
target system, if configured accordingly. Its behaviour is controlled
using the config variables above, e.g.:

::

   docker run \
     ...
     -e SMUI_2SOLR_DST_CP_FILE_TO=remote_user:remote_pass@remote_host:/path/to/live/solr/defaultCore/conf/rules.txt \
     -e SMUI_2SOLR_SOLR_HOST=remote_solr_host:8983 \
     -e SMUI_DEPLOY_PRELIVE_FN_RULES_TXT=/mnt/prelive_solr_depl/rules.txt \
     -e SMUI_DEPLOY_PRELIVE_SOLR_HOST=docker_host:8983 \
     ...
     -v /path/to/prelive/solr/defaultCore/conf:/mnt/prelive_solr_depl
     ...
     querqy/smui

(config parameters are expressed as according environment variable
names, like applicable in a docker setup, see ``application.conf``)

In this particular example, the LIVE instance of Solr runs on
``remote_solr_host`` and can be reached by ``remote_user`` on
``remote_host`` for ``rules.txt`` deployment (NOTE: ``remote_host`` as
well as ``remote_solr_host`` might even be the same instance, but just
have differing network names). ``scp`` will be chosen by the default
deployment script. In contrast to that, the PRELIVE instance of Solr
resides on the ``docker_host``. File deployment is ensured using an
according docker volume mount. ``cp`` will be chosen.

NOTE: The example above also accounts for
``SMUI_TOGGLE_DEPL_DECOMPOUND_DST`` and
``SMUI_DEPLOY_PRELIVE_FN_DECOMPOUND_TXT``, when
``SMUI_TOGGLE_DEPL_SPLIT_DECOMPOUND`` is set to ``true``.

NOTE: The example above also accounts for
``SMUI_2SOLR_REPLACE_RULES_DST_CP_FILE_TO`` and
``SMUI_DEPLOY_PRELIVE_FN_REPLACE_TXT``, when
``SMUI_TOGGLE_SPELLING`` is set to ``true``.

Deploy rules.txt to a git target
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The SMUI docker container comes with an alternative
deployment script for deployment to git, which is located under
``conf/smui2git.sh``.

NOTE: Your ``rules.txt`` repository needs to be initialised with (at least) the empty files, you would like to get managed by SMUI on the ``master`` branch (or branch you would like SMUI to deploy to).

The ``conf/smui2git.sh`` main deployment script uses the
alternative git deployment script, in case a ``GIT`` deployment target
is supplied (for the specific target system). You can use the following
setting to force git deployment for the ``LIVE`` stage, e.g. (command
line):

In the docker container the git deployment will be done in the
``/tmp/smui-git-repo`` path. You need to make sure, that identification is provided to the SMUI docker
environment:

The following example illustrates how to configure SMUI and pass host's identity:

::

   docker run \
     ...
     -v ~/.ssh/id_rsa:/smui/.ssh/id_rsa \
     -v ~/.gitconfig:/home/smui/.gitconfig \
     ...
     -e SMUI_2SOLR_DST_CP_FILE_TO="GIT" \
     -e SMUI_DEPLOYMENT_GIT_REPO_URL="ssh://git@repo-host.tld/smui_rulestxt_repo.git" \
     ...
     querqy/smui

NOTE:

* When working with remote git locations, it might be necessary to also add your git repo host to SMUI's ``/home/smui/.ssh/known_hosts``.
* As of v3.11.5 only deployment of the common rules.txt file is supported (neither decompound- nor replace-rules.txt files). Support for that might be added in future releases.
* Currently only git deployment to the LIVE instance is possibe.

Configuration of authentication
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SMUI is shipped with HTTP Basic and JWT Authentication support.

Basic Authentication
''''''''''''''''''''

This is telling every controller method (Home and ApiController) to use
the according authentication method as well as it tells SMUI’s
``BasicAuthAuthenticatedAction`` username and password it should use.
Basic Auth can be turned on in the extension by configuring an
``smui.authAction`` in the config file, e.g.:

::

   # For Basic Auth authentication, use SMUI's BasicAuthAuthenticatedAction (or leave it blanked / commented out for no authentication), e.g.:
   smui.authAction = controllers.auth.BasicAuthAuthenticatedAction
   smui.BasicAuthAuthenticatedAction.user = smui_user
   smui.BasicAuthAuthenticatedAction.pass = smui_pass

JWT Authentication
^^^^^^^^^^^^^^^^^^

::

   smui.authAction="controllers.auth.JWTJsonAuthenticatedAction"

.. list-table:: SMUI advanced application settings
   :widths: 20 50 30
   :header-rows: 1

   * - Config key
     - Description
     - Default
   * - ``smui.JWTJsonAuthenticatedAction.login.url``
     - The URL to the login page (e.g. https://loginexample.com/login.html?callback=https://redirecturl.com)
     -
   * - ``smui.JWTJsonAuthenticatedAction.cookie.name``
     - Name of cookie that contains the Json Web Token (JWT)
     - ``jwt_token``
   * - ``smui.JWTJsonAuthenticatedAction.public.key``
     - The public key to verify the token signature.
     -
   * - ``smui.JWTJsonAuthenticatedAction.algorithm``
     - The algorithms that should be used for decoding (options: ‘rsa’, ‘hmac’, ‘asymmetric’, ‘ecdsa’)
     - ``rsa``
   * - ``smui.JWTJsonAuthenticatedAction.authorization.active``
     - Activation of authorization check
     - ``false``
   * - ``smui.JWTJsonAuthenticatedAction.authorization.json.path``
     - The JSON path to the roles saved in the JWT
     - ``$.roles``
   * - ``smui.JWTJsonAuthenticatedAction.authorization.roles``
     - Roles (comma separated) of roles, that are authorized to access SMUI
     - ``admin``

Example of decoded Json Web Token:

.. code:: json

   {
     "user": "Test Admin",
     "roles": [
       "admin"
     ]
   }

Logout
^^^^^^

In this setup SMUI can provide a simple logout button, that simply sends
the user to a configured target URL:

::

   smui.auth.ui-concept.simple-logout-button-target-url="https://www.example.com/logoutService/"

Custom Authentication
^^^^^^^^^^^^^^^^^^^^^

You can also implement a custom authentication action and tell SMUI to
decorate its controllers with that, e.g.:

::

   smui.authAction = myOwnPackage.myOwnAuthenticatedAction

See “Developing Custom Authentication” for details.

Create SMUI admin data initially (via REST interface)
-----------------------------------------------------

Once the database scheme has been established, the initial data can be
inserted. SMUI supports a REST interface to PUT admin entities (like the
following) into the database.

Solr Collections to maintain Search Management rules for
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

There must exist a minimum of 1 Solr Collection (or
querqy/\ ``rules.txt`` deployment target), that Search Management rules
are maintained for. This must be created before the application can be
used. Example ``curl`` (relative to ``localhost:9000``):

::

   curl -X PUT -H "Content-Type: application/json" -d '{"name":"core_name1", "description":"Solr Search Index/Core #1"}' http://localhost:9000/api/v1/solr-index
   [...]

NOTE: ``solr-index/name`` (in this case ``core_name1``) will be used as
the name of the Solr core, when performing a Core Reload (see
``smui2solr.sh``).

Initial Solr Fields
~~~~~~~~~~~~~~~~~~~

Optional. Example ``curl`` (relative to ``localhost:9000``):

::

   curl -X PUT -H "Content-Type: application/json" -d '{"name":"solr-field-1"}' http://localhost:9000/api/v1/{SOLR_INDEX_ID}/suggested-solr-field
   [...]

Where ``solr-field-1`` refers to the field in your configured Solr
schema you would like to make addressable to the Search Manager.
``{SOLR_INDEX_ID}`` refers to the index ID created by the ``solr-index``
call above.

Refresh Browser window and you should be ready to go.
