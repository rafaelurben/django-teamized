#!/bin/bash

set -e

# Django setup
pip install -r requirements.txt -r requirements-dev.txt
pip install -e .
python -m django migrate
python -m django createsuperuser --noinput || true

# Node.js setup
cd teamized/app
npm install
