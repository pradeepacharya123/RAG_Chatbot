from django.db import models

# Create your models here.
from django.db import models

class Document(models.Model):
    DOC_TYPE_CHOICES = (
        ('file', 'File'),
        #('url', 'URL'),
    )
    title = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=10, choices=DOC_TYPE_CHOICES, default='file')
    file = models.FileField(upload_to='documents/', blank=True, null=True)
    #url = models.URLField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)  # scraped or read content
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
