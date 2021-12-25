"OrgaTask URLs"

from django.urls import path

from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy

from . import views

##############

app_name = 'orgatask'

# Account URLs
_account_urls = [
    # Account: logout, login and register

    path('account/login/',
         auth_views.LoginView.as_view(
             template_name='orgatask/account/login.html'),
         name="account-login"),
    path('account/logout/',
         auth_views.LogoutView.as_view(
             next_page=reverse_lazy("orgatask:account-logout-done")),
         name="account-logout"),
    path('account/logout/done',
         views.account_logout,
         name="account-logout-done"),
    path('account/register/',
         views.account_register,
         name="account-register"),

    # Account: password change

    path('account/pwchange/',
         auth_views.PasswordChangeView.as_view(
             template_name="orgatask/account/password-change.html",
             success_url=reverse_lazy("orgatask:account-password-change-done")),
         name="account-password-change"),
    path('account/pwchange/done/',
         auth_views.PasswordChangeDoneView.as_view(
             template_name="orgatask/account/password-change-done.html"),
         name="account-password-change-done"),

    # Account: password reset

    path('account/pwreset/',
         auth_views.PasswordResetView.as_view(
             template_name="orgatask/account/password-reset-form.html",
             email_template_name="orgatask/account/password-reset-email.html",
             subject_template_name="orgatask/account/password-reset-subject.txt",
             success_url=reverse_lazy("orgatask:account-password-reset-done")),
         name="account-password-reset"),
    path('account/pwreset/done/',
         auth_views.PasswordResetDoneView.as_view(
             template_name="orgatask/account/password-reset-done.html"),
         name="account-password-reset-done"),

    path('account/pwreset/confirm/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
             template_name="orgatask/account/password-reset-confirm.html",
             success_url=reverse_lazy("orgatask:account-password-reset-complete")),
         name="account-password-reset-confirm"),
    path('account/pwreset/complete/',
         auth_views.PasswordResetCompleteView.as_view(
             template_name="orgatask/account/password-reset-complete.html"),
         name="account-password-reset-complete"),
]

# App URLs
_app_urls = [

]

# All URLs
urlpatterns = [
    # generic views
    path('', views.home, name="home"),

    # account views
    *_account_urls,

    # app views
    *_app_urls,

    # 404 error page
    path('*', views.notfound),

]
