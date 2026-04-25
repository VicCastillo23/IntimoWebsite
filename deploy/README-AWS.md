# Publicar el sitio estático en AWS (EC2 + `/opt`)

El proyecto es **100 % estático** (HTML, CSS, JS, imágenes). No requiere Node en producción.

Convención alineada al resto de servicios Íntimo: código bajo **`/opt/intimo/`** (misma idea que `IntimoInvoicing`, `IntimoAccounting`, etc.).

## 1. Clonar o actualizar en el servidor

En la EC2 (usuario `ubuntu` o el que uses):

```bash
sudo mkdir -p /opt/intimo
sudo chown -R "$USER:$USER" /opt/intimo
cd /opt/intimo

# Primera vez
git clone git@github.com:VicCastillo23/IntimoWebsite.git

# Actualizaciones
cd /opt/intimo/IntimoWebsite && git pull
```

La raíz del sitio para Nginx será:

**`root /opt/intimo/IntimoWebsite;`**

(Ahí deben quedar `index.html`, `css/`, `js/`, `images/`, `privacidad.html`, etc.)

## 2. Nginx (misma máquina que facturación / API)

Añade un `server` para `cafeintimo.mx` y `www.cafeintimo.mx` (ajusta rutas de certificado tras `certbot`):

```nginx
server {
    listen 443 ssl http2;
    server_name cafeintimo.mx www.cafeintimo.mx;
    root /opt/intimo/IntimoWebsite;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/cafeintimo.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cafeintimo.mx/privkey.pem;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

TLS (ejemplo):

```bash
sudo certbot certonly --nginx -d cafeintimo.mx -d www.cafeintimo.mx
```

Luego:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Comprueba:

```bash
curl -sI https://cafeintimo.mx/privacidad.html
```

## 3. DNS (IONOS u otro proveedor)

En la **zona DNS** del dominio (no uses solo “redireccionar dominio” si quieres que el sitio se sirva en `cafeintimo.mx`):

- **`@`** → registro **A** a la **Elastic IP** de la EC2.
- **`www`** → **A** a la misma IP, o **CNAME** según permita el panel.

## 4. Despliegue desde tu Mac (opcional)

Si prefieres empujar archivos sin entrar al servidor:

```bash
rsync -avz --delete --exclude '.git' ./IntimoCafeSite/ ubuntu@TU_IP:/opt/intimo/IntimoWebsite/
```

(Usa la ruta local de tu clon del repo `IntimoWebsite`.)

## Opción alternativa — S3 + CloudFront

Si más adelante quieres CDN sin tocar la EC2, ver flujo estándar S3 + CloudFront + ACM en `us-east-1`; la DNS apuntaría a CloudFront en lugar de la IP de la EC2.

## Después de publicar

- Sustituye los textos **Sustituir** en `privacidad.html`.
- Actualiza la fecha `<time datetime="...">` cuando cambies el aviso.
