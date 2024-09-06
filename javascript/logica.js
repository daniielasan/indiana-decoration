// Definiciones Globales
let habilitarInputQty = false;
let productoSeleccionado = false;
let colorSeleccionado = false;
let almohadones, colores;

let producto = {
    id: JSON.parse(localStorage?.getItem('controlId') || 0),
    almohadon: '',
    precio: '',
    cantidad: '',
    color: ''
}

const getDataFromServer = async () => {
    try {
        const jsonInfo = await fetch('../db.json');
        const data = await jsonInfo.json();
        return {
            almohadones: data.almohadones,
            colores: data.colores
        }
    } catch (error) {
        logger.error(`Error on attempting to fetch: ${error.message}`)
    }
}

// Funcion para abreviar la seleccion por Id
function getById (id) {
    return document.getElementById(id);
}

// Referenciamos los elementos del HTML
const almohadonesContainer = getById('almohadones-container');
const coloresContainer = getById('colores-container');
coloresContainer.classList.add('colores-container');
coloresContainer.classList.add('row');

const inputQty = getById('input-qty');
inputQty.disabled = !habilitarInputQty;
inputQty.addEventListener('input', () => InputValue())

const botonComprar = getById('button-comprar');
botonComprar.addEventListener('click', () => RegistrarCompra())
botonComprar.disabled = true;

const botonReset = getById('button-reset');
botonReset.addEventListener('click', () => ReiniciarTodo())

// Recuperamos datos del carrito
const carrito = JSON.parse(localStorage.getItem('carrito'));
!carrito && localStorage.setItem('carrito',JSON.stringify([]));
CallCarrito(carrito?.length || 0);

// Funciones 
function SelectProduct(item){
    
    producto.almohadon = item.nombre;
    producto.precio = item.precio;

    getById(`card-${item.nombre}`).classList.add('card-selected');
    const opcionesDeshabilitadas = almohadones.filter(almohadon => almohadon.nombre !== item.nombre)

    opcionesDeshabilitadas.forEach(opcion => {    
        getById(`boton-${opcion.nombre}`).disabled = true;
    })

    productoSeleccionado = true;
    inputQty.disabled = !(colorSeleccionado && productoSeleccionado)
}

function SelectColor(item){
    
    producto.color = item;

    getById(`color-${item}`).classList.add('color-selected');
    const opcionesDeshabilitadas = colores.filter(color => color !== item)

    for (const opcion of opcionesDeshabilitadas) {    
        getById(`color-${opcion}`).disabled = true;
    }

    colorSeleccionado = true;
    inputQty.disabled = !(colorSeleccionado && productoSeleccionado)
}

function ReiniciarTodo() {
    habilitarInputQty = false;
    productoSeleccionado = false;
    colorSeleccionado = false;
    inputQty.value = '';
    inputQty.disabled = true;
    botonComprar.disabled = true;
    producto = {
        id: producto.id + 1,
        almohadon: '',
        precio: '',
        cantidad: '',
        color: ''
    }

    localStorage.setItem('controlId', JSON.stringify(producto.id))

    almohadones.forEach(item => {
        getById(`boton-${item.nombre}`).disabled = false;
        getById(`card-${item.nombre}`).classList.remove('card-selected');
    })
    colores.forEach(color => {
        getById(`color-${color}`).disabled = false;
        getById(`color-${color}`).classList.remove('color-selected');
    })
}

function InputValue() {
    const inputElement = document.getElementById("input-qty");
    const soloNumericos = /^[0-9]*$/.test(inputElement.value);
    inputElement.value= `${soloNumericos? inputElement.value : inputElement.value .slice(0, -1)}`;
    producto.cantidad = inputElement.value;
    botonComprar.disabled = !(productoSeleccionado && colorSeleccionado && producto.cantidad !== '');
}

function RegistrarCompra(){
    const carrito = JSON.parse(localStorage.getItem('carrito'));
    carrito.push(producto)

    localStorage.setItem('carrito', JSON.stringify(carrito))
    ReiniciarTodo();
    CallCarrito(carrito.length);
    Swal.fire({
        title: 'Genial!',
        text: 'Has agregado el producto al carrito. Hacé click en el icono en la parte superior si querés ver la lista.',
        icon: 'success',
        confirmButtonText: 'Entendido'
    })
}

// Renderizado dinámico
async function RenderAlmohadones(){
    almohadones = (await getDataFromServer()).almohadones;
    almohadones.forEach((item) => {
        const card = document.createElement('div');
        card.id = `card-${item.nombre}`;
        card.classList.add('card');
        card.classList.add('col-md-4');
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        cardBody.innerHTML =
        `   
        <h5 class="card-title">${item.nombre}</h5>
        <h6>Precio: ${item.precio}</h6>
        <img class="card-image" src="${item.image}"/>
        <p class="card-text">${item.descripcion}</p>
        <button id="boton-${item.nombre}" type="button" class="btn btn-primary">Seleccionar</button>
        `
        card.appendChild(cardBody)
        almohadonesContainer.appendChild(card);
    
        const cardButton = getById(`boton-${item.nombre}`)
        cardButton.onclick = () => SelectProduct(item)
    })
}

async function RenderColores(){
    colores = (await getDataFromServer()).colores.values
    colores.forEach((color) => {
        const colorSquare = document.createElement('button');
        colorSquare.id = `color-${color}`;
        colorSquare.classList.add('color-square');
        colorSquare.classList.add('col-md-2');
        colorSquare.classList.add(`${color}`);
        colorSquare.addEventListener('click', () => SelectColor(color));
        colorSquare.innerHTML = `${color}`;
        coloresContainer.append(colorSquare);
    })
}

function CallCarrito (productosQty) {
    const header = getById('header-container');
    header.innerHTML = ''
    header.innerHTML = `
        <h1>Indiana's & Deco</h1>
    `
    header.innerHTML +=`
    <div id="img-carrito-container">
        <i id="icono-carrito" class="bi bi-cart4 fs-1"></i>
        <span class="position-absolute badge rounded-pill bg-danger">
            ${productosQty}
        </span>
    </div>
    `

    getById('icono-carrito').onclick = () => window.location.href = './carrito.html';
}

RenderAlmohadones();
RenderColores();