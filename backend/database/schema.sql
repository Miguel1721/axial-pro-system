-- ==============================================================================
-- 🏗️ AXIAL PRO CLINIC - CORE DATABASE SCHEMA
-- ==============================================================================

-- 1. USUARIOS (Sistema RBAC)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('admin', 'medico', 'recepcion', 'caja')) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PACIENTES (CRM y Fidelización)
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_nacimiento DATE,
    diagnostico_principal TEXT,
    eva_promedio INTEGER CHECK (eva_promedio >= 0 AND eva_promedio <= 10),
    tiene_rx BOOLEAN DEFAULT false,
    notas_crm TEXT,
    ultima_visita TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BONOS (Paquetes Prepagados)
CREATE TABLE bonos_paciente (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    nombre_paquete VARCHAR(100) NOT NULL,
    sesiones_totales INTEGER NOT NULL,
    sesiones_usadas INTEGER DEFAULT 0,
    precio_pagado DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CABINAS (Gestión de Espacios)
CREATE TABLE cabinas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('disponible', 'ocupada', 'limpieza')) DEFAULT 'disponible',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CATÁLOGO DE SERVICIOS
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    comision_porcentaje DECIMAL(3,2) DEFAULT 0.00,
    requiere_parametros BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true
);

-- 6. CATÁLOGO DE ADICIONALES
CREATE TABLE adicionales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    comision_porcentaje DECIMAL(3,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT true
);

-- 7. INVENTARIO (Bodega)
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock_actual DECIMAL(10,2) DEFAULT 0,
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    unidad_medida VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. RECETAS (Insumos por Servicio/Adicional)
CREATE TABLE recetas_servicios (
    servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
    inventario_id INTEGER REFERENCES inventario(id) ON DELETE CASCADE,
    cantidad_requerida DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (servicio_id, inventario_id)
);

CREATE TABLE recetas_adicionales (
    adicional_id INTEGER REFERENCES adicionales(id) ON DELETE CASCADE,
    inventario_id INTEGER REFERENCES inventario(id) ON DELETE CASCADE,
    cantidad_requerida DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (adicional_id, inventario_id)
);

-- 9. AGENDA (Citas y Abonos)
CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    servicio_id INTEGER REFERENCES servicios(id),
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(30) CHECK (estado IN ('esperando_abono', 'confirmada', 'en_sala', 'atendido', 'cancelada')) DEFAULT 'esperando_abono',
    abono_pagado DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. SESIONES (El núcleo clínico)
CREATE TABLE sesiones (
    id SERIAL PRIMARY KEY,
    cabina_id INTEGER REFERENCES cabinas(id),
    paciente_id INTEGER REFERENCES pacientes(id),
    medico_id INTEGER REFERENCES usuarios(id),
    servicio_id INTEGER REFERENCES servicios(id),
    estado VARCHAR(30) CHECK (estado IN ('en_proceso', 'finalizado', 'pagado')) DEFAULT 'en_proceso',

    -- Clínica
    nota_evolucion TEXT,
    param_traccion_kg DECIMAL(5,2),
    param_traccion_angulo DECIMAL(5,2),
    consentimiento_firmado BOOLEAN DEFAULT false,

    -- Tiempos
    hora_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_fin TIMESTAMP,

    -- Finanzas
    subtotal_base DECIMAL(10,2) DEFAULT 0.00,
    total_adicionales DECIMAL(10,2) DEFAULT 0.00,
    abono_previo DECIMAL(10,2) DEFAULT 0.00,
    usó_bono_id INTEGER REFERENCES bonos_paciente(id),
    total_final DECIMAL(10,2) DEFAULT 0.00
);

-- 11. ADICIONALES APLICADOS EN LA SESIÓN
CREATE TABLE sesiones_adicionales (
    id SERIAL PRIMARY KEY,
    sesion_id INTEGER REFERENCES sesiones(id) ON DELETE CASCADE,
    adicional_id INTEGER REFERENCES adicionales(id),
    precio_cobrado DECIMAL(10,2) NOT NULL
);

-- ==============================================================================
-- 🚀 INSERTS INICIALES (MOCK DATA PARA ARRANCAR EL SISTEMA)
-- ==============================================================================

-- Cabinas Básicas
INSERT INTO cabinas (nombre) VALUES
('Cabina 1 - Ajustes'),
('Cabina 2 - Fisioterapia'),
('Sala Axial Pro');

-- Servicios Iniciales
INSERT INTO servicios (nombre, precio_base, comision_porcentaje, requiere_parametros) VALUES
('Axial Pro (Descompresión)', 180000, 0.20, true),
('Quiropraxia Especializada', 120000, 0.30, false),
('Fisioterapia Integral', 100000, 0.25, false);

-- Adicionales Iniciales
INSERT INTO adicionales (nombre, precio, comision_porcentaje) VALUES
('Ventosas (Cupping)', 20000, 0.50),
('Electroestimulación', 15000, 0.00),
('Vendaje Neuromuscular', 25000, 0.00);

-- Inventario Inicial
INSERT INTO inventario (nombre, stock_actual, stock_minimo, unidad_medida) VALUES
('Sábana Desechable', 45, 20, 'und'),
('Aceite de Masaje (1L)', 5, 2, 'lts'),
('Parches TENS', 100, 50, 'und'),
('Cinta Kinesiológica', 4, 10, 'rollos');

-- Vincular recetas
INSERT INTO recetas_servicios (servicio_id, inventario_id, cantidad_requerida) VALUES
(3, 2, 0.10),
(3, 3, 2.00);

-- Usuario administrador inicial
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Dr. Admin', 'admin@axial.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZeUfkZMBs9kYZP6', 'admin');