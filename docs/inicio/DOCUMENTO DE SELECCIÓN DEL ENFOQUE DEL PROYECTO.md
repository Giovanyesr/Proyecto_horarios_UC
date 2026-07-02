# **DOCUMENTO DE SELECCIÓN DEL ENFOQUE DEL PROYECTO**

## **1. Introducción**

El presente documento tiene como finalidad definir y justificar el
enfoque metodológico y tecnológico seleccionado para el desarrollo del
sistema de generación de horarios académicos inteligente. Dado que el
problema a resolver es de naturaleza compleja, con múltiples variables,
restricciones y posibles ambigüedades, es fundamental adoptar un enfoque
que permita flexibilidad, iteración y capacidad de adaptación.

## **2. Naturaleza del problema**

El problema de generación de horarios académicos pertenece a la
categoría de problemas de optimización combinatoria, caracterizados por
la existencia de múltiples soluciones posibles y la necesidad de
encontrar una solución óptima o cercana al óptimo.

Este tipo de problema presenta las siguientes características:

- Alta complejidad computacional

- Múltiples restricciones (duras y blandas)

- Gran cantidad de combinaciones posibles

- Necesidad de balancear múltiples criterios

## **3. Enfoque metodológico**

### **3.1 Selección de metodología**

Se ha seleccionado la metodología ágil Scrum para la gestión del
proyecto.

### **3.2 Justificación**

Scrum es adecuado debido a:

- Permite iteraciones cortas (sprints)

- Facilita la adaptación a cambios en requerimientos

- Promueve la colaboración del equipo

- Permite validar progresivamente el algoritmo y el sistema

Dado que el proyecto involucra incertidumbre en la definición de
restricciones y en la optimización del algoritmo, Scrum permite reducir
riesgos mediante entregas incrementales.

## **4. Enfoque tecnológico**

### **4.1 Arquitectura del sistema**

Se propone una arquitectura cliente-servidor basada en una aplicación
web, compuesta por:

- Frontend (interfaz de usuario)

- Backend (lógica de negocio)

- Base de datos (almacenamiento)

### **4.2 Tecnologías seleccionadas**

#### **Frontend**

- React.js

**Justificación:**

- Permite desarrollar interfaces dinámicas y reactivas

- Alta reutilización de componentes

- Amplia comunidad y soporte

#### **Backend**

- Node.js (con Express)

**Justificación:**

- Manejo eficiente de múltiples solicitudes

- Facilidad de integración con frontend

- Amplio ecosistema de librerías

#### **Base de datos**

- MySQL

**Justificación:**

- Modelo relacional adecuado para datos estructurados

- Alta confiabilidad

- Facilidad de consulta

## **5. Enfoque de optimización**

### **5.1 Alternativas consideradas**

Se evaluaron las siguientes alternativas:

- Programación lineal

- Algoritmos voraces (greedy)

- Algoritmos genéticos

- Búsqueda local (hill climbing)

### **5.2 Alternativa seleccionada**

Se selecciona el uso de algoritmos genéticos.

### **5.3 Justificación**

Los algoritmos genéticos son adecuados porque:

- Permiten explorar grandes espacios de soluciones

- Manejan múltiples restricciones de manera flexible

- Generan soluciones cercanas al óptimo en tiempos razonables

- Son ampliamente utilizados en problemas de generación de horarios

## **6. Consideraciones de calidad**

El sistema será desarrollado considerando los siguientes atributos de
calidad:

- Usabilidad: interfaz intuitiva

- Rendimiento: generación rápida de horarios

- Escalabilidad: capacidad de manejar mayor cantidad de datos

- Seguridad: control de acceso mediante autenticación

## **7. Limitaciones del enfoque**

A pesar de sus ventajas, el enfoque presenta algunas limitaciones:

- Los algoritmos genéticos no garantizan una solución óptima exacta

- Requieren ajuste de parámetros (tasa de mutación, población, etc.)

- Dependencia de la calidad de los datos de entrada

## **8. Conclusión**

El enfoque metodológico basado en Scrum, junto con una arquitectura web
moderna y el uso de algoritmos genéticos, proporciona una solución
adecuada para abordar la complejidad del problema de generación de
horarios académicos. Este enfoque permite equilibrar eficiencia,
flexibilidad y capacidad de adaptación, asegurando el desarrollo de un
sistema funcional y alineado con las necesidades del proyecto.
