# Generador de tarjetas

Sitio web estático para crear y administrar tarjetas de películas, series y música.

## Funciones

- Secciones de Inicio, Películas, Series y Música.
- Formulario adaptado a los datos de cada categoría.
- Generación de tarjetas con imagen desde una URL.
- Guardado automático en `localStorage` del navegador.
- Edición, eliminación y búsqueda de tarjetas.
- Diseño adaptable a escritorio, tabletas y celulares.
- Carrusel de ejemplos en la página de Inicio.

## Cómo abrirlo

La forma recomendada es abrir la carpeta con Visual Studio Code e iniciar un servidor local, por ejemplo con la extensión **Live Server**.

También puedes usar Python:

1. Abre CMD dentro de esta carpeta.
2. Ejecuta:

   ```bash
   py -m http.server 5500
   ```

3. Abre `http://localhost:5500` en tu navegador.

No requiere instalar paquetes ni dependencias.

## Almacenamiento

Las tarjetas se guardan en el almacenamiento local del navegador y equipo donde se crean. No se suben a un servidor ni se sincronizan automáticamente con otros dispositivos. Si se borran los datos del sitio en el navegador, también podrían borrarse las tarjetas.

## Campos por categoría

- **Películas:** título, año de estreno, director, empresa, género, duración e imagen.
- **Series:** título, temporadas, capítulos e imagen.
- **Música:** título, autor, año de estreno, álbum, duración e imagen.

El título y la imagen se utilizan como datos comunes para identificar y presentar visualmente cualquier tarjeta.
