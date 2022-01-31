"""OrgaTask API urls"""

from django.urls import path, re_path

from orgatask.api import views

#######################

urlpatterns = [
    # API views

    re_path('.*', views.not_found, name="api-not-found")
]
