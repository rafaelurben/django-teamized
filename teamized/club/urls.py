"""Generic URL patterns"""

from django.urls import path, re_path, include

import teamized.club.views as views

##############

app_name = 'clubmanager'

urlpatterns = [
    path('', views.home, name="club_home"),
    path('member/<uuid:memberuid>/', views.member_app, name="club_member_app"),
    path('member/<uuid:memberuid>/login', views.member_login, name="club_member_login"),
    path('member/<uuid:memberuid>/logout', views.member_logout, name="club_member_logout"),
    path('club/<uuid:clubuid>/', views.club_login, name="club_club_login"),

    # path('api/', include('teamized.club.api'), name="api_home"),

    re_path(".*", views.error)
]
