# chatapi/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Document
from .views import embedding_model, collection

@receiver(post_save, sender=Document)
def index_document(sender, instance, created, **kwargs):
    print("Signal fired for doc:", instance.id)
    if created:
        text = instance.content or ""
        if not text:
            print("No content to index for Document", instance.id)
            return
        # create embedding
        vector = embedding_model.encode(text).tolist()
        # insert into Chroma
        try:
            collection.add(
                ids=[str(instance.id)],
                documents=[text],
                embeddings=[vector]
            )
            print("Inserted into Chroma for doc", instance.id)
        except Exception as e:
            print("Chroma insert error:", e)
