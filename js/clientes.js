var tbl_clientes;
var tbl_cuentas;
var cuentas;
var usuario;
var idCliente = 0;
var idCuenta = 0;
// función que se inicia al empezar el archivo
function inicio() {
    usuario = JSON.parse(localStorage.getItem("usuario"));
    listar();
    $("#form-cliente").on("submit", function(e) {
        accion_form(e);
    });
}
inicio();

// función donde se lista la tabla con los clientes registrados
function listar() {
    tbl_clientes = $('#tbl_clientes').DataTable({
        "responsive": true,
        "processing": true,
        "serverSide": true,
        "pageLength": 5,
        "language": { "url": "//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json" },
        "ajax": {
            "url": 'http://www.apirest.890m.com/api/traerClientes',
            "type": "GET",
            headers: {
                "Authorization": usuario.token
            },
        },
        "columns": [
            { data: "id" },
            {
                data: "cedula",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    $(nTd).html(oData.cedula + '<br/><div data-toggle="tooltip" data-placement="right" data-html="true"  class="btn-group" role="group">' +
                        '<button type="button"  class="cursor btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                        '</i><b> Opciones </b>' +
                        '</button>' +
                        '<ul class="dropdown-menu">' +
                        '<li>' +
                        '<button type="button" style="width:100%" onclick="traer_info(' + oData.id + ')" class="cursor btn btn-warning btn-sm">' +
                        '<span class="fa fa-edit"></span><b> Actualizar Información </b>' +
                        '</button>' +
                        '</li>' +
                        '<li>' +
                        '<button type="button"  onclick="ver_cuentas(' + oData.id + ')" style="width:100%" class="cursor btn btn-primary btn-sm">' +
                        '<span class="fas fa-credit-card"></span><b> Ver Cuentas </b>' +
                        '</button>' +
                        '</li>' +
                        '<ul/>' +
                        '</div>');
                }
            },
            { data: "nombres" },
            { data: "apellidos" },
            { data: "direccion" },
            { data: "telefono" },
            { data: "email" }
        ],
        "columnDefs": [
            { "className": "dt-center", "targets": "_all" },
            { "targets": [0], "visible": false }
        ],
        "lengthChange": true,
        "responsive": true,
        "order": [
            [0, "desc"]
        ], //Ordenar (columna,orden)
        "lengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50]
        ]
    });
}

function abrirForm() {
    $("#div-listado-clientes").hide();
    $("#div-form-clientes").show();
    $("#div-titulo-form").html('<i class="fas fa-address-book"></i> Registro Cliente');
    $("#div-contiene-submit").html('<button onclick="cerrarForm()" class="btn btn-danger btn-lg" type="button"><i class="fas fa-reply"></i></button> <button class="btn btn-primary btn-lg" type="submit"><i class="fas fa-save"></i> Registrar</button>');
    idCliente = 0;
}

function cerrarForm() {
    $("#div-form-clientes").hide();
    $("#div-listado-clientes").show();
    $("#form-cliente")[0].reset();
}

// función donde se guarda un determinado cliente
function accion_form(e) {
    e.preventDefault(); //No se activará la acción predeterminada del evento
    let cedula = $("#cedula").val();
    let nombre = $("#nombre").val();
    let apellidos = $("#apellidos").val();
    let direccion = $("#direccion").val();
    let telefono = $("#telefono").val();
    let email = $("#email").val();
    let objeto = { "cedula": cedula, "nombres": nombre, "apellidos": apellidos, "direccion": direccion, "telefono": telefono, "email": email };
    if (idCliente == 0) {
        guardar(objeto);
    } else {
        editar(objeto);
    }
}

function guardar(objeto) {
    $.ajax({
        url: "http://www.apirest.890m.com/api/registroCliente",
        type: "POST",
        data: objeto,
        dataType: 'json',
        headers: { "Authorization": usuario.token },
        beforeSend: function() {
            Funciones.abrirModalCargando();
        },
        success: function(datos) {
            if (datos.success == true) {
                alertify.notify(datos.msg, 'success', 8);
                $("#form-cliente")[0].reset();
                cerrarForm();
                tbl_clientes.ajax.reload();
            } else {
                alertify.notify(datos.msg, 'error', 8);
            }
            Funciones.cerrarModalCargando();
        },
        error: function() {
            alertify.notify('Error, se presento un problema en el servidor por favor intentelo de nuevo', 'error', 8);
            Funciones.cerrarModalCargando();
        }
    });
}

