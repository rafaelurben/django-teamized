"OrgaTask URLs"

from django.urls import path, include

from . import views

##############

app_name = 'orgatask'

urlpatterns = [
    # generic views
    path('', 
         views.home, 
         name="home"),
    path('app/',
         views.app,
         name="app"),
    path('manifest.json',
         views.manifest,
         name="manifest"),

    path('api/',
         include('orgatask.api.urls')),

    # 404 error page
    path('*', views.notfound),

]
