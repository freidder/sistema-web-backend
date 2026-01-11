# Despliegue profesional Santander Construction LLC

## 1. Frontend (Next.js) en Vercel

1. Sube la carpeta `frontend` a un repositorio en GitHub.
2. Ve a [vercel.com](https://vercel.com/) y crea una cuenta.
3. Conecta tu repositorio y selecciona la carpeta `frontend` como raíz.
4. En "Environment Variables", agrega:
   - `NEXT_PUBLIC_API_URL=https://TU_BACKEND_RENDER_URL`
5. Haz deploy y accede a la URL pública de Vercel.

## 2. Backend (Express) en Render

1. Sube la carpeta principal (sin `/frontend`) a un repositorio en GitHub.
2. Ve a [render.com](https://render.com/) y crea una cuenta.
3. Crea un nuevo "Web Service" y conecta tu repo.
4. En "Environment Variables", agrega:
   - `MONGO_URI=TU_MONGODB_ATLAS_URI`
   - `JWT_SECRET=TU_SECRETO_JWT`
   - `PORT=5000`
5. Haz deploy y accede a la URL pública de Render.

## 3. MongoDB Atlas

- Verifica que tu base de datos permita conexiones desde Render (IP whitelist: `0.0.0.0/0` si es necesario).
- Activa backups automáticos en el panel de Atlas.

## 4. Seguridad

- Usa HTTPS en Vercel y Render (por defecto).
- Mantén tus claves y secretos en variables de entorno.

## 5. Monitoreo y backups

- Integra Sentry, LogRocket o similar para monitoreo de errores.
- Verifica que los backups de Atlas estén activos.

## 6. Pruebas post-despliegue

- Accede al frontend en Vercel y verifica el funcionamiento completo.
- Si usas Cypress, puedes apuntar los tests a la URL pública para validar el sistema en producción.

---

¿Listo para desplegar? Sigue estos pasos y tendrás tu sistema profesional en la nube, seguro y escalable.
