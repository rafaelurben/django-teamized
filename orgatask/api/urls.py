"""OrgaTask API urls"""

from django.urls import path, re_path

from orgatask.api import views

#######################

urlpatterns = [
    # API views

    path('user/info/get', views.user_userinfo_get, name='user_userinfo_get'),

    re_path('.*', views.not_found, name="api-not-found")
]
