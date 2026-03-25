from fastembed import TextEmbedding

_model = None


def get_model():
    global _model

    if _model is None:
        _model = TextEmbedding()

    return _model


async def generate_embeddings_batch(texts):

    model = get_model()

    embeddings = list(model.embed(texts))

    return [e.tolist() for e in embeddings]


async def generate_single_embedding(text):

    result = await generate_embeddings_batch([text])

    return result[0]
