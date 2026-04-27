# **DOCUMENTO DE SUPUESTOS Y RESTRICCIONES**

## **1. Introducción**

El presente documento identifica y describe los supuestos y
restricciones del proyecto de desarrollo del sistema de generación de
horarios académicos inteligente. Estos elementos son fundamentales para
comprender el contexto en el cual se desarrollará el proyecto, así como
las limitaciones y condiciones bajo las cuales se tomarán decisiones.

## **2. Supuestos del proyecto**

Los supuestos son condiciones que se consideran verdaderas para efectos
de la planificación del proyecto, aunque no estén completamente
verificadas.

### **2.1 Lista de supuestos**

  **ID**   **Supuesto**                      **Descripción**                                                                                     **Impacto**
  -------- --------------------------------- --------------------------------------------------------------------------------------------------- -------------
  S1       Disponibilidad de datos           Se asume que la institución proporcionará datos completos y correctos de docentes, cursos y aulas   Alto
  S2       Acceso a internet                 Se asume que los usuarios contarán con acceso estable a internet                                    Medio
  S3       Conocimiento técnico del equipo   Se asume que el equipo posee conocimientos en desarrollo web y metodologías ágiles                  Alto
  S4       Estructura académica definida     Se asume que la institución tiene una estructura académica organizada                               Alto
  S5       Uso del sistema                   Se asume que los usuarios adoptarán el sistema una vez implementado                                 Medio

### **2.2 Justificación de los supuestos**

Los supuestos permiten avanzar en la planificación sin necesidad de
contar con toda la información desde el inicio. Sin embargo, su validez
deberá ser verificada durante el desarrollo del proyecto para evitar
riesgos.

## **3. Restricciones del proyecto**

Las restricciones son limitaciones reales que condicionan el desarrollo
del proyecto y deben ser consideradas obligatoriamente.

### **3.1 Lista de restricciones**

  **ID**   **Restricción**            **Descripción**                                                           **Impacto**
  -------- -------------------------- ------------------------------------------------------------------------- -------------
  R1       Tiempo limitado            El proyecto debe desarrollarse dentro del periodo académico establecido   Alto
  R2       Recursos tecnológicos      Limitación en infraestructura y herramientas disponibles                  Medio
  R3       Complejidad del problema   El problema de generación de horarios es altamente complejo               Alto
  R4       Calidad de los datos       Dependencia de la calidad de los datos ingresados al sistema              Alto
  R5       Limitación del algoritmo   Los algoritmos pueden no garantizar soluciones óptimas exactas            Medio

### **3.2 Justificación de las restricciones**

Las restricciones definen el marco real en el que se desarrollará el
proyecto. Estas limitaciones influyen directamente en la toma de
decisiones, especialmente en la selección del enfoque tecnológico y
metodológico.

## **4. Relación entre supuestos y riesgos**

Los supuestos pueden convertirse en riesgos si no se cumplen. Por
ejemplo:

- Si los datos no son correctos (S1), el sistema generará horarios
  incorrectos.

- Si los usuarios no adoptan el sistema (S5), el impacto del proyecto
  será limitado.

Por ello, es necesario monitorear constantemente estos supuestos.

## **5. Estrategias de mitigación**

Para reducir el impacto de las restricciones y validar los supuestos, se
plantean las siguientes estrategias:

- Validación de datos de entrada

- Pruebas iterativas del sistema

- Capacitación a usuarios

- Uso de metodologías ágiles para adaptación continua

## **6. Conclusión**

La identificación de supuestos y restricciones permite establecer una
base realista para el desarrollo del proyecto. Este análisis contribuye
a la toma de decisiones informadas y a la reducción de riesgos,
asegurando una mejor planificación y ejecución del sistema.
