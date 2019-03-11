## Práctica 4 - Networking.

Los servicios de red tienen dos objetivos: conectar dos puntos y transmitir informacion entre ellos.

No importa que tipo de información estemos transmitiendo, siempre deberemos hacer una conexión primero.

## Enlace de un servidor a un puerto `TCP`.

La conexión de un `Socket TCP` consiste en dos puntos finales. Un punto final se une a un puerto numerado mientras que el otro se conecta a un puerto.

Esto funciona como en los sistemas telefónicos. 

En Node las operaciones de enlace y conexión son proporcionadas por el módulo `net`.  

Captura binding-net.js

El método `net.createServer` coge una `callback` y devuelve un objeto servidor. La `callback` se invoca cuando se conecta otro punto. El parámetro de conexión es un objecto `Socket` que se puede usar para enviar y recibir datos.

El método `server.listen` nos permite escuchar por el puerto indicado.

Captura Esquema

## Escribir datos en un Socket.

Captura net-watcher

Ecribimos este código con el nombre `net-watcher.js`. Como podemos ver le pasamos el nombre del fichero a observar como argumento. En caso de que el usuario no proporcione ninguno devolveremos un error personalizado.

Con el método `connection.write` podemos escribir en el cliente y con `watcher.close` cerramos la conexión.

Invocamos `server.listen` cuando se enlaza correctamente con el puerto especificado y esta listo para recibir conexiones.

## Conexión a un servidor Socket TCP con Netcat.

Para probar el fichero `net-watcher.js` necesitamos 3 terminales:
	
* Una de servidor.	
* Una de cliente.
* Una para los cambios en el fichero.

En una terminal usaremos el comando `watch -n 1 touch target.txt` para 	modificar el fichero cada segundo.

En la segunda terminal ejecutaremos el servidor `node net-watcher.js target.txt`.
Por último, en una tercera terminal, usaremos Netcat para conectarnos. Usaremos `nc localhost 60300`. Netcat es un programa de utilidad de Socket.

Captura ejecucion1.

Un esquema detallado de lo que sucede sería el siguiente.

Captura esquema2.

## Escuchando en Sockets Unix.

Para ver como funciona `net` en los sockets Unix modificamos el programa anterior . 

Cambiamos el listen final por `listen(‘/tmp/watcher.sock’, () => console.log(‘Listening for subscribers...’));`.

Este archivo lo guardamos como `net-watcher-unix.js`.

`NOTA: si se recibe un error EADDRINUSE debe eliminar el watcher.sock antes de ejecutar el programa de nuevo.`

La ejecución será igual que la anterior pero al `nc` le añadiremos la opción `-U` seguido de `/tmp/watcher.sock`.

Los sockets Unix pueden ser más rápidos que los sockets TCP porque no requieren invocar al hardware de red. 

## Implementando un protocolo de mensajería.

Un protocolo es un conjunto de reglas que definen como se comunican los puntos en un sistema. En `Node` estaremos trabajando con uno o más protocolos. Vamos a crear  un protocolo basado en pasar mensajes `JSON` a través de `TCP`.

## Serialización de mensajes con JSON.

Cada mensaje será un objeto serializado JSON.  Basicamente es un hash clave - valor.

`{“key: “value”, “anotherKey”: “anotherValue”}`

El servicio `net-watcher` que hemos creado envía dos tipos de mensajes que necesitamos convertir a  JSON:

* Cuando la conexión se establece por primera vez.
* Cuando el fichero se modifica.

Podemos codificar el primer tipo de la siguiente manera: 

`{“type”: “watching”, “file”: “target.txt”}`

Y el segundo de la siguiente:

`{“type”: “changed”, “timestamp”: 1358175733785}`
El campo `timestamp` contiene un valor entero que representa el número de milisegundos desde la medianoche del 1 de enero de 1970. Podemos obtener la fecha actual con `Date.now`.

Destacar que no usamos saltos de linea en nuestro mensaje JSON. Utilizamos en este caso los saltos de linea para separar los mensajes. Esto sería JSON delimitado por lineas (LDJ).

## Cambiando a mensajes JSON.

A continuación modificamos el servicio `net-watcher` para emplear el protocolo que hemos definido.

Nuestra tarea es usar `JSON.stringify` para codificar objectos de mensaje y enviarlos mediante `connection.write`. Con `JSON.stringify` lo que hacemos es coger un objeto JavaScript y devolver un string en forma de JSON.

Lo que haremos es modificar el `connection.write`.

Captura connection

