# Íntimo Coffee — sitio estático

Landing informativa de una sola página (HTML + CSS + JS mínimo). Tipografía Fraunces + DM Sans, paleta en negros, grises y blancos; hero con imagen de fondo en escala de grises.

## Uso local

Abre `index.html` en el navegador o sirve la carpeta con cualquier servidor estático, por ejemplo:

```bash
cd IntimoCafeSite && python3 -m http.server 8080
```

Luego visita `http://localhost:8080`.

## Páginas legales

- **`privacidad.html`** — Aviso de privacidad integral + tabla de datos por sistema (POS, fidelidad, facturación, contabilidad, sitio). Sustituye los bloques marcados como *Sustituir* antes de publicar y revísalo con asesoría legal.
- **`terminos-sitio.html`** — Términos breves de uso del sitio informativo.

En `index.html`, el pie enlaza a privacidad, términos y al portal de facturación.

## Publicar en AWS

Ver **`deploy/README-AWS.md`** (Nginx en EC2 o S3 + CloudFront).

## Personalizar

- Textos y enlaces en `index.html`.
- Colores y layout en `css/styles.css` (variables `:root`, escala monocroma).
- Imagen del hero: URL en `.hero-bg` dentro de `styles.css`.
