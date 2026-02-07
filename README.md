# Sistema de Gestion v3.0

Sistema de gestion interno basado en Next.js para el dashboard CRM y pantallas de administracion.

## Repositorio

- GitHub: https://github.com/Dadminete/Sistema_de_Gestion_v3.0

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+

## Instalacion

```bash
npm install
```

## Comandos utiles

```bash
npm run dev
npm run dev:lan
npm run build
npm run start
```

## Rutas principales

- Inicio: /dashboard/crm
- Default dashboard: /dashboard/default

## Desarrollo en red (LAN)

```bash
npm run dev:lan
```

Luego abre:

http://172.16.0.23:3000

## Deploy en Vercel

1. En Vercel, crea un nuevo proyecto y conecta el repo de GitHub.
2. Framework: Next.js (auto-detectado).
3. Build Command: npm run build
4. Output: (dejar vacio, usa el default de Next.js)
5. Install Command: npm install
6. Deploy.

Si el deploy falla con 404 DEPLOYMENT_NOT_FOUND, verifica que estas abriendo la URL del deployment actual (Project > Deployments).

## Notas

- El modo dev es mas lento en el primer load por compilacion de modulos.
- Para mejor rendimiento en red, usa build + start.