Ahora ejecutamos el nuevo archivo guardado como `net-watcher-json-service.js`

captura server-json

## Creación de cliente de conexiones sockets.

Captura json-client

Este programa es un pequeño cliente que utiliza `net.connect` para crear una conexión cliente en el puerto especificado del localhost. Cuando llega algún dato es parseado y se muestra adecuadamente por consola.

Captura ejec-client-json

Tenemos un problema por ahora y es que no estamos manejando errores.

## Problema del límite de mensajes.

En el mejor de los casos los mensajes llegarán a la vez. El problema es que a veces llegaran en diferentes pedazos de datos. Necesitamos lidiar con este problema cuando ocurra.

El protocolo LDJ que desarrollamos anteriormente separa los mensajes con nuevas lineas. 

Captura message-style.

Si llegara un mensaje separado llegaria como dos datos. Quedaría algo así:

Captura split-message

## Implementando un servicio de pruebas.

Implementaremos un servicio de pruebas que divide a propósito un mensaje en múltiples partes.

Captura test-json

Una vez guardado ejecutamos y comprobamos el error de que solo recibe en primer lugar un fragmento del mensaje. Como ya comentamos lo que hace es parsear el mensaje que le llega y como solo coge lo primero que le llegó salta el error al estar incompleto.

Captura error-client

## Creación de módulos personalizados.

El programa cliente tiene dos tareas que hacer. Una es almacenar los datos entrantes en mensajes. La otra es manejar cada mensaje cuando llega.

En lugar de agrupar estos dos trabajos en un solo programa, lo correcto es convertir al menos uno de ellos en un módulo.

## Extender EventEmitter.

Para liberar al programa cliente del peligro de dividir los mensajes JSON, implementaremos un módulo de cliente de buffer LDJ.

## Herencia en Node.

Este código configura LDJClient para heredar de EventEmitter.

Captura ldj-client

## Eventos de datos de almacenamiento en buffer.


Captura modificada-ldj

## Exportando funcionalidad en un módulo

captura añadido 

Dentro de la definición de clase, después del constructor, estamos agregando un método estático llamado `connect`.

El código para usar el módulo sería algo como esto

captura librería

O podríamos usar el método `connect`.

Captura lib-connect

## Importando un módulo Node.js

captura ldj-module-use

La principal diferencia respecto a lo anterior es que, en lugar de enviar buffers de datos directamente a JSON.parse , este programa se basa en el módulo ldj-client para producir eventos de mensajes .

Ejecutamos el servidor de pruebas y el nuevo cliente.

Captura prueba

## Desarrollando pruebas con Mocha.

Mocha es un marco de pruebas para `Node`.  Lo instalamos con `npm` y desarrollamos diferentes pruebas para `LDJClient`.

## Instalación de Mocha.

* En la carpeta `networking` generamos un JSON con `npm init -y`.
* Posteriormente instalamos mocha con `npm install --save-dev --save-exact mocha@3.4.2`.

Se habrá creado un directorio llamado `node_modules` que contiene `mocha` y sus dependencias.

Además, el fichero `package.json` contiene ahora una linea de dependencia de `mocha`.

## Test con Mocha.

Creamos un subdirectorio llamado `test` que es donde por defecto `Mocha` buscará.

Desarrollamos un fichero de pruebas

captura test1

## Ejecución.

Para poder ejecutar tenemos que añadir en el `package.json` lo siguiente en la sección `test`

captura json

A continuación, ejecutamos con `npm test`.

Captura ejec1.

## Añadir más test asíncronos.

Modificamos el `describe` de la siguiente manera

Captura describemod

Esta prueba divide el mensaje en dos partes para ser emitidas por el `stream` uno después del otro.

Si se quiere especificar un tiempo para un test puede usar el `timeout`

captura timeout


##Testability

* Test que divide un mensaje en dos o más pedazos.

Captura split 

* Test que pasa un objecto nulo y detecta el error.

Captura error-null 

## Robustness.

* En caso de que el formato JSON que se reciba no sea adecuado el servidor se cerrará y el cliente verá la notificación del error.

* Aquí tenemos un test para enviar y detectar el error de pasar un mensaje que no es JSON. 

Captura de not-json

* Si falta el último salto de linea lo que pasa es que se quedará esperando y nunca emitirá el mensaje. Para poder manejar esta situación implementamos un evento `close` que comprobará si existe o no un `\n` al final del JSON. En caso de no existir lanza el error o, en caso contrario, emite el mensaje.

Captura close 







