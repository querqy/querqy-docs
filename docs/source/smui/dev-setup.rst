.. _smui-dev-setup:

===============
Developing SMUI
===============

The SMUI sources are hosted on the corresponding `GitHub repository`_.

.. _GitHub repository: https://github.com/querqy/smui

For development and building, you will need

- `docker`_ with `BuildKit`_ capabilities (i.e. version 18.09 or higher)
- `docker-compose`_ (optional)
- Java Runtime Environment
- NodeJS
- `sbt`_
- `GNU make`_

.. _docker: https://www.docker.com/
.. _docker-compose: https://docs.docker.com/compose/
.. _BuildKit: https://docs.docker.com/develop/develop-images/build_enhancements/
.. _sbt: https://www.scala-sbt.org/download.html
.. _GNU make: https://www.gnu.org/software/make/

Building SMUI
-------------

The code repository provides a Makefile for creating the SMUI docker image. In the project root, run

::

    make docker-build-only

This will build both the backend and frontend components in a dockerized environment and create and tag the following
images: ``querqy/smui:latest`` and ``querqy/smui:$VERSION``, where `$VERSION` is the version given in the build.sbt file.

If you want to only build the fat jar itself, e.g. to build your own docker image, you may do so by running `sbt`:

::

    sbt assembly

Running SMUI locally
--------------------

When working on the SMUI sources, building a docker image on each change
would be very time-consuming. Therefore, you may run a local development
server by running:

::

    make serve

The SMUI frontend will then be available on http://localhost:4200 , and the backend on http://localhost:9000.
``make serve`` assumes a MySQL/MariaDB instance, as outlined in the :ref:`SMUI quickstart<smui-quickstart>`
documentation. Alternatively, you may customize the database configuration. See :ref:`Development configuration<smui-dev-config>`
below.

The development server is hot-reloading, i.e. will recompile on changes in the source files.

.. _smui-dev-config:

Development configuration
-------------------------

For developing new features and testing the application with different types
of configuration, it is recommended to create a local development
configuration of the application (instead of the productive one
described above). There is the ``smui-dev.conf`` being excluded from
version control through the ``.gitignore``, so that you can safely
create a local development configuration in the project’s root (naming
it ``smui-dev.conf``). Here is an example being used on a local
development machine adjusting some features:

::

   include "application.conf"

   db.default.url="jdbc:mysql://localhost/smui?autoReconnect=true&useSSL=false"
   db.default.username="local_dev_db_user"
   db.default.password="local_dev_db_pass"

   smui2solr.SRC_TMP_FILE="/PATH/TO/LOCAL_DEV/TMP/FILE.tmp"
   smui2solr.DST_CP_FILE_TO="PATH/TO/LOCAL_DEV/SOLR/CORE/CONF/rules.txt"
   smui2solr.SOLR_HOST="localhost:8983"

   toggle.ui-concept.updown-rules.combined=true
   toggle.ui-concept.all-rules.with-solr-fields=true
   toggle.rule-deployment.log-rule-id=true
   toggle.rule-deployment.split-decompound-rules-txt=true
   toggle.rule-deployment.split-decompound-rules-txt-DST_CP_FILE_TO="/PATH/TO/LOCAL_DEV/SOLR/CORE/CONF/decompound-rules.txt"
   toggle.rule-deployment.pre-live.present=true
   toggle.rule-deployment.custom-script=true
   toggle.rule-deployment.custom-script-SMUI2SOLR-SH_PATH="/PATH/TO/LOCAL_DEV/smui2solr-dev.sh"
   toggle.rule-tagging=true
   toggle.predefined-tags-file="/PATH/TO/LOCAL_DEV/predefined-tags.json"

   ...

   play.http.secret.key="<generated local play secret>"

   # smui.authAction = controllers.auth.BasicAuthAuthenticatedAction
   # smui.BasicAuthAuthenticatedAction.user = smui_dev_user
   # smui.BasicAuthAuthenticatedAction.pass = smui_dev_pass

As you can see, for development purposes you are recommended to have a
local Solr installation running as well.

For running The SMUI application locally on your development machine
pass the above config file when starting the application in ``sbt``,
e.g.:

::

   run -Dconfig.file=./smui-dev.conf 9000

Furthermore, above’s configuration points to an alternative development
version of the ``smui2solr.sh``-script. The file ``smui2solr-dev.sh`` is
as well excluded from the version control. The following example
provides a simple custom deployment script approach, that basically just
delegates the script call to the main ``smui2solr.sh`` one:

::

   echo "In smui2solr-dev.sh - DEV wrapper for smui2solr.sh, proving custom scripts work"

   BASEDIR=$(dirname "$0")
   $BASEDIR/conf/smui2solr.sh "$@"
   exit $?

It can be used as a basis for extension.

.. note::

    Remember to make the script executable (`chmod +x`).

.. _smui-dev-custom-auth:

Developing Custom Authentication
--------------------------------

Authentication Backend
~~~~~~~~~~~~~~~~~~~~~~

