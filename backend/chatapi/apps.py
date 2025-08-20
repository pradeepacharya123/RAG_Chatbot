from django.apps import AppConfig


class ChatapiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.chatapi'   # ✅ full dotted path

    def ready(self):
        # ✅ relative import since signals.py is in the same app
        from . import signals
