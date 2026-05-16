"""
sanitize_env.py
Corre en el runner de GitHub Actions.
Lee ENV_FILE del entorno, extrae solo KEY=VALUE validos, guarda backend_clean.env
"""
import os
import re

raw = os.environ.get('ENV_FILE', '')
pattern = re.compile(r'^([A-Za-z_][A-Za-z0-9_]*)=(.*)$')
output = []

for line in raw.splitlines():
    line = line.strip()
    m = pattern.match(line)
    if m:
        key = m.group(1)
        val = m.group(2)
        # Quitar comillas dobles o simples del valor
        if len(val) >= 2 and val[0] == '"' and val[-1] == '"':
            val = val[1:-1]
        elif len(val) >= 2 and val[0] == "'" and val[-1] == "'":
            val = val[1:-1]
        output.append(f'{key}={val}')

with open('backend_clean.env', 'w') as f:
    f.write('\n'.join(output) + '\n')

print(f'[OK] .env sanitizado: {len(output)} variables validas escritas en backend_clean.env')