function traer_info(id) {
    $("#div-listado-clientes").hide();
    $("#div-form-clientes").show();
    $("#div-titulo-form").html('<i class="fas fa-address-book"></i> Actualizar información Cliente');
    $("#div-contiene-submit").html('<button onclick="cerrarForm()" class="btn btn-danger btn-lg" type="button"><i class="fas fa-reply"></i></button> <button class="btn btn-warning btn-lg" type="submit"><i class="fas fa-edit"></i> Actualizar</button>');
    consultarInfo(id);
    idCliente = id;
}

function consultarInfo(id) {
    $.ajax({
        url: "http://www.apirest.890m.com/api/infoCliente",
        type: "GET",
        data: { id: id },
        dataType: 'json',
        headers: { "Authorization": usuario.token },
        beforeSend: function() {
            Funciones.abrirModalCargando();
        },
        success: function(datos) {
            $("#cedula").val(datos.cedula);
            $("#nombre").val(datos.nombres);
            $("#apellidos").val(datos.apellidos);
            $("#direccion").val(datos.direccion);
            $("#telefono").val(datos.telefono);
            $("#email").val(datos.email);
            Funciones.cerrarModalCargando();
        },
        error: function() {
            alertify.notify('Error, se presento un problema en el servidor por favor intentelo de nuevo', 'error', 8);
            Funciones.cerrarModalCargando();
        }
    });
}

function editar(objeto) {
    var infoUsuario = objeto;
    infoUsuario['id'] = idCliente;
    console.log(infoUsuario);
    $.ajax({
        url: "http://www.apirest.890m.com/api/actualizarCliente",
        type: "PUT",
        data: objeto,
        dataType: 'json',
        headers: { "Authorization": usuario.token },
        beforeSend: function() {
            Funciones.abrirModalCargando();
        },
        success: function(datos) {
            if (datos.success == true) {
                alertify.notify(datos.msg, 'success', 8);
                $("#form-cliente")[0].reset();
                cerrarForm();
                tbl_clientes.ajax.reload();
            } else {
                alertify.notify(datos.msg, 'error', 8);
            }
            Funciones.cerrarModalCargando();
        },
        error: function() {
            alertify.notify('Error, se presento un problema en el servidor por favor intentelo de nuevo', 'error', 8);
            Funciones.cerrarModalCargando();
        }
    });
}

function ver_cuentas(id) {
    idCliente = id;
    $("#div-listado-clientes").hide();
    $("#div-listado-cuentas").show();
    tbl_cuentas = $('#tbl_cuentas').DataTable({
        "responsive": true,
        "processing": true,
        "serverSide": true,
        "pageLength": 5,
        "language": { "url": "//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json" },
        "ajax": {
            "url": 'http://www.apirest.890m.com/api/traerCuentasCliente',
            "type": "GET",
            "data": { "id_cliente": id },
            headers: {
                "Authorization": usuario.token
            },
        },
        "columns": [
            { data: "id" },
            { data: "nombres" },
            {
                data: "numero_cuenta",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    if (oData.estado == '1') {
                        _$(nTd).html(oData.numero_cuenta + "<br/>" + '<button type="button"  onclick="abrir_desactivar_cuenta(' + oData.id + ')" class="cursor btn btn-danger btn-sm">' +
                            '<b>Desactivar Cuenta</b>' +
                            '</button>');
                    } else {
                        $(nTd).html(oData.numero_cuenta + "<br/>" + '<button type="button"  onclick="abrir_activar_cuenta(' + oData.id + ')" class="cursor btn btn-success btn-sm">' +
                            '<b>Activar Cuenta</b>' +
                            '</button>');
                    }
                }
            },
            {
                data: "apellidos",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    $(nTd).html(oData.nombres + " " + oData.apellidos);
                }
            },
            { data: "saldo" },
            { data: "clave" },
            {
                data: "estado",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    if (oData.estado == '1') {
                        $(nTd).html("Activada");
                    } else {
                        $(nTd).html("Desactivada");
                    }
                }
            },
        ],
        "columnDefs": [
            { "className": "dt-center", "targets": "_all" },
            { "targets": [0, 1], "visible": false }
        ],
        "lengthChange": true,
        "responsive": true,
        "order": [
            [0, "desc"]
        ], //Ordenar (columna,orden)
        "lengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50]
        ]
    });
}

function cerrarCuentas() {
    $("#div-listado-cuentas").hide();
    $("#div-listado-clientes").show();
    tbl_cuentas.destroy();
}

function abrir_activar_cuenta(id) {
    idCuenta = id;
    $("#modal_activar_cuenta").modal('show');
}

function cerrar_modal_activar_cuenta() {
    $("#modal_activar_cuenta").modal('hide');
}

function activar_cuenta() {

}