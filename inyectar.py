import os
import json
import re

def inyectar_textos(directorio_base, json_path):
    # Cargar el JSON con los mapeos
    with open(json_path, 'r', encoding='utf-8') as f:
        datos_mapeo = json.load(f)

    for archivo_relativo, mapeo in datos_mapeo.items():
        # Ajustar la ruta para diferentes sistemas operativos (\ o /)
        archivo_normalizado = archivo_relativo.replace('\\', os.sep).replace('/', os.sep)
        path_archivo = os.path.join(directorio_base, archivo_normalizado)
        
        if not os.path.exists(path_archivo):
            print(f"Omitido (No encontrado): {path_archivo}")
            continue
            
        with open(path_archivo, 'r', encoding='utf-8') as f:
            html = f.read()

        cambios_realizados = False
        
        # Ordenamos por longitud descendente para evitar reemplazar subtramas incompletas
        textos_ordenados = sorted(mapeo.keys(), key=len, reverse=True)

        for viejo in textos_ordenados:
            nuevo = mapeo[viejo]
            if viejo == nuevo:
                continue
                
            # Escapar el texto viejo para la expresión regular
            viejo_escapado = re.escape(viejo)
            # Hacemos que cualquier espacio o salto de línea en el JSON coincida con la estructura del HTML
            regex_str = viejo_escapado.replace(r'\ ', r'\s+')
            regex_str = regex_str.replace(r'\n', r'\s+')
            
            # Reemplazar en el HTML
            nuevo_html = re.sub(regex_str, nuevo, html, count=1)
            
            if nuevo_html != html:
                html = nuevo_html
                cambios_realizados = True

        if cambios_realizados:
            with open(path_archivo, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"¡Éxito! Actualizado: {archivo_relativo}")
        else:
            print(f"Sin cambios necesarios en: {archivo_relativo}")

if __name__ == "__main__":
    # Ejecuta el script apuntando a la carpeta actual y al archivo JSON
    print("Iniciando inyección de copywriting...")
    inyectar_textos('./', 'nuevo_contenido.json')
    print("Proceso finalizado.")