#!/bin/bash

set -e

# Django setup
pip install --only-binary :all: -r requirements.txt -r requirements-dev.txt
pip install --only-binary :all: -e .
python -m django migrate
python -m django createsuperuser --noinput || true

# Node.js setup
cd app
npm install
