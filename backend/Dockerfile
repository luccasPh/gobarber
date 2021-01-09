# pull official base image
FROM python:3.8-slim

# set working directory
WORKDIR /backend

# update base image and install libs
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    file        \
    gcc         \
    libwww-perl && \
    apt-get autoremove -y && \
    apt-get clean

# install python3 pip
RUN pip install --upgrade pip

# install pipenv
RUN pip install pipenv

# copy project to working directory
COPY . ./

# install project dependencies
RUN pipenv install --dev

# run migrations

