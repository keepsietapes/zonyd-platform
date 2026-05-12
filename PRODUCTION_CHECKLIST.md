# 🏁 Zonyd OS - Production Checklist

Esta es la guía final para el despliegue a producción de la plataforma Zonyd.

## 1. Infraestructura y DevOps
- [ ] **Docker Deployment**: Asegurar que los contenedores de `Redis`, `PostgreSQL` y el `Backend` estén orquestados correctamente.
- [ ] **SSL/TLS**: Configurar certificados SSL (vía Cloudflare o Nginx) para los dominios de API y Aplicación.
- [ ] **CI/CD**: Validar que los GitHub Actions desplieguen a la instancia de producción en AWS EC2 tras pasar tests.
- [ ] **Backups**: Programar backups diarios automáticos de la base de datos de Supabase/PostgreSQL.

## 2. Configuración de Seguridad
- [ ] **Environment Variables**: Mover todas las claves de `.env` locales a secretos de producción (GitHub Secrets / AWS Parameter Store).
- [ ] **RBAC Activation**: Desactivar el "Modo Prueba" en `authMiddleware.js` y `rbacMiddleware.js` para forzar validación de JWT real.
- [ ] **Rate Limiting**: Reactivar el middleware de `express-rate-limit` en `server.js`.
- [ ] **CORS Policy**: Restringir el CORS únicamente a los dominios oficiales de Zonyd.

## 3. Calidad de Código y Assets
- [ ] **Build Optimization**: Ejecutar `npm run build` en el frontend para generar las páginas estáticas y optimizadas.
- [ ] **Asset Storage**: Configurar el bucket de S3/Supabase Storage para las portadas y archivos de audio reales.
- [ ] **Lints & Errors**: Corregir cualquier advertencia de Recharts (dimensiones de gráficos) en producción.

## 4. Negocio y Cumplimiento
- [ ] **Contratos Legales**: Subir los PDFs de términos y condiciones en el footer.
- [ ] **Configuración de Pago**: Conectar la API de Wallet con el proveedor de pagos real (Stripe/PayPal) si aplica.
- [ ] **DDEX Validation**: Validar que los archivos XML generados por el Distribution Service cumplen con el estándar DDEX de las tiendas.

## 5. Observabilidad y Resiliencia (Hybrid Plan Criticals)
- [ ] **Sentry**: Verificar que los errores de frontend y backend se capturan en Sentry.
- [ ] **Logging**: Confirmar que los logs estructurados (Pino) están activos en producción.
- [ ] **Audit Logs**: Verificar que todas las acciones financieras (retiros, splits) se guardan en la tabla AuditLog.
- [ ] **BullMQ DLQ**: Asegurar que existe una cola de "fallidos" (removeOnFail: false) para reintentar distribuciones.
- [ ] **Idempotency**: Probar que dobles peticiones de pago en Stripe no generan cargos duplicados.
- [ ] **AI Guardrails**: Validar que Zonyd AI rechaza dar asesoría legal o financiera fuera de su manual.

---
*Generado automáticamente por Antigravity AI - Hybrid Implementation Plan v3.0*
