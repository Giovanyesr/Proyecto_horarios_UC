**UNIVERSIDAD CONTINENTAL**

**FACULTAD DE INGENIERÍA**

**ESCUELA ACADÉMICO PROFESIONAL DE INGENIERÍA DE SISTEMAS E
INFORMÁTICA**

![](media/image1.png){width="2.827298775153106in"
height="0.7874015748031497in"}

**TALLER DE PROYECTO II**

**Sistema de generación optima de horarios académicos en entornos de
currículo flexible**

# PORTADA

**PRESENTADO POR:**

  -----------------------------------------------------------------------
                 **APELLIDOS Y NOMBRES**                    **CÓDIGO**
  ------------------------------------------------------ ----------------
             **SANCHEZ RAMOS Giovany Elver**               **75185427**

                                                         

                                                         
  -----------------------------------------------------------------------

**DOCENTE: Ing. GAMARRA MORENO Daniel**

**HUANCAYO -- PERÚ**

**2026\**

# LISTA DE CONTENIDO

## 

## CAPITULO I

1.  Problema

    1.  Descripción del problema

> La generación de horarios académicos en universidades con currículo
> flexible representa un problema complejo debido a la gran cantidad de
> variables y restricciones involucradas en el proceso de planificación
> académica.
>
> Actualmente, muchas instituciones realizan esta tarea de manera manual
> o con herramientas limitadas, lo que genera conflictos en los
> horarios, sobrecarga de docentes, mala utilización de aulas y
> dificultades para los estudiantes al momento de matricularse.
>
> El problema se vuelve aún más complejo cuando se consideran factores
> como la disponibilidad de docentes, la capacidad de las aulas, los
> prerrequisitos de los cursos y el límite de créditos permitidos por
> estudiante.
>
> Por ello, surge la necesidad de desarrollar un sistema informático que
> permita generar horarios académicos óptimos de forma automática,
> considerando múltiples restricciones y optimizando el uso de los
> recursos disponibles.

2.  Variables del problema

- Cursos: Asignaturas que forman parte del plan de estudios y que deben
  programarse en un horario.

- Docentes: Profesores encargados de dictar los cursos según su
  disponibilidad.

- Estudiantes: Alumnos que se matriculan en los cursos durante el
  semestre.

- Aulas: Espacios donde se realizan las clases y que tienen una
  capacidad limitada.

- Horarios: Días y horas en los que se dictan los cursos.

- Créditos académicos: Valor de cada curso que determina la carga
  académica del estudiante.

> 1.3 Stakeholders (Actores involucrados)
>
> Los actores involucrados en el sistema son:

- **Estudiantes:** quienes realizan la matrícula de cursos.

- **Docentes:** encargados de dictar los cursos.

- **Coordinadores académicos:** responsables de la planificación
  académica.

- **Administradores del sistema:** encargados de gestionar la
  información dentro del sistema.

![Imagen generada con IA](media/image2.png){width="3.9270833333333335in"
height="2.6152777777777776in"}

**1.**4 Ambigüedades del problema

Durante el análisis inicial se identificaron algunas ambigüedades:

1.  No se especifica el número exacto de cursos que puede dictar un
    docente.

2.  No se detalla si un curso puede tener múltiples horarios o
    secciones.

3.  No se define la prioridad entre restricciones cuando existen
    conflictos.

4.  No se indica si los estudiantes pueden elegir libremente todos los
    cursos.

1.5 Restricciones del problema

> Se identificaron las siguientes restricciones:

1.  Un docente no puede dictar dos cursos en el mismo horario.

2.  Un estudiante no puede estar matriculado en dos cursos
    simultáneamente.

3.  Las aulas tienen una capacidad máxima de estudiantes.

4.  Los cursos pueden tener prerrequisitos obligatorios.

5.  Existe un límite de créditos por estudiante entre 20 y 22

<!-- -->

2.  Enfoque del Proyecto

    1.  Metodología de desarrollo

> Se utilizará la metodología Scrum, la cual pertenece a los enfoques
> ágiles de desarrollo de software.
>
> Scrum permite organizar el trabajo en iteraciones cortas llamadas
> sprints, facilitando la entrega incremental del sistema, la mejora
> continua y la adaptación a cambios durante el desarrollo.
>
> **Justificación**

- Permite organizar el trabajo del equipo de manera iterativa.

- Facilita la comunicación y coordinación entre los integrantes.

- Permite detectar problemas tempranamente.

- Es ampliamente utilizada en proyectos de desarrollo de software.

2.2 Stack tecnológico seleccionado