If you want to extend SMUI’s authentication behaviour, you can do so by
supplying your own authentication implementation into the classpath of
SMUI’s play application instance and referencing it in the
``application.conf``. Your custom authentication action offers a maximum
of flexibility as it is based upon play’s ``ActionBuilderImpl``. In
addition your custom action gets the current environment’s
``appConfig``, so it can use configurations defined there as well.
Comply with the following protocol:

::

   import play.api.Configuration
   import play.api.mvc._
   import scala.concurrent.ExecutionContext
   class myOwnAuthenticatedAction(parser: BodyParsers.Default,
                                  appConfig: Configuration)(implicit ec: ExecutionContext) extends ActionBuilderImpl(parser) {
   override def invokeBlock[A](request: Request[A], block: (Request[A]) => Future[Result]) = {
       ...
   }

As an example implementation, you can check `BasicAuthAuthenticatedAction.scala`_ as well.

.. _BasicAuthAuthenticatedAction.scala: https://github.com/querqy/smui/blob/master/app/controllers/auth/BasicAuthAuthenticatedAction.scala

Frontend Behaviour for Authentication
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The Angular frontend comes with a built-in HTTP request authentication
interceptor. Every API request is observed for returned 401 status
codes. In case the backend returns 401, the backend can pass an
behaviour instruction to the frontend by complying with spec defined by
``SmuiAuthViolation`` within `http-auth-interceptor.ts`_, e.g.:

.. _http-auth-interceptor.ts: https://github.com/querqy/smui/blob/master/app/assets/app/helpers/http-auth-interceptor.ts

::

   {
     "action": "redirect",
     "params": "https://www.example.com/loginService/?urlCallback={{CURRENT_SMUI_URL}}"
   }

.. note::

    The authentication interceptor only joins the game, in case the
    Angular application is successfully bootstrapped. So for SMUI’s ``/``
    route, your custom authentication method might choose a different
    behaviour (e.g. 302).

Within exemplary ``redirect`` action above, you can work with the
``{{CURRENT_SMUI_URL}}`` placeholder, that SMUI will replace with its
current location as an absolute URL before the redirect gets executed.
Through this, it becomes possible for the remote login service to
redirect back to SMUI once the login has succeeded.

Developing git deployment method
--------------------------------

SMUI offers the possibility to deploy rules.txt (files) to a git repository.
For doing so in a local development setup, it might therefore be necessary to
operate a local git instance. The following section describes how that can be achieved.

Bootstrap a local git server (docker)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

For the local git server, the dockerhub image `jkarlos/git-server-docker`_ will be used, see (command line):

.. _jkarlos/git-server-docker: https://hub.docker.com/r/jkarlos/git-server-docker/

::

   # create a private/public (SSH) key
   # e.g. ssh-keygen -t rsa -C "yourself@YourComputer.local"
   # create repo folder and provide (public) key
   mkdir <SMUI_GIT_ROOT>/keys
   mkdir <SMUI_GIT_ROOT>/repos
   # TODO better symlink?
   cp ~/.ssh/id_rsa.pub <SMUI_GIT_ROOT>/keys/
   # start the container (and provide public key)
   docker run -d -p 22:22 -v <SMUI_GIT_ROOT>/keys:/git-server/keys -v <SMUI_GIT_ROOT>/repos:/git-server/repos jkarlos/git-server-docker
   # NOTE: Your local development user must have permission to access information of your local git user (in case they differ)

Init the git repository
~~~~~~~~~~~~~~~~~~~~~~~

You can run the following script (preferred as git test user itself) to init the repo (command line):

::

   # from within the git server docker container
   # NOTE: open shell in container:
   docker exec -it <CONTAINER_ID> /bin/sh
   # (docker ps will give you the CONTAINER_ID)
   cd <SMUI_GIT_ROOT>/repos
   mkdir smui_rulestxt_repo
   cd smui_rulestxt_repo
   git init --shared=true
   git add .
   git commit -m "my first commit"
   cd ..
   git clone --bare smui_rulestxt_repo smui_rulestxt_repo.git
   # initial manual checkout (on the host machine)
   # make sure, there exists an (at least empty) common rules.txt file on the master branch (clone it somewhere and create a master branch)
   touch rules.txt
   git add rules.txt
   git commit -m "empty rules.txt commit"
   git push

To configure and start SMUI using a git deployment see “Deploy rules.txt to a git target“.

Developing github actions for SMUI
----------------------------------

Build and deployment of SMUI's official docker image on DockerHub is realised through a github action, which is located under: `.github/workflows <https://github.com/querqy/smui/tree/master/.github/workflows>`_.

Testing SMUI relies on Ryuk test containers within the ``sbt test`` build step. Unfortunately, there seems to be an issue with local build containers used by ``act`` (https://github.com/nektos/act), so that adjustments to the deployment workflow can only be tested while triggering the build on the github infrastructure (master push) and not tested locally with ``act``.

This problem is described in the following issue: https://github.com/nektos/act/issues/501.

Anyway, the workflow performs well on the github action container infrastructure.

Have fun coding SMUI!!
