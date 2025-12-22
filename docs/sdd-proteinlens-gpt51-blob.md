0) Goal of this change

Replace “send base64 image to AI” with:

Upload image to Azure Blob Storage

Call Azure AI Foundry / Azure OpenAI GPT-5.1 Vision using an image URL (SAS) (or base64 only as fallback)

Store: blob URL/path + AI analysis + user corrections

Azure’s vision how-to uses Chat Completions with image inputs, and Foundry docs recommend newer APIs but still support chat completions style calls.
