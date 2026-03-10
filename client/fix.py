import sys
path = r'c:\Users\sreen\SchedAI\client\src\Pages\Admin\Dashboard.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('{\\`', '{`')
text = text.replace('\\`}', '`}')
text = text.replace('\\${', '${')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
