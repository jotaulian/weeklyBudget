// Variables y Selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');


// Eventos
eventListeners();
function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
}


// Clases
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto]; 
        this.calcularRestante();
    }

    calcularRestante(){
        //Reduce toma dos parametros, el primero es el total y el segundo el objeto actual:
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0 );
        this.restante = this.presupuesto - gastado;
    }
    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        console.log(this.gastos);
        this.calcularRestante();
    }
}

class UI{
    insertarPresupuesto( cantidad ){
        // Extraemos los valores con object destructuring, ya que 'cantidad' es un objeto:
        const { presupuesto, restante } = cantidad;

        // Los agregamos al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;

    }

    imprimirAlerta(mensaje, tipo){
        // Creamos elemento de alerta y le damos formato mediante clases dependiendo del tipo de alerta.
        const alerta = document.createElement('div');
        alerta.classList.add('text-center', 'alert');
        if(tipo === 'error'){
            alerta.classList.add('alert-danger');
        }else{
            alerta.classList.add('alert-success');
        };
        // Agregamos mensaje y lo insertamos en el HTML:
        alerta.textContent = mensaje;
        document.querySelector('.primario').insertBefore(alerta, formulario);

        // Se borra despues de 3 segundos
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

    mostrarGastos(gastos){
        //Borramos items previos antes de agregar todos.
        this.limpiarHTML();

        //Tomamos el array de objetos 'gastos' y hacemos lo siguiente:
        gastos.forEach(gasto => {
            // Tomamos datos del objeto
            const {concepto, cantidad, id} = gasto;
            //Creamos elemento 'li' y le damos el contenido
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.dataset.id = id; //Le damos un id al elemento
            //Insertamos el elemento en el HTML:
            item.innerHTML = `${concepto} <span class="badge badge-primary badge-pill"> ${cantidad} </span>`;

            //Botón para eliminar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () =>{
                eliminarGasto(id);
            }
            item.appendChild(btnBorrar);

            // Agregamos el nuevo item al HTML:
            gastoListado.appendChild(item);
        });
    }

    limpiarHTML(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;

    }

    //El siguiente método modifica el color de fondo del restante, de acuerdo al monto:
    comprobarPresupuesto(presupuestoObj){
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        
        //Comprobar 25%:
        if ( (presupuesto * 0.25) > restante ){
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        }else if ( (presupuesto * 0.5) > restante ){ //Comprobamos el 50%
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        }else{
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }
    }
}

// Instancias:
const ui = new UI();
let presupuesto;

// Funciones
function preguntarPresupuesto(){
    const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
        window.location.reload();
    };

    // Si pasa la validación ya podemos utilizarlo:
    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e){
    e.preventDefault();
    
    // Leemos inputs del formulario:
    const concepto = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    
    //Validación de inputs del formulario:
    if( concepto === ''){
        ui.imprimirAlerta('Por favor, introduce el nombre del gasto.', 'error');
        return;
    }else if(cantidad === '' ){
        ui.imprimirAlerta('Por favor, introduce la cantidad.', 'error');
        return;
    }else if( cantidad <= 0 || isNaN(cantidad)){
        ui.imprimirAlerta('Por favor, introduce una cantidad válida.', 'error');
        return;
    }

    //Generar objeto con el gasto
    const gasto = {concepto, cantidad, id: Date.now() };
    // Lo añadimos al array y mostramos alerta:
    presupuesto.nuevoGasto(gasto);
    ui.imprimirAlerta('Agregado correctamente.');

    
    // Agregamos el gasto
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);
    
    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    //Reiniciamos el formulario:
    formulario.reset();
    
}

function eliminarGasto(id){
    //Eliminamos el gasto desde el array en el objeto:
    presupuesto.eliminarGasto(id);
    const { gastos, restante } = presupuesto;
    /*Volvemos a mostrar los gastos en el HTML, 
    esta vez no aparecera el gasto que acabamos de eliminar: */
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}