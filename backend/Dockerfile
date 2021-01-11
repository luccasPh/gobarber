FROM python:3.8-slim

WORKDIR /backend

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    file        \
    gcc         \
    libwww-perl && \
    apt-get autoremove -y && \
    apt-get clean

RUN pip install --upgrade pip

RUN pip install pipenv

COPY . ./

RUN pipenv install --dev

