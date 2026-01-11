# Santander Construction LLC - Frontend

## Estructura y uso

- **Login y registro:** Acceso seguro con JWT, selección de rol.
- **Dashboard:** Resumen de proyectos activos, pendientes y terminados.
- **Proyectos:** Listado, creación, edición y visualización de proyectos (según rol).
- **Subida de fotos:** Adjunta imágenes a cada proyecto.
- **Protección de rutas:** Redirección automática a login si no hay sesión.
- **Gestión de sesión:** Botón de logout y visualización de usuario/rol.
- **Roles:** Acciones restringidas para admin/supervisor.

## Requisitos
- Node.js y npm
- Backend Express corriendo en `http://localhost:5000`

## Inicio rápido
1. En la carpeta `frontend`, ejecuta:
   ```bash
   npm install
   npm run dev
   ```
2. Accede a `http://localhost:3000` en tu navegador.

## Personalización
- Puedes mejorar el diseño con Material UI, Chakra UI, etc.
- Edita las vistas en `/frontend/app` para agregar nuevas funcionalidades.

## Seguridad
- El token JWT se almacena en localStorage y se usa para todas las llamadas protegidas.
- Las rutas y acciones se muestran según el rol del usuario.

## Contacto
Para soporte o personalización, contacta al desarrollador.
