# Publicar el sitio estático en AWS

El proyecto es **100 % estático** (HTML, CSS, JS, imágenes). No requiere Node en producción.

## Opción A — Misma EC2 que ya usas (Nginx)

1. En el servidor, crea carpeta pública, por ejemplo:
   ```bash
   sudo mkdir -p /var/www/cafeintimo-site
   sudo chown -R ubuntu:ubuntu /var/www/cafeintimo-site
   ```
2. Sube el contenido del repo (sin `.git` si quieres):
   ```bash
   rsync -avz --delete ./IntimoCafeSite/ ubuntu@TU_IP:/var/www/cafeintimo-site/
   ```
3. Añade un `server` en Nginx para tu dominio (ej. `cafeintimo.mx` o `www.cafeintimo.mx`) con `root /var/www/cafeintimo-site;` y `try_files $uri $uri/ /index.html;` solo si en el futuro usas SPA; para este sitio basta `try_files $uri $uri/ =404;` en rutas concretas o deja el comportamiento por defecto para `.html`.
4. Certificado TLS con Certbot (Let’s Encrypt) igual que en `facturacion.cafeintimo.mx`.
5. Comprueba: `curl -sI https://cafeintimo.mx/privacidad.html` → `200`.

Ejemplo mínimo de bloque `server` (ajusta dominio y rutas de certificado):

```nginx
server {
    listen 443 ssl http2;
    server_name cafeintimo.mx www.cafeintimo.mx;
    root /var/www/cafeintimo-site;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/cafeintimo.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cafeintimo.mx/privkey.pem;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Opción B — S3 + CloudFront

1. Crea un bucket S3 (p. ej. `cafeintimo-site-prod`), desactiva listados públicos y usa **Origen de acceso de OAI/OAC** desde CloudFront.
2. Sube los archivos (`aws s3 sync . s3://bucket/ --delete` desde la carpeta del sitio).
3. Crea distribución CloudFront con dominio alternativo (ACM en **us-east-1** para certificado wildcard).
4. En Route 53, alias A/AAAA hacia CloudFront.

## Después de publicar

- Sustituye los textos **Sustituir** en `privacidad.html`.
- Actualiza la fecha `<time datetime="...">` cuando cambies el aviso.
- Opcional: enlaza `https://tudominio/privacidad.html` desde apps (fidelidad, facturación) y del pie del sitio (ya enlazado desde `index.html`).
