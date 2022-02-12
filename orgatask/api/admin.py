"""OrgaTask API admin views"""

from django.contrib import admin

from orgatask.api.models import ApiKey


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'user', 'read', 'write', 'key_preview']
    list_filter = ["read", "write"]

    readonly_fields = ('key', )

    fieldsets = [
        ('Settings', {'fields': ('name', 'user', ('read', 'write'))}),
        ('Key', {'fields': ('key',), "classes": ('collapse',)})
    ]

    ordering = ('id', )
