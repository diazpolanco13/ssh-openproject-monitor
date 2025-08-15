# 🆘 GUÍA DE ACCESO DE EMERGENCIA AL SERVIDOR

## ⚠️ CREDENCIALES DE EMERGENCIA
**GUARDA ESTO EN UN LUGAR SEGURO FUERA DEL SERVIDOR**

### Usuario de Emergencia
- **Usuario**: emergency_admin
- **Contraseña**: [CONFIGURAR DURANTE LA INSTALACIÓN]
- **Comando**: `ssh emergency_admin@tu-servidor -p 2234`

---

## 🚨 ESCENARIOS DE EMERGENCIA Y SOLUCIONES

### Escenario 1: Perdiste tu IP fija
**Problema**: Tu VPN cambió o tu ISP te asignó nueva IP

**Soluciones**:
1. **Desde otra IP de confianza**:
   ```bash
   # Conectarte desde IP de un amigo/familia/trabajo
   ssh emergency_admin@tu-servidor -p 2234
   # Luego añadir tu nueva IP:
   sudo /usr/local/bin/emergency-access-system.sh add-ip TU_NUEVA_IP
   ```

2. **Puerto de emergencia temporal**:
   ```bash
   # Pide a alguien de confianza que ejecute:
   ssh emergency_admin@tu-servidor -p 2234
   sudo /usr/local/bin/emergency-access-system.sh emergency-port
   # Esto abre puerto 2235 por 24 horas
   ssh tu-usuario@tu-servidor -p 2235
   ```

### Escenario 2: Bloqueaste tu propia IP por error
**Problema**: Las reglas de firewall te bloquearon

**Soluciones**:
1. **Consola del proveedor VPS**:
   ```bash
   # Desde la consola web de tu proveedor:
   sudo /usr/local/bin/console-recovery.sh
   # Esto abre SSH completamente por 30 minutos
   ```

2. **Usuario de emergencia**:
   ```bash
   # Si tienes acceso limitado:
   ssh emergency_admin@tu-servidor -p 2234
   sudo iptables -I INPUT -s TU_IP -j ACCEPT
   ```

### Escenario 3: Te moriste (acceso para herederos/administradores)
**Problema**: Alguien de confianza necesita acceder al servidor

**Soluciones**:
1. **Credenciales de emergencia** (arriba en esta guía)
2. **Consola del proveedor**: Acceso root directo
3. **Contactar al proveedor VPS** con documentación legal

### Escenario 4: Servidor comprometido
**Problema**: Sospechas que alguien entró

**Soluciones**:
1. **Análisis rápido**:
   ```bash
   ssh emergency_admin@tu-servidor -p 2234
   sudo last | head -20  # Ver últimos accesos
   sudo netstat -tlnp    # Ver servicios activos
   sudo ps aux | grep -v root | grep -v daemon  # Procesos sospechosos
   ```

2. **Bloqueo inmediato**:
   ```bash
   # Cerrar todo SSH excepto tu IP actual:
   sudo iptables -F INPUT
   sudo iptables -A INPUT -s $(curl -s ifconfig.me) -j ACCEPT
   sudo iptables -A INPUT -j DROP
   ```

---

## 🔧 COMANDOS DE EMERGENCIA ÚTILES

### Verificar quién está conectado:
```bash
sudo who
sudo last | head -10
sudo netstat -tnpa | grep :22
```

### Reiniciar servicios críticos:
```bash
sudo systemctl restart sshd
sudo systemctl restart fail2ban
sudo systemctl restart ufw
```

### Hacer backup de emergencia:
```bash
sudo tar -czf /tmp/emergency-backup-$(date +%Y%m%d).tar.gz /etc /var/log /home
```

### Restaurar firewall a estado seguro:
```bash
sudo /usr/local/bin/rate-limiting-ssh.sh
sudo /usr/local/bin/advanced-geoblock.sh
sudo /usr/local/bin/fix-dashboard-access.sh  # Importante: restaurar acceso al dashboard
```

### Verificar funcionamiento del dashboard:
```bash
curl -s http://localhost:8080/ | head -5  # Debe mostrar HTML
sudo netstat -tlnp | grep :8080          # Debe mostrar python escuchando
```

---

## 📞 CONTACTOS DE EMERGENCIA

### Proveedor VPS
- **Nombre**: [Tu proveedor]
- **Panel**: [URL del panel]
- **Soporte**: [Email/teléfono]
- **Consola web**: [URL de acceso]

### Personas de confianza con estas credenciales
- **Nombre**: ________________
- **Contacto**: _______________
- **Ubicación**: _____________

---

## 🔐 MEDIDAS PREVENTIVAS

### Scripts de seguridad disponibles:
```bash
/usr/local/bin/emergency-access-system.sh   # Sistema de acceso de emergencia
/usr/local/bin/rate-limiting-ssh.sh         # Rate limiting SSH
/usr/local/bin/advanced-geoblock.sh         # Geoblocking por países
/usr/local/bin/fix-dashboard-access.sh      # Reparar acceso al dashboard
/usr/local/bin/console-recovery.sh          # Recuperación por consola VPS
```

### Backups automáticos de configuración:
```bash
# Ejecutar cada semana:
sudo tar -czf ~/config-backup-$(date +%Y%m%d).tar.gz /etc/ssh /etc/fail2ban /usr/local/bin
```

### Monitoreo de accesos:
```bash
# Revisar logs regularmente:
sudo journalctl -u sshd --since "24 hours ago" | grep "Accepted"
```

### Rotación de credenciales de emergencia:
```bash
# Cada 3 meses, cambiar contraseña:
sudo /usr/local/bin/emergency-access-system.sh emergency-user
```

---

## ⚡ ACCIONES INMEDIATAS EN EMERGENCIA

1. **Mantén la calma** 🧘‍♂️
2. **Identifica el problema específico** 🔍
3. **Usa la solución correspondiente** 🛠️
4. **Documenta lo que pasó** 📝
5. **Mejora las medidas preventivas** 🔒

---

**IMPORTANTE**: Imprime esta guía y guárdala físicamente. Los accesos digitales pueden fallar cuando más los necesites.

**Nota**: Las credenciales reales se configuran durante la instalación y se almacenan fuera de este repositorio por seguridad.

**Última actualización**: Template version
**Servidor**: [CONFIGURAR]
**IP del servidor**: [CONFIGURAR]
