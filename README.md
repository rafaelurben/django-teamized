# django-teamized

Teamized is a web application designed for team and club management.

A hosted version of Teamized is available at [teamized.ch](https://teamized.ch).

Time coding:
[![wakatime](https://wakatime.com/badge/user/c61e21c4-90ec-4953-b64f-e1a589f1e09c/project/ccc28ce1-c6f3-41d5-9d0d-61ced0dba37b.svg?style=flat)](https://wakatime.com/@rafaelurben/projects/bvjthjmhzy)

Note: The account management pages are part of my [django-account](https://github.com/rafaelurben/django-account)
repository.

## Technology used

### Backend

#### Core Technologies

- [Python](https://www.python.org/) - Programming language
- [Django](https://www.djangoproject.com/) - Web framework

#### Code quality

- [Black](https://black.readthedocs.io/en/stable/) - Code formatter
- [Pylint](https://pylint.org/) - Linting tool for identifying code issues
- [SonarQube](https://www.sonarqube.org/) - Code quality and security analysis

### Frontend

#### Core Technologies

- [React](https://reactjs.org/) - UI library for building interactive interfaces
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Webpack](https://webpack.js.org/) - Module bundler

#### UI & Styling

- [shadcn/ui](https://ui.shadcn.com/) - Reusable component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Icon library

#### Utilities

- [SweetAlert2](https://sweetalert2.github.io/) - Modal dialogs and alerts
- [Recharts](https://recharts.org/) - Chart library for data visualization

#### Code quality

- [ESLint](https://eslint.org/) - Linting tool for identifying code issues
- [Prettier](https://prettier.io/) - Code formatter
- [SonarQube](https://www.sonarqube.org/) - Code quality and security analysis

## Local development

### Setup

Clone the repository and follow these steps to set up the project locally:

#### Prerequisites

If you need live-reloading of the frontend during development, you need to set up the following environment variable:

Set `TEAMIZED_DEV_SERVER_HOST` to `http://localhost:8081` or set it to another address and
proxy your requests to this URL. The backend needs this to set the script tag source URLs in the HTML templates, and the
frontend development server needs this to correctly load other assets from the main script.

#### Backend

1. Install the dependencies (preferably in a virtual environment)
    - `pip install -r requirements.txt requirements-dev.txt`
2. Install the backend
    - `python -m pip install -e .`
3. Add the `teamized` settings to your Django project's settings file
    - `INSTALLED_APPS += ['teamized']`
4. Add the `teamized` URLs to your Django project's `urls.py` file
    - `path('teamized/', include('teamized.urls'))`
5. Run the migrations
    - `python manage.py migrate teamized`
6. Run the development server
    - `python manage.py runserver`

Note: Ensure that DEBUG is set to True in your Django settings for development purposes.

#### Frontend

1. Navigate to the `teamized/app` directory
    - `cd teamized/frontend`
2. Install the dependencies
    - `npm install`
3. Start the development server
    - With dev-server (live-reload): `npm run build-dev` (ensure `TEAMIZED_DEV_SERVER_HOST` is set)
    - Without dev-server: `npm run build-live` (ensure `TEAMIZED_DEV_SERVER_HOST` is NOT set or Django DEBUG is False)

### Running code quality tools

To ensure code quality, you can run the following tools:

#### Backend

- Pylint: `python -m pylint .`
- Black: `python -m black .`

#### Frontend

(from the `teamized/app` directory)

- ESLint: `npm run eslint-fix`
- Prettier: `npm run prettier-fix`

## Origin

This project started as part of my practical [matura paper](https://rafaelurben.ch/maturaarbeit/) (high school final
project) in Switzerland. The goal was to create a web application that allows teams to manage their projects, tasks and
members effectively. The project was developed using Django for the backend and React for the frontend, incorporating
various libraries and tools to enhance functionality and user experience.

The status of the project at the time of submission can be found in the branch
[archiv/maturaarbeit-finale-abgabe](https://github.com/rafaelurben/django-teamized/tree/archiv/maturaarbeit-finale-abgabe).
