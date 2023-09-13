FROM ubuntu:23.10

RUN apt update
RUN apt install -y python3 python3-pip libgl1-mesa-dev libglib2.0-0

COPY static /opt/facecog/static
COPY templates /opt/facecog/templates
COPY scripts /opt/facecog/scripts
COPY app.py requirements.txt dockerfile /opt/facecog


RUN pip install -r /opt/facecog/requirements.txt --break-system-packages

WORKDIR /opt/facecog

CMD bash scripts/service-production
