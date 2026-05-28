import os
import json
import re

def inyectar_textos(directorio_base, json_path):
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
        
        # Ordenamos por longitud descendente
        textos_ordenados = sorted(mapeo.keys(), key=len, reverse=True)

        for viejo in textos_ordenados:
            nuevo = mapeo[viejo]
            if viejo == nuevo:
                continue
                
            # EL TRUCO DEFINITIVO:
            # 1. Dividimos el texto en palabras individuales (ignora espacios y saltos de línea)
            palabras = viejo.split()
            
            if not palabras:
                continue
                
            # 2. Escapamos los caracteres especiales de cada palabra
            palabras_escapadas = [re.escape(p) for p in palabras]
            
            # 3. Creamos una regla que busque esas palabras con CUALQUIER cantidad de espacios/saltos entre ellas
            regex_str = r'\s+'.join(palabras_escapadas)
            
            # 4. Reemplazamos
            nuevo_html, reemplazos = re.subn(regex_str, nuevo.replace('\\n', '\n'), html, count=1)
            
            if reemplazos > 0:
                html = nuevo_html
                cambios_realizados = True

        if cambios_realizados:
            with open(path_archivo, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"¡Éxito! Actualizado: {archivo_relativo}")
        else:
            print(f"Sin cambios necesarios en: {archivo_relativo}")

if __name__ == "__main__":
    print("Iniciando inyección de copywriting...")
    inyectar_textos('./', 'nuevo_contenido_es.json')
    print("Proceso finalizado.")