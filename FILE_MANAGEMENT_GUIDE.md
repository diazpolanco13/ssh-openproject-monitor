# 📂 GESTIÓN DE ARCHIVOS DE SEGURIDAD Y CONFIGURACIÓN

## 🔐 CLASIFICACIÓN DE ARCHIVOS

### ✅ SEGUROS PARA GIT (Documentación)
**Estos archivos NO contienen información sensible y DEBEN ir a Git:**

```bash
# Archivos de documentación - OK para Git
/home/openproject/README.md                 # ✅ Documentación general
/home/openproject/ADMIN_GUIDE.md           # ✅ Guía de administración
/home/openproject/SECURITY_SUMMARY.md      # ✅ Resumen de seguridad
/home/openproject/EMERGENCY_ACCESS_GUIDE.md # ⚠️  Ver nota especial
```

### ❌ SENSIBLES - NO PARA GIT
**Estos archivos contienen información sensible y NO deben ir a Git:**

```bash
# Credenciales y secretos - NUNCA en Git
/root/emergency-credentials.txt             # ❌ Contraseñas de emergencia
/etc/ssh/sshd_config                       # ❌ Configuración SSH específica
/etc/ssh/banner                            # ❌ Banner con IPs específicas

# Scripts en sistema - Evaluar
/usr/local/bin/emergency-access-system.sh  # ⚠️  Contiene lógica, pero OK
/usr/local/bin/rate-limiting-ssh.sh        # ✅ Scripts genéricos OK
/usr/local/bin/fix-dashboard-access.sh     # ⚠️  Contiene IP específica
```

### 🔄 SCRIPTS DE SISTEMA (Backup recomendado)
**Scripts importantes que deberían respaldarse pero no necesariamente en Git:**

```bash
# Opción: Crear versiones "template" sin datos específicos
/usr/local/bin/emergency-access-system.sh  # Crear template
/usr/local/bin/fix-dashboard-access.sh     # Crear template
```

---

## 🛠️ RECOMENDACIONES

### 1. ACTUALIZAR .gitignore
```bash
# Añadir a .gitignore:
**/emergency-credentials.txt
**/*credentials*
**/sshd_config
**/banner
.env
*.key
*.pem
```

### 2. LIMPIAR EMERGENCY_ACCESS_GUIDE.md
**⚠️ IMPORTANTE**: El archivo `EMERGENCY_ACCESS_GUIDE.md` contiene credenciales en texto plano.

**Opciones**:
- **Opción A**: Crear versión template sin credenciales reales
- **Opción B**: Añadir a .gitignore
- **Opción C**: Crear versión pública y privada

### 3. BACKUP DE SCRIPTS CRÍTICOS
```bash
# Crear backup de scripts importantes fuera del Git
sudo tar -czf ~/security-scripts-backup-$(date +%Y%m%d).tar.gz \
    /usr/local/bin/emergency-access-system.sh \
    /usr/local/bin/rate-limiting-ssh.sh \
    /usr/local/bin/fix-dashboard-access.sh \
    /root/emergency-credentials.txt
```

### 4. CREAR TEMPLATES PARA GIT
```bash
# Scripts template sin datos específicos
emergency-access-system.template.sh    # Sin IPs hardcodeadas
fix-dashboard-access.template.sh       # Sin IPs específicas
EMERGENCY_ACCESS_GUIDE.template.md     # Sin credenciales reales
```

---

## ⚡ ACCIÓN INMEDIATA RECOMENDADA

### Paso 1: Actualizar .gitignore
### Paso 2: Crear versión sanitizada de EMERGENCY_ACCESS_GUIDE.md
### Paso 3: Mantener backup local de archivos sensibles
### Paso 4: Commitear solo documentación segura

---

## 📋 RESUMEN

| Archivo | Git? | Razón | Acción |
|---------|------|-------|--------|
| `README.md` | ✅ Sí | Documentación general | Commit |
| `ADMIN_GUIDE.md` | ✅ Sí | Guía sin secretos | Commit |
| `SECURITY_SUMMARY.md` | ✅ Sí | Resumen técnico | Commit |
| `EMERGENCY_ACCESS_GUIDE.md` | ❌ No | Contiene credenciales | Crear template |
| Scripts `/usr/local/bin/` | ⚠️ Evaluar | Algunos con IPs | Crear templates |
| `/root/emergency-credentials.txt` | ❌ NUNCA | Credenciales puras | Solo backup local |

**Regla de oro**: Si tiene IPs, contraseñas, o configuraciones específicas del servidor, NO va a Git.
