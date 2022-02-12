from django.contrib import admin
from django.utils.translation import gettext as _

import orgatask.api.admin
from orgatask import models

# Register your models here.


class UserAdminMemberInstanceInline(admin.TabularInline):
    model = models.Member
    extra = 0
    verbose_name = _("Organisation")
    verbose_name_plural = _("Organisation")

@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['uid', 'auth_user']
    list_filter = []

    readonly_fields = ('uid',)

    autocomplete_fields = ('auth_user',)

    inlines = [UserAdminMemberInstanceInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'auth_user',)}),
        ('Settings', {'fields': ('settings',)}),
    ]

    ordering = ('uid', )


class OrganizationAdminMemberInline(admin.TabularInline):
    model = models.Member
    extra = 0
    verbose_name = _("Mitglied")
    verbose_name_plural = _("Mitglieder")


@admin.register(models.Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['uid', 'title', 'description']
    list_filter = []

    readonly_fields = ('uid',)

    inlines = [OrganizationAdminMemberInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'title', 'description',)}),
        ('Settings', {'fields': ('settings',)}),
    ]

    ordering = ('uid', )
