import google.generativeai as genai
import os
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

api_key = "AIzaSyB3N1n_uE9Fna7DrWelugvYpOHtIVxyE-0"
genai.configure(api_key=api_key)

print("--- LIST OF MODELS SUPPORTING GENERATECONTENT ---")
try:
    models = genai.list_models()
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name} ({m.display_name})")
except Exception as e:
    print(f"API ERROR: {e}")
