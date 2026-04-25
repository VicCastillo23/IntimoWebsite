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

En el servidor ya puedes usar el archivo versionado **`deploy/nginx-cafeintimo-mx-www.conf`** (puerto 80, `root /opt/intimo/IntimoWebsite`). La directiva `try_files … /index.html` hace que la raíz `/` abra el landing.

Copia el contenido de **`deploy/nginx-cafeintimo-mx-www.conf`** (en este repo) a `/etc/nginx/sites-available/cafeintimo-mx-www.conf`, luego:

```bash
sudo ln -sf /etc/nginx/sites-available/cafeintimo-mx-www.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**HTTPS:** cuando en IONOS (o tu DNS) los registros **A** de `cafeintimo.mx` y `www` apunten a la IP de esta EC2:

```bash
sudo certbot --nginx -d cafeintimo.mx -d www.cafeintimo.mx
```

Certbot modificará Nginx y creará `/etc/letsencrypt/live/cafeintimo.mx/` (o similar).

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
