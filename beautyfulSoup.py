import os
import json
from bs4 import BeautifulSoup

def extraer_textos(directorio_base):
    datos_sitio = {}
    
    # Recorremos solo los archivos html en las carpetas necesarias
    for root, dirs, files in os.walk(directorio_base):
        for file in files:
            if file.endswith(".html"):
                path_archivo = os.path.join(root, file)
                # Usamos el nombre del archivo como clave en el JSON
                nombre_clave = os.path.relpath(path_archivo, directorio_base)
                
                with open(path_archivo, 'r', encoding='utf-8') as f:
                    soup = BeautifulSoup(f, 'html.parser')
                    
                    # Eliminamos elementos que no son texto de contenido
                    for script_or_style in soup(["script", "style", "nav", "footer"]):
                        script_or_style.decompose()
                        
                    # Extraemos texto de elementos comunes
                    textos = [t.get_text(strip=True) for t in soup.find_all(['h1', 'h2', 'h3', 'p', 'span', 'a']) if t.get_text(strip=True)]
                    
                    # Filtramos duplicados manteniendo orden
                    datos_sitio[nombre_clave] = list(dict.fromkeys(textos))
    
    with open('contenido_sitio.json', 'w', encoding='utf-8') as f:
        json.dump(datos_sitio, f, ensure_ascii=False, indent=4)
    
    print("¡Extracción completada! Revisa 'contenido_sitio.json'")

# Ejecutar en la carpeta donde tienes los archivos
extraer_textos('./')