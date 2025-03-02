FROM python:3.12.9-alpine3.21

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt /temp/requirements.txt
COPY app /app
WORKDIR /app
EXPOSE 8080

RUN apk add postgresql-client build-base postgresql-dev
RUN pip install -r /temp/requirements.txt

RUN adduser --disabled-password app-user

USER app-user