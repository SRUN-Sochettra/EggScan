import os

files = [
    'backend/src/main/resources/application.yml',
    'backend/src/main/resources/application-prod.yml'
]

search_text_1 = "token: ${GITHUB_TOKEN}"
replace_text_1 = "token: ${GITHUB_TOKEN:}"

search_text_2 = "api-key: ${GROQ_API_KEY}"
replace_text_2 = "api-key: ${GROQ_API_KEY:}"

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    if search_text_1 in content and search_text_2 in content:
        content = content.replace(search_text_1, replace_text_1)
        content = content.replace(search_text_2, replace_text_2)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Success {filepath}")
    else:
        print(f"Search text not found in {filepath}")
