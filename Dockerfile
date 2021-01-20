FROM sphinxdoc/sphinx:latest

# add requirements
WORKDIR /docs
ADD docs/requirements.txt /docs
RUN pip3 install -r requirements.txt