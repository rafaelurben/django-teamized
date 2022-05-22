from django.contrib import admin
from django.utils.translation import gettext as _

import orgatask.api.admin
from orgatask import models

# Register your models here.


class UserAdminMemberInstanceInline(admin.TabularInline):
    model = models.Member
    extra = 0
    verbose_name = _("Team")
    verbose_name_plural = _("Teams")

@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['uid', 'auth_user']
    list_filter = []

    readonly_fields = ('uid',)

    autocomplete_fields = ('auth_user',)

    inlines = [UserAdminMemberInstanceInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'auth_user',)}),
        ('Settings', {'fields': ()}),
    ]

    ordering = ('uid', )


class TeamAdminMemberInline(admin.TabularInline):
    model = models.Member
    extra = 0
    verbose_name = _("Mitglied")
    verbose_name_plural = _("Mitglieder")

class TeamAdminInviteInline(admin.TabularInline):
    model = models.Invite
    extra = 0
    verbose_name = _("Einladung")
    verbose_name_plural = _("Einladungen")

    readonly_fields = ('token', 'is_valid', 'uses_used')

    fields = ('uses_left', 'uses_used', 'is_valid', 'valid_until', 'token',)

@admin.register(models.Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['uid', 'name', 'description']
    list_filter = []

    readonly_fields = ('uid',)

    inlines = [TeamAdminMemberInline, TeamAdminInviteInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'name', 'description',)}),
        ('Settings', {'fields': ()}),
    ]

    ordering = ('uid', )

@admin.register(models.Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ['uid', 'team', 'note', 'is_valid', 'uses_left', 'uses_used', 'valid_until']
    list_filter = ['uses_left']

    readonly_fields = ('uid', 'token', 'uses_used')

    fieldsets = [
        ('Infos', {'fields': ('uid', 'team', 'note',)}),
        ('Settings', {'fields': (('uses_left', 'uses_used'), 'valid_until')}),
        ('Token', {'fields': ('token',), "classes": ('collapse',)})
    ]
