from django.apps import AppConfig

class ChatapiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.chatapi'

    def ready(self):
        import chatapi.signals
