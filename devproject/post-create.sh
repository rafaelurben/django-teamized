#!/bin/bash

set -e

curl -LsSf https://astral.sh/uv/install.sh | sh

# Django setup
uv sync --all-extras
uv run python -m django migrate
uv run python -m django createsuperuser --noinput || true

# Node.js setup
cd app
npm install
