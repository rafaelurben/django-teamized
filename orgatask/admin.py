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
        ('Settings', {'fields': ('settings',)}),
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

    readonly_fields = ('token', 'is_valid',)

    fields = ('max_uses', 'uses_left', 'is_valid', 'valid_until', 'token',)

@admin.register(models.Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['uid', 'title', 'description']
    list_filter = []

    readonly_fields = ('uid',)

    inlines = [TeamAdminMemberInline, TeamAdminInviteInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'title', 'description',)}),
        ('Settings', {'fields': ('settings',)}),
    ]

    ordering = ('uid', )

@admin.register(models.Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ['uid', 'team', 'note', 'is_valid', 'max_uses', 'uses_left', 'valid_until']
    list_filter = ['uses_left']

    readonly_fields = ('uid', 'token')

    fieldsets = [
        ('Infos', {'fields': ('uid', 'team', 'note',)}),
        ('Settings', {'fields': (('max_uses', 'uses_left'), 'valid_until')}),
        ('Token', {'fields': ('token',), "classes": ('collapse',)})
    ]
