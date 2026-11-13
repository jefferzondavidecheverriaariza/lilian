# Para Lilian — 26

Sitio web estático (HTML + CSS + JS). Sin instalación, sin backend.

## Subir a Netlify (3 pasos)
1. Entra a https://app.netlify.com/drop
2. Arrastra la carpeta `lilian-birthday` completa (o el ZIP).
3. Copia el enlace que te da Netlify y úsalo para crear el código QR.

## Música
Ya incluida en `assets/audio/perfect.mp3`. Para cambiarla, reemplaza ese archivo conservando el nombre.
Si el audio no carga, aparece «Toca aquí para comenzar la música» (permite elegir un MP3 desde el teléfono).
El archivo ya está recortado para que empiece en el 2.º verso (sincroniza el final y el mosaico).

## Vista previa del enlace
Para que WhatsApp muestre imagen, cambia `og:image` en `index.html` por la URL completa (https://tu-sitio.netlify.app/assets/images/foto02.jpg).

## Probar en local
Abre `index.html` en el navegador (o `npx serve .`).

## Notas
- La última foto es `foto13.jpg` (blanco y negro, sonriendo) y siempre cierra la experiencia.
- Para cambiar frases u orden: `js/script.js`, lista `SCENES`.
