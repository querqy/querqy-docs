# querqy-docs
Documentation for Querqy projects

The documentation format is reStructuredText. It is built using Sphinx. It will
be deployed via readthedocs.org. See [here](https://docs.readthedocs.io/en/stable/intro/getting-started-with-sphinx.html) for an introduction to the tool stack.

## Installing dependencies

```
pip3 install sphinx==1.8.5
pip3 install sphinx_rtd_theme
```

Make sure that Sphinx is installed with version 1.8.5 and, if you had already
installed an older Sphinx version, that this is the first version in your PATH.

## Build

Run

`make clean html`

in the `docs` folder. The generated documents will be saved in the `build`
folder. 
