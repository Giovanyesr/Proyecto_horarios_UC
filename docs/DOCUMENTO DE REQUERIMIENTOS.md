# **DOCUMENTO DE REQUERIMIENTOS**

## **1. Introducción**

El presente documento define los requerimientos funcionales y no
funcionales del sistema de generación de horarios académicos
inteligente. Estos requerimientos establecen las funcionalidades y
características de calidad que debe cumplir el sistema, asegurando su
correcta implementación y alineación con el problema identificado.

## **2. Requerimientos funcionales (RF)**

Los requerimientos funcionales describen las funcionalidades que el
sistema debe proporcionar.

  **ID**   **Requerimiento**                    **Descripción**                                                      **Actor**
  -------- ------------------------------------ -------------------------------------------------------------------- ---------------
  RF1      Registrar docentes                   El sistema debe permitir registrar información de docentes           Administrador
  RF2      Registrar cursos                     El sistema debe permitir registrar cursos académicos                 Administrador
  RF3      Registrar aulas                      El sistema debe permitir registrar aulas disponibles                 Administrador
  RF4      Definir disponibilidad de docentes   El sistema debe permitir ingresar horarios disponibles de docentes   Administrador
  RF5      Definir disponibilidad de aulas      El sistema debe permitir registrar disponibilidad de aulas           Administrador
  RF6      Generar horarios automáticamente     El sistema debe generar horarios académicos de forma automática      Administrador
  RF7      Detectar conflictos                  El sistema debe identificar conflictos en horarios generados         Sistema
  RF8      Editar horarios                      El sistema debe permitir modificar horarios manualmente              Administrador
  RF9      Visualizar horarios                  El sistema debe mostrar horarios por docente, aula y curso           Usuario
  RF10     Exportar horarios                    El sistema debe exportar horarios en formatos PDF o Excel            Usuario

## **3. Requerimientos no funcionales (RNF)**

Los requerimientos no funcionales describen las características de
calidad del sistema.

  -------------------------------------------------------------------------
  **ID**   **Requerimiento**   **Descripción**
  -------- ------------------- --------------------------------------------
  RNF1     Rendimiento         El sistema debe generar horarios en menos de
                               10 segundos

  RNF2     Usabilidad          La interfaz debe ser intuitiva y fácil de
                               usar

  RNF3     Accesibilidad       El sistema debe ser accesible desde
                               navegadores web

  RNF4     Seguridad           El sistema debe contar con autenticación de
                               usuarios

  RNF5     Disponibilidad      El sistema debe estar disponible 24/7
  -------------------------------------------------------------------------

## **4. Trazabilidad de requerimientos**

La trazabilidad permite relacionar los requerimientos con el problema
identificado.

  ------------------------------------------
  **Problema            **Requerimiento
  identificado**        asociado**
  --------------------- --------------------
  Conflictos de         RF6, RF7
  horarios              

  Gestión manual        RF1, RF2, RF3
  ineficiente           

  Falta de optimización RF6

  Dificultad de         RF9
  visualización         
  ------------------------------------------

## **5. Criterios de aceptación**

Cada requerimiento debe cumplir con criterios verificables:

- El sistema debe registrar correctamente los datos ingresados

- El sistema debe generar horarios sin conflictos críticos

- El sistema debe permitir visualizar la información sin errores

## **6. Conclusión**

Este documento establece los requerimientos esenciales del sistema,
permitiendo guiar el desarrollo de la solución y asegurar que el
producto final cumpla con las necesidades identificadas.
