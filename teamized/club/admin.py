from django.contrib import admin

import teamized.club.models as models

# Register your models here.


class ClubAdminMemberInline(admin.TabularInline):
    model = models.ClubMember
    extra = 0
    show_change_link = True

    fields = ('first_name', 'last_name', 'email')

# class ClubAdminPollInline(admin.TabularInline):
#     model = models.ClubPoll
#     extra = 0
#     show_change_link = True

#     fields = ('title', 'description', 'shown_from', 'deadline', 'shown_until', 'can_decline')

@admin.register(models.Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('uid', 'name', 'description')
    list_filter = []

    readonly_fields = ('uid',)
    search_fields = ('uid', 'name', 'description')
    prepopulated_fields = {'slug': ('name',)}

    inlines = [ClubAdminMemberInline]#, ClubAdminPollInline]

    fieldsets = [
        ('Infos', {'fields': ('uid', 'name', 'description', 'slug')}),
    ]

# class ClubPollAdminPollFieldInline(admin.TabularInline):
#     model = models.ClubPollField
#     extra = 0
#     show_change_link = True

#     fields = ('title', 'description', 'hidden', 'field_type', 'field_options')

# class ClubPollAdminPollEntryInline(admin.TabularInline):
#     model = models.ClubPollEntry
#     extra = 0
#     show_change_link = True

#     fields = ('member', 'has_voted', 'has_declined')

# @admin.register(models.ClubPoll)
# class ClubPollAdmin(admin.ModelAdmin):
#     list_display = ('uid', 'title', 'description', 'shown_from', 'deadline', 'shown_until', 'can_decline')
#     list_filter = ['can_decline']

#     readonly_fields = ('uid',)
#     search_fields = ('uid', 'title', 'description')

#     inlines = [ClubPollAdminPollFieldInline, ClubPollAdminPollEntryInline]

#     fieldsets = [
#         ('Infos', {'fields': ('uid', 'title', 'description',)}),
#         ('Zeiten', {'fields': ('shown_from', 'deadline', 'shown_until')}),
#         ('Optionen', {'fields': ('can_decline',)}),
#     ]

# class ClubPollEntryAdminPollEntryFieldInline(admin.TabularInline):
#     model = models.ClubPollEntryField
#     extra = 0

#     fields = ('poll_field', 'value')

# @admin.register(models.ClubPollEntry)
# class ClubPollEntryAdmin(admin.ModelAdmin):
#     list_display = ('uid', 'poll', 'member', 'has_voted', 'has_declined')
#     list_filter = ['has_voted', 'has_declined']

#     readonly_fields = ('uid',)

#     inlines = [ClubPollEntryAdminPollEntryFieldInline]

#     fieldsets = [
#         ('Infos', {'fields': ('uid', 'poll', 'member',)}),
#         ('Status', {'fields': ('has_voted', 'has_declined',)}),
#     ]

@admin.register(models.ClubMember)
class ClubMemberAdmin(admin.ModelAdmin):
    list_display = ('uid', 'club', 'first_name', 'last_name', 'email')

    readonly_fields = ('uid',)

    fieldsets = [
        ('Infos', {'fields': ('uid', 'club', )}),
        ('Persönliche Infos', {'fields': ('first_name', 'last_name', 'birth_date',)}),
        ('Adresse', {'fields': ('street', 'zip_code', 'city',)}),
        ('Kontakt', {'fields': ('email', 'phone', 'mobile',)}),
        ('Notizen', {'fields': ('notes',)}),
    ]
