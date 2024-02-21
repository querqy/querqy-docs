# querqy-docs
Documentation for Querqy projects

The documentation format is reStructuredText. It is built using Sphinx. It will
be deployed via readthedocs.org. See [here](https://docs.readthedocs.io/en/stable/intro/getting-started-with-sphinx.html) for an introduction to the tool stack.

## Developing

### Installing dependencies
```
pip3 install -r docs/requirements.txt
```
Make sure that Sphinx is installed with the version from the [requirements file](docs/requirements.txt) and, if you had already
installed an older Sphinx version, that this is the first version in your `PATH`.

### Build

Run
```
cd docs
make clean html
```
The generated documents will be saved in the `build` directory.
You may locally preview the generated documentation by running a local http server in the `build` directory:
```
cd docs
make serve
```
This will serve the generated documentation on [http://localhost:8000](http://localhost:8000).

### Build with Docker

> 🐳 An alternative for the lazy Docker fanboys ;-)

Build the builder Docker image:

```
docker build -t querqy-doc-builder .
```

Build the docs:

```
docker run --rm -v $(pwd)/docs:/docs querqy-doc-builder make html
```

Browse the docs at [http://localhost:8000](http://localhost:8000):

```
docker run -it -p 8000:80 -v $PWD/docs/build/html:/usr/share/caddy/ caddy
```


### Tabs Structure

Here is a template for the tabs:

```
.. tabs::

   .. group-tab:: Elasticsearch

      Elasticsearch tab content - tab set 1

   .. group-tab:: OpenSearch

      OpenSearch tab content - tab set 1

   .. group-tab:: Solr

      Solr tab content - tab set 1
```