![Imagen generada con IA](media/image3.png){width="4.479166666666667in"
height="2.9839610673665793in"}

2.3 Comparación de alternativas tecnológicas

  -----------------------------------------------------------------------
        Tecnología        Ventajas                Desventajas
  ----------------------- ----------------------- -----------------------
           React          Interfaz moderna y      Curva de aprendizaje
                          reutilización de        
                          componentes             

          Angular         Framework completo      Mayor complejidad

            Vue           Fácil de aprender       Menor adopción
                                                  empresarial

          Node.js         Alta velocidad, usa     Manejo complejo en
                          JavaScript en frontend  aplicaciones muy
                          y backend, gran         grandes
                          comunidad               

      Django (Python)     Seguro, robusto y con   Puede ser más pesado
                          muchas funcionalidades  para aplicaciones
                          integradas              pequeñas

    Spring Boot (Java)    Muy robusto y escalable Mayor complejidad y
                          para sistemas           configuración
                          empresariales           
  -----------------------------------------------------------------------

3.  Declaración de la visión del proyecto

### Visión del proyecto

> Desarrollar una aplicación web inteligente basada en algoritmos
> genéticos que permita automatizar la generación de horarios académicos
> en entornos universitarios con currículo flexible. El sistema
> analizará múltiples variables y restricciones académicas, garantizando
> la correcta asignación de aulas, docentes y horarios sin conflictos.

### Valor y alcance del proyecto

> El sistema busca optimizar el proceso de planificación académica,
> facilitando la generación de horarios y mejorando la gestión de los
> recursos institucionales. Su alcance incluye la gestión de información
> académica (docentes, cursos, estudiantes y aulas) y la generación y
> visualización de horarios, considerando inicialmente su implementación
> en una facultad piloto.

4.  Project Charter

> 4.1 Nombre del proyecto
>
> Sistema Inteligente de Generación de Horarios Académicos

4.2 Objetivo del proyecto

> Diseñar e implementar una aplicación web que permita generar
> automáticamente horarios académicos óptimos considerando restricciones
> de docentes, aulas, estudiantes y cursos.

4.3 Alcance del proyecto

El sistema permitirá:

- Registrar docentes

- Registrar estudiantes

- Registrar cursos

- Registrar aulas

- Validar matrícula

- Generar horarios automáticamente

- Visualizar horarios generados

4.4 Entregables

- Documento de análisis del problema

- Modelo del sistema

- Aplicación web funcional

- Código fuente del sistema

- Pruebas del sistema

- Video demostrativo

4.5 Riesgos del proyecto

  -----------------------------------------------------------------------
  Riesgo                                            Impacto
  ----------------------------------- -----------------------------------
  Complejidad del algoritmo de                       Alto
  generación de horarios              

  Falta de coordinación del equipo                   Medio

  Problemas técnicos en el desarrollo                Medio

  Cambios en los requerimientos                      Bajo
  -----------------------------------------------------------------------

5.  Registro de supuestos y restricciones

5.1 Supuestos

Los docentes registran correctamente su disponibilidad.

Los estudiantes respetan el límite de créditos permitido.

Las aulas tienen capacidad definida y registrada en el sistema.

La información académica ingresada es correcta.

Los estudiantes cumplen los prerrequisitos de cada curso.

5.2 Restricciones

> Un docente no puede dictar dos cursos al mismo tiempo.
>
> Un estudiante no puede tener cursos en horarios simultáneos.
>
> Cada aula tiene una capacidad máxima de estudiantes.
>
> Los cursos pueden requerir prerrequisitos.
>
> Los estudiantes deben respetar el límite de créditos permitidos.

6.  Declaración del equipo del proyecto

6.1 Integrantes

> Equipo conformado por dos estudiantes del programa de Ingeniería de
> Sistemas.

SANCHEZ RAMOS Giovany Elver 75185427

Xxxx

6.2 Roles del equipo

  ------------------------------------------------------------
            Rol            Responsabilidad
  ------------------------ -----------------------------------
       Product Owner       Definir requerimientos y priorizar
                           funcionalidades

        Scrum Master       Coordinar el desarrollo del
                           proyecto

     Backend Developer     Desarrollo de API y lógica del
                           sistema

     Frontend Developer    Desarrollo de la interfaz de
                           usuario
  ------------------------------------------------------------

6.3 Normas de trabajo

> Realizar reuniones de seguimiento semanales.
>
> Mantener comunicación constante entre los integrantes.
>
> Utilizar GitHub para el control de versiones.
>
> Documentar los avances del proyecto.
>
> Cumplir con las fechas establecidas para cada sprint.

