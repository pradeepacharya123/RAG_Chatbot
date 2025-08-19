from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "doc_type", "uploaded_at")
    list_filter = ("doc_type", "uploaded_at")
    search_fields = ("title", "content")

    def save_model(self, request, obj, form, change):
        # Scrape URL or read file automatically
    
        if obj.doc_type == 'file' and obj.file:
            obj.content = obj.file.read().decode('utf-8', errors='ignore')
        super().save_model(request, obj, form, change)
