// Variables Gloabales
let total = 0;
let nombreTexto = 0;

// Referenciamos elementos del DOM
const buttonSentPurchase = getById("boton-send-purchase");
const inputRecipientName = getById("recipient-name");

// Seteamos props y condicones de los elementos
buttonSentPurchase.disabled = true;
buttonSentPurchase.addEventListener("click", async () => {
    localStorage.setItem('carrito', JSON.stringify([]));
    inputRecipientName.value = '';
    ShowCarrito();
    Swal.fire({
        title: 'Gracias!',
        text: 'Has enviado tu compra a nuestra BD. Pronto estaremos enviando el pedido. Si deseas seguir comprando haz click en el botón "Regresar".',
        icon: 'info',
        confirmButtonText: 'Entendido'
    })
});

inputRecipientName.addEventListener('input', () => {
    const carrito = JSON.parse(localStorage.getItem('carrito'));
    nombreTexto = inputRecipientName.value;
    buttonSentPurchase.disabled = !(inputRecipientName.value.length > 3 && carrito.length > 0);
});

// Botn para regresar a Home
getById('boton-regresar').onclick = () => window.location.href = './index.html';

// Funciones seccion de Carrito
function ShowCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito'));
    const carritoContainer = getById('carrito-container');
    carritoContainer.innerHTML = '';

    carrito.forEach((item, index) => {
        const card = document.createElement('div');
        card.id = `card-${item.almohadon}`;
        card.classList.add('card');
        card.classList.add('col-md-4');
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        cardBody.innerHTML =
        `   
        <div class="card-detail-container">
            <div class="card-detail-body">
                <h5 class="card-title">Producto ${index + 1}:</h5>
                <h6>Nombre: ${item.almohadon}</h6>
                <h6>Precio: ${item.precio}</h6>
                <h6>Color: ${item.color}</h6>
                <h6>Cantidad: ${item.cantidad}</h6>
            </div>
            <div class="card-detail-buttons">
                <button id="boton-detail-editar-${item.id}" type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#modal-edit">Editar</button>
                <button id="boton-detail-eliminar-${item.id}" type="button" class="btn btn-danger">Eliminar</button>
            </div>
        </div>
        `

        card.appendChild(cardBody);
        carritoContainer?.appendChild(card);

        getById(`boton-detail-editar-${item.id}`).onclick = () => ShowModalEditar(item);
        getById(`boton-detail-eliminar-${item.id}`).onclick = () => EliminarProducto(item);

        TotalizarCompra(carrito);
    });
}

function EliminarProducto(producto) {
    const carrito = JSON.parse(localStorage.getItem('carrito'));

    const nuevoCarrito = carrito.filter((item) => item.id !== producto.id)

    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));

    const carritoContainer = getById('carrito-container');
    carritoContainer.innerHTML = '';
    ShowCarrito();
}

async function ShowModalEditar(item){
    almohadones = (await getDataFromServer()).almohadones;
    colores = (await getDataFromServer()).colores.values;
    getById('modal-edit-select').value = ''
    getById('modal-color-select').value = ''
    getById('modal-edit-qty').value = '';
    getById('modal-edit-info-prod').innerText = `Producto: ${item.almohadon}`
    getById('modal-edit-info-color').innerText = `Color: ${item.color}`
    getById('modal-edit-info-precio').innerText = `Precio: ${item.precio}`
    getById('modal-edit-info-qty').innerText = `Cantidad: ${item.cantidad}`

    const select = getById('modal-edit-select')
    select.innerHTML = `<option value='1' selected>Escoja una Opción</option>`;

    const selectColores = getById('modal-color-select')
    selectColores.innerHTML = `<option value='1' selected>Escoja un Color</option>`;

    almohadones.forEach(almohadon => {
        select.innerHTML += `
            <option value=${almohadon.nombre}>${almohadon.nombre}</option>
        `
    })
    colores.forEach(color => {
        selectColores.innerHTML += `
            <option value=${color}>${color}</option>
        `
    })
    getById('aceptar-editar').onclick = () => AceptarEditar(item);
}

function AceptarEditar (producto){
    const nuevoNombre = getById('modal-edit-select').value;
    const nuevoColor = getById('modal-color-select').value;
    const nuevaCantidad = getById('modal-edit-qty').value;
    const nombresAlmohadones = almohadones.map(almohadon => almohadon.nombre)

    if(!nombresAlmohadones.includes(nuevoNombre) || !colores.includes(nuevoColor) || !nuevaCantidad){
        Swal.fire({
            title: 'Error!',
            text: 'No se ha completado la información requerida para editar el elemento',
            icon: 'error',
            confirmButtonText: 'Entendido'
        })
        return;
    }

    const carrito = JSON.parse(localStorage.getItem('carrito'));
    
    const nuevoCarrito = carrito.map(item => {
        if(item.id === producto.id){
            return {
               ...item,
                almohadon: nuevoNombre,
                color: nuevoColor,
                cantidad: nuevaCantidad
            }
        }
        return item;
    })

    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    ShowCarrito();
}

function TotalizarCompra(carrito){
    total = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    getById('total-compra').innerText = `Total Compra: $${total}`;
}

// Renderizo el Carrito
ShowCarrito();