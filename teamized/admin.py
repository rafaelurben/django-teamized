"""Admin classes

These classes are required for the django admin interface.
The admin interface is something only the developer will ever see.
"""

from django.contrib import admin
from django.utils.translation import gettext as _

from teamized import models

# This is required for the club admin views
import teamized.club.admin
# This is required for the apikey admin view
import teamized.api.utils.admin

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
    search_fields = ('uid', 'auth_user__username', 'auth_user__email', 'auth_user__first_name', 'auth_user__last_name')
    autocomplete_fields = ('auth_user',)

    inlines = [UserAdminMemberInstanceInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'auth_user',)}),
        ('Settings', {'fields': ('settings_darkmode',)}),
    ]

    ordering = ('uid', )

@admin.register(models.Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['uid', 'user', 'team', 'role', 'note']

    readonly_fields = ('uid',)
    search_fields = ('uid', 'user__uid', 'user__auth_user__username', 'user__auth_user__email', 'user__auth_user__first_name', 'user__auth_user__last_name', 'team__uid', 'team__name', 'team__description', 'role', 'note')

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

    fields = ('uses_left', 'uses_used', 'is_valid', 'valid_until', 'note', 'token',)

@admin.register(models.Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['uid', 'name', 'description']
    list_filter = []

    readonly_fields = ('uid',)
    search_fields = ('uid', 'name', 'description',)
    autocomplete_fields = ('linked_club',)

    inlines = [TeamAdminMemberInline, TeamAdminInviteInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'name', 'description',)}),
        ('Verbindungen', {'fields': ('linked_club',)}),
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

@admin.register(models.WorkSession)
class WorkSessionAdmin(admin.ModelAdmin):
    list_display = ['uid', 'time_start', 'time_end', 'duration', 'is_ended', 'is_created_via_tracking']

    readonly_fields = ('uid', 'duration', )

    autocomplete_fields = ('user', 'member', 'team',)

    fieldsets = [
        (None, {'fields': ('uid',)}),
        ('Verbindungen', {'fields': ('user', 'member', 'team')}),
        ('Zeiten', {'fields': ('time_start', 'time_end', 'duration')}),
        ('Notizen', {'fields': ('note',)}),
        ('Status', {'fields': ('is_ended', 'is_created_via_tracking')})
    ]

# Calendar

class CalendarAdminEventInline(admin.TabularInline):
    model = models.CalendarEvent
    extra = 0
    verbose_name = _("Ereignis")
    verbose_name_plural = _("Ereignisse")

@admin.register(models.Calendar)
class CalendarAdmin(admin.ModelAdmin):
    list_display = ['uid', 'name', 'description', 'is_public', 'ics_uid']

    readonly_fields = ['uid']

    autocomplete_fields = ['team',]

    inlines = [CalendarAdminEventInline]

    fieldsets = [
        (None, {'fields': ('uid',)}),
        ('Verbindungen', {'fields': ('team',)}),
        ('Infos', {'fields': ('name', 'description', 'color',)}),
        ('Veröffentlichung', {'fields': ('is_public', 'ics_uid',), 'classes': ('collapse',)}),
    ]

# Todo

class ToDoAdminListInline(admin.TabularInline):
    model = models.ToDoListItem
    extra = 0
    verbose_name = _("Listeneintrag")
    verbose_name_plural = _("Listeneinträge")


@admin.register(models.ToDoList)
class ToDoListAdmin(admin.ModelAdmin):
    list_display = ['uid', 'name', 'description']

    readonly_fields = ['uid']

    autocomplete_fields = ['team', ]

    inlines = [ToDoAdminListInline]

    fieldsets = [
        (None, {'fields': ('uid',)}),
        ('Verbindungen', {'fields': ('team',)}),
        ('Infos', {'fields': ('name', 'description', 'color',)}),
    ]
