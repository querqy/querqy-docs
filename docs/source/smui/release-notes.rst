.. _smui-release-notes:

=============
Release notes
=============

Major changes in v3.12
======================

-  Optimised development setup (split npm frontend from Scala/Play backend).
-  Removed RPM build. SMUI is now Docker only.

Major changes in v3.11
======================

-  Git deployment: Deploy rules.txt files to a git repository using the user you start SMUI with.
-  NOTE: With v3.11 first JSON payloads exceeding 5K of data were observed in productive environments. Therefore, the data type changed to ``varchar(10000)`` (@see /smui/conf/evolutions/default/6.sql). To avoid database migration trouble, it's strongly recommended to install SMUI version >= 3.11.5. Prior DockerHub versions with Activity Log had been removed!!
-  SMUI explicitly supports operations in a multi instance environment (especially for database migrations, e.g. migration for event history).

Major changes in v3.10
======================

-  Version check: SMUI checks version diff against market standard (on DockerHub) and warns about outdated local setups.

Major changes in v3.9
=====================

-  Custom UP/DOWN dropdown mappings for the frontend can be configured. Step sizes for UP/DOWN boost/penalise values are more flexible now.

Major changes in v3.8
=====================

-  Activity Log & Reporting capabilities: SMUI now logs every activity (rule creations, updates & the like) & offers reports, that grant an overview over changes done in a certain period.
     - Activies for an input are reported in the details sections.
     - SMUI offers a "Report" view, where (a) all Activities / changes in a specific period can be reviewed ("Activity Report"), and where you (b) find an overview of all rules sorted by last modification ("Rules Report")
     - Activity Logging must be activated for this (see “Configure application behaviour / feature toggles“ for details).
     - Note: Please install version >= 3.8.3 as the prior v3.8 releases (v3.8.1, v3.8.2) do flawful persistence of Activity event entities (those version have been removed in DockerHub as well)!

Major changes in v3.7
=====================

-  Bump querqy version to *3.7.0*
-  New flag for list limitation:
   Limits the visible rule items in the left pane to improve render speed (flag: *toggle.ui-list.limit-items-to*)
-  New *spelling items*:
     - Spellings/misspellings can be maintained in SMUI using the querqy replace rewriter (e.g. ``ombile => mobile``)
     - Replace rules are exported in a seperate rule file that can be configured in the *application.conf*
- Major refactoring of frontend

Major changes in v3.6
=====================

-  Search manager now have the possibility to deactivate (instead of
   deleting) a whole set of search rules, that belong to a specific
   input.
-  SMUI provides the possibility to comment on changes to search rules
   for a specific input.

Major changes in v3.5
=====================

-  SMUI provides a docker only runtime environment (including a safe
   ``smui:smui`` user). Installing SMUI from an RPM image is not
   supported (and therefore not documented) any more.

Major changes in v3 (compared to v2)
====================================

-  Auto-DECORATE do not exist any more. Please migrate any usage to
   Auto-Log-Rule-ID
-  SMUI for that feature depends now on v3.3 of
   `querqy <https://github.com/renekrie/querqy>`__

Major changes in v2 (compared to v1)
====================================

-  Database schema definition (SQL) implemented more lightweight, so
   that SMUI can be operated with every standard SQL database (entity
   IDs therefore needed to be adjusted, see “Migrate pre-v2 SMUI
   databases” for details)
