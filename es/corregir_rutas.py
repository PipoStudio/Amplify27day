import os
import re

def corregir_rutas_estilos_y_scripts():
    # El script asume que se está ejecutando desde la carpeta 'es'
    directorio_base = './'

    for root, dirs, files in os.walk(directorio_base):
        for file in files:
            if file.endswith(".html"):
                path_archivo = os.path.join(root, file)
                
                with open(path_archivo, 'r', encoding='utf-8') as f:
                    html = f.read()

                html_modificado = html

                # Si el archivo está en la raíz de la carpeta 'es' (ej. es/index.html)
                if root == './' or root == '.':
                    # Agrega ../ a css/, js/ y assets/ si no lo tienen ya
                    html_modificado = re.sub(r'href="css/', r'href="../css/', html_modificado)
                    html_modificado = re.sub(r'src="js/', r'src="../js/', html_modificado)
                    html_modificado = re.sub(r'src="assets/', r'src="../assets/', html_modificado)
                    
                # Si el archivo está en una subcarpeta (ej. es/pages/concepto.html)
                else:
                    # Cambia ../ por ../../ para css/, js/ y assets/
                    html_modificado = re.sub(r'href="\.\./css/', r'href="../../css/', html_modificado)
                    html_modificado = re.sub(r'src="\.\./js/', r'src="../../js/', html_modificado)
                    html_modificado = re.sub(r'src="\.\./assets/', r'src="../../assets/', html_modificado)

                # Guardar solo si hubo cambios reales
                if html != html_modificado:
                    with open(path_archivo, 'w', encoding='utf-8') as f:
                        f.write(html_modificado)
                    print(f"Rutas corregidas en: {path_archivo}")
                else:
                    print(f"Rutas ya estaban correctas en: {path_archivo}")

if __name__ == "__main__":
    print("Iniciando corrección de rutas relativas (CSS, JS, Assets)...")
    corregir_rutas_estilos_y_scripts()
    print("¡Proceso finalizado con éxito!")