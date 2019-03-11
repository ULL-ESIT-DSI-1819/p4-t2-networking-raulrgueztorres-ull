## Práctica 4 - Networking.

Los servicios de red tienen dos objetivos: conectar dos puntos y transmitir informacion entre ellos.

No importa que tipo de información estemos transmitiendo, siempre deberemos hacer una conexión primero.

## Enlace de un servidor a un puerto `TCP`.

La conexión de un `Socket TCP` consiste en dos puntos finales. Un punto final se une a un puerto numerado mientras que el otro se conecta a un puerto.

Esto funciona como en los sistemas telefónicos. 

En Node las operaciones de enlace y conexión son proporcionadas por el módulo `net`.  

![1](https://user-images.githubusercontent.com/47355927/54155210-8feddb00-443b-11e9-9fc6-0cbd1e2193b4.png)

El método `net.createServer` coge una `callback` y devuelve un objeto servidor. La `callback` se invoca cuando se conecta otro punto. El parámetro de conexión es un objecto `Socket` que se puede usar para enviar y recibir datos.

El método `server.listen` nos permite escuchar por el puerto indicado.

![esquema](https://user-images.githubusercontent.com/47355927/54155259-a72cc880-443b-11e9-9e3f-8e2b2b246367.png)

## Escribir datos en un Socket.

![2](https://user-images.githubusercontent.com/47355927/54155324-c9bee180-443b-11e9-9d9d-e50248c35101.png)

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

![ejecucion1](https://user-images.githubusercontent.com/47355927/54155377-e6f3b000-443b-11e9-9252-3f2dbfa717bf.png)

Un esquema detallado de lo que sucede sería el siguiente.

![esquema2](https://user-images.githubusercontent.com/47355927/54155400-f4a93580-443b-11e9-92b7-440f05041bb2.png)

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

![connection](https://user-images.githubusercontent.com/47355927/54155432-08549c00-443c-11e9-8080-5bffdf03f9ed.png)

Ahora ejecutamos el nuevo archivo guardado como `net-watcher-json-service.js`

![server-json](https://user-images.githubusercontent.com/47355927/54155450-12769a80-443c-11e9-9890-1a4681d88e77.png)

## Creación de cliente de conexiones sockets.

![json-client](https://user-images.githubusercontent.com/47355927/54155466-1d312f80-443c-11e9-9136-2e165547b4c6.png)

Este programa es un pequeño cliente que utiliza `net.connect` para crear una conexión cliente en el puerto especificado del localhost. Cuando llega algún dato es parseado y se muestra adecuadamente por consola.

![ejec-client-json](https://user-images.githubusercontent.com/47355927/54155575-55387280-443c-11e9-81a3-a8a88d2d9a6b.png)

Tenemos un problema por ahora y es que no estamos manejando errores.

## Problema del límite de mensajes.

En el mejor de los casos los mensajes llegarán a la vez. El problema es que a veces llegaran en diferentes pedazos de datos. Necesitamos lidiar con este problema cuando ocurra.

El protocolo LDJ que desarrollamos anteriormente separa los mensajes con nuevas lineas. 

![message-style](https://user-images.githubusercontent.com/47355927/54155600-61243480-443c-11e9-8243-1c1b3a883102.png)

Si llegara un mensaje separado llegaria como dos datos. Quedaría algo así:

![split-message](https://user-images.githubusercontent.com/47355927/54155611-6aad9c80-443c-11e9-95a6-b61fcedbce31.png)

## Implementando un servicio de pruebas.

Implementaremos un servicio de pruebas que divide a propósito un mensaje en múltiples partes.

![test-json](https://user-images.githubusercontent.com/47355927/54155630-76995e80-443c-11e9-99a6-5e9c09f71bdb.png)

Una vez guardado ejecutamos y comprobamos el error de que solo recibe en primer lugar un fragmento del mensaje. Como ya comentamos lo que hace es parsear el mensaje que le llega y como solo coge lo primero que le llegó salta el error al estar incompleto.

![error-client](https://user-images.githubusercontent.com/47355927/54155647-80bb5d00-443c-11e9-9950-84b862c7b893.png)

## Creación de módulos personalizados.

El programa cliente tiene dos tareas que hacer. Una es almacenar los datos entrantes en mensajes. La otra es manejar cada mensaje cuando llega.

En lugar de agrupar estos dos trabajos en un solo programa, lo correcto es convertir al menos uno de ellos en un módulo.

## Extender EventEmitter.

Para liberar al programa cliente del peligro de dividir los mensajes JSON, implementaremos un módulo de cliente de buffer LDJ.

## Herencia en Node.

Este código configura LDJClient para heredar de EventEmitter.

![ldj-client](https://user-images.githubusercontent.com/47355927/54155667-8ca71f00-443c-11e9-86bc-81f86d7ee6c4.png)

## Eventos de datos de almacenamiento en buffer.

![modificada-ldj](https://user-images.githubusercontent.com/47355927/54155682-9761b400-443c-11e9-8318-ec8cd0c0fd82.png)

## Exportando funcionalidad en un módulo

![añadido](https://user-images.githubusercontent.com/47355927/54155703-a21c4900-443c-11e9-9ebd-7ee63e7d3257.png)

Dentro de la definición de clase, después del constructor, estamos agregando un método estático llamado `connect`.

El código para usar el módulo sería algo como esto

![libreria](https://user-images.githubusercontent.com/47355927/54155717-acd6de00-443c-11e9-8f98-41e1ca1ea5e7.png)

O podríamos usar el método `connect`.

![lib-connect](https://user-images.githubusercontent.com/47355927/54155738-b6604600-443c-11e9-8c3c-f7ee21b8ca53.png)

## Importando un módulo Node.js

![ldj-module-use](https://user-images.githubusercontent.com/47355927/54155762-bf511780-443c-11e9-861b-1b616a823e3d.png)

La principal diferencia respecto a lo anterior es que, en lugar de enviar buffers de datos directamente a JSON.parse , este programa se basa en el módulo ldj-client para producir eventos de mensajes .

Ejecutamos el servidor de pruebas y el nuevo cliente.

![prueba](https://user-images.githubusercontent.com/47355927/54155778-caa44300-443c-11e9-9fce-b2620b5a0266.png)

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

![test1](https://user-images.githubusercontent.com/47355927/54155820-d6900500-443c-11e9-8645-f11bf4166f1c.png)

## Ejecución.

Para poder ejecutar tenemos que añadir en el `package.json` lo siguiente en la sección `test`

![json](https://user-images.githubusercontent.com/47355927/54155846-e0b20380-443c-11e9-90d4-664ef8792048.png)

A continuación, ejecutamos con `npm test`.

![ejec1](https://user-images.githubusercontent.com/47355927/54155867-e90a3e80-443c-11e9-98e0-290694a9f27b.png)

## Añadir más test asíncronos.

Modificamos el `describe` de la siguiente manera

![describemod](https://user-images.githubusercontent.com/47355927/54155885-f32c3d00-443c-11e9-8eff-25a205b7e12c.png)

Esta prueba divide el mensaje en dos partes para ser emitidas por el `stream` uno después del otro.

Si se quiere especificar un tiempo para un test puede usar el `timeout`

![timeout](https://user-images.githubusercontent.com/47355927/54155918-ffb09580-443c-11e9-8157-971b04249b64.png)


## 	Testability

* Test que divide un mensaje en dos o más pedazos.

![3](https://user-images.githubusercontent.com/47355927/54156030-3e465000-443d-11e9-9506-e9c69bb6ba0b.png)

* Test que pasa un objecto nulo y detecta el error.

![4](https://user-images.githubusercontent.com/47355927/54156049-4e5e2f80-443d-11e9-98cd-9474b5660833.png)

## Robustness.

* En caso de que el formato JSON que se reciba no sea adecuado el servidor se cerrará y el cliente verá la notificación del error.

* Aquí tenemos un test para enviar y detectar el error de pasar un mensaje que no es JSON. 

![5](https://user-images.githubusercontent.com/47355927/54156090-633ac300-443d-11e9-93ec-7acc432be21e.png)

* Si falta el último salto de linea lo que pasa es que se quedará esperando y nunca emitirá el mensaje. Para poder manejar esta situación implementamos un evento `close` que comprobará si existe o no un `\n` al final del JSON. En caso de no existir lanza el error o, en caso contrario, emite el mensaje.

![6](https://user-images.githubusercontent.com/47355927/54156135-89606300-443d-11e9-989e-cfcb90f5745d.png)
![7](https://user-images.githubusercontent.com/47355927/54156142-8a919000-443d-11e9-9733-cb5e802760fc.png)







