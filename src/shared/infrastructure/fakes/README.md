# Adaptadores simulados

Acá viven los dobles de cada servicio externo: calendario, correo, modelo del bot
y almacén. Cumplen el mismo puerto que el adaptador real, con latencia simulada y
escenarios de error activables.

**No son andamio descartable.** Son tres cosas a la vez (`docs/BUILD.md` §3):

1. El entorno de las pruebas de integración.
2. El modo demostración comercial, que es lo que se le muestra a un cliente.
3. La garantía de que el sistema completo se recorre de punta a punta sin una sola
   credencial real.

Se quedan en el repositorio para siempre. Llegan en **P4**, junto con sus puertos.