7.  Requerimientos del Sistema

  ----------------------------------------------------------------------------------------
  ID     Requerimiento   Descripción       Actor           Trazabilidad   Criterios de
         Funcionales                                                      aceptación
  ------ --------------- ----------------- --------------- -------------- ----------------
  RF1    Registrar       El sistema debe   Administrador   Gestión de     El sistema
         estudiantes     permitir                          estudiantes    guarda
                         registrar la                                     correctamente
                         información de                                   los datos del
                         los estudiantes                                  estudiante.
                         en la base de                                    
                         datos.                                           

  RF2    Registrar       El sistema debe   Administrador   Gestión de     El sistema
         docentes        permitir                          docentes       registra y
                         registrar la                                     muestra
                         información de                                   correctamente
                         los docentes.                                    los datos del
                                                                          docente.

  RF3    Registrar       El sistema debe   Administrador / Gestión de     El curso se
         cursos          permitir          Coordinador     cursos         guarda
                         registrar los                                    correctamente
                         cursos                                           con sus datos.
                         disponibles en el                                
                         sistema.                                         

  RF4    Registrar aulas El sistema debe   Administrador   Gestión de     El aula se
                         permitir                          aulas          registra y se
                         registrar las                                    visualiza en el
                         aulas con su                                     sistema.
                         capacidad.                                       

  RF5    Validar         El sistema debe   Estudiante /    Proceso de     El sistema
         matrícula       verificar que los Sistema         matrícula      valida
                         estudiantes                                      prerrequisitos y
                         cumplan con los                                  créditos antes
                         requisitos para                                  de matricular.
                         matricularse en                                  
                         un curso.                                        

  RF6    Generar         El sistema debe   Coordinador     Generación de  El sistema crea
         horarios        generar           académico       horarios       horarios sin
                         automáticamente                                  conflictos de
                         los horarios                                     aula o docente.
                         académicos                                       
                         considerando                                     
                         restricciones.                                   

  RF7    Visualizar      El sistema debe   Estudiante /    Consulta de    El usuario puede
         horarios        permitir          Docente         horarios       ver su horario
                         visualizar los                                   correctamente.
                         horarios                                         
                         generados.                                       

  RF8    Modificar       El sistema debe   Coordinador     Gestión de     El sistema
         horarios        permitir          académico       horarios       permite editar y
                         modificar                                        guardar los
                         horarios                                         cambios del
                         generados cuando                                 horario.
                         sea necesario.                                   
  ----------------------------------------------------------------------------------------

  -------------------------------------------------------------------------------------------
  ID     Requerimiento no Descripción     Actor             Trazabilidad    Criterios de
         Funcionales                                                        aceptación
  ------ ---------------- --------------- ----------------- --------------- -----------------
  RNF1   Seguridad de     El sistema debe Sistema /         Seguridad       Los usuarios
         datos            proteger la     Administrador                     acceden solo con
                          información                                       credenciales
                          mediante                                          válidas.
                          autenticación y                                   
                          control de                                        
                          acceso.                                           

  RNF2   Tiempo de        El sistema debe Sistema           Rendimiento     El tiempo de
         respuesta        responder                                         respuesta no debe
                          rápidamente a                                     superar unos
                          las solicitudes                                   segundos.
                          de los                                            
                          usuarios.                                         

  RNF3   Facilidad de uso La interfaz del Usuarios          Usabilidad      Los usuarios
                          sistema debe                                      pueden realizar
                          ser intuitiva y                                   tareas sin
                          fácil de                                          dificultad.
                          utilizar.                                         

  RNF4   Escalabilidad    El sistema debe Sistema           Arquitectura    El sistema
                          soportar un                       del sistema     funciona
                          aumento de                                        correctamente con
                          usuarios y                                        más usuarios.
                          datos.                                            

  RNF5   Mantenibilidad   El sistema debe Desarrolladores   Mantenimiento   El código permite
                          permitir                          del sistema     actualizaciones
                          realizar                                          sin afectar el
                          mejoras y                                         funcionamiento.
                          mantenimiento                                     
                          fácilmente.                                       
  -------------------------------------------------------------------------------------------

8.  Repositorio GitHub

Se creará un repositorio en GitHub para gestionar el código fuente del
proyecto y facilitar el trabajo colaborativo.

El repositorio permitirá llevar un control de versiones del proyecto
mediante el uso de Git y facilitará el trabajo colaborativo entre los
integrantes del equipo.

## ![](media/image4.png){width="6.268055555555556in" height="2.102777777777778in"}

Link https://github.com/Giovanyesr/Proyecto_horarios_UC.git

## 

## 

## 

## 
