var tbl_cuentas;
var tbl_transacciones;
var usuario;
var idCuenta;
var numeroCuenta;
var idTransaccion = 0;
var saldoCuenta = 0;
// función que se inicia al empezar el archivo
function inicio() {
    usuario = JSON.parse(localStorage.getItem("usuario"));
    listar();
}
inicio();

function listar() {
    tbl_cuentas = $('#tbl_cuentas').DataTable({
        "responsive": true,
        "processing": true,
        "serverSide": true,
        "pageLength": 5,
        "language": { "url": "//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json" },
        "ajax": {
            "url": 'http://www.apirest.890m.com/api/traerCuentas',
            "type": "GET",
            "dataType": 'json',
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
                    $(nTd).html(oData.numero_cuenta + '<br/><div data-toggle="tooltip" data-placement="right" data-html="true"  class="btn-group" role="group">' +
                        '<button type="button"  class="cursor btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                        '</i><b> Opciones </b>' +
                        '</button>' +
                        '<ul class="dropdown-menu">' +
                        '<li>' +
                        '<button type="button" style="width:100%" onclick="abrir_registrar_consignacion(' + oData.id + ',' + oData.numero_cuenta + ')" class="cursor btn btn-primary btn-sm">' +
                        '<b> Registrar Consignación </b>' +
                        '</button>' +
                        '</li>' +
                        '<li>' +
                        '<button type="button" style="width:100%" onclick="abrir_registrar_retiro(' + oData.id + ',' + oData.numero_cuenta + ',' + oData.saldo + ')" class="cursor btn btn-success btn-sm">' +
                        '<b> Registrar Retiro </b>' +
                        '</button>' +
                        '</li>' +
                        '<li>' +
                        '<button type="button"  onclick="ver_transacciones(' + oData.id + ',' + oData.saldo + ')" style="width:100%" class="cursor btn btn-default btn-sm">' +
                        '<b> Ver Transacciones </b>' +
                        '</button>' +
                        '</li>' +
                        '<ul/>' +
                        '</div>');
                }
            },
            {
                data: "apellidos",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    $(nTd).html(oData.nombres + " " + oData.apellidos);
                }
            },
            {
                data: "saldo",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    num = oData.saldo.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
                    num = num.split('').reverse().join('').replace(/^[\.]/, '');
                    $(nTd).html("$ " + num);
                }
            },
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

function abrir_registrar_consignacion(id, cuenta) {
    idCuenta = id;
    numeroCuenta = cuenta;
    $("#modal_consignacion").modal("show");
    idTransaccion = 0;
}

function cerrar_modal_consignacion() {
    $("#modal_consignacion").modal("hide");
    $("#monto_consignacion").val('');
}

function salir() {
    Funciones.salir();
}

function format(input) {
    var num = input.value.replace(/\./g, '');
    if (!isNaN(num)) {
        num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
        num = num.split('').reverse().join('').replace(/^[\.]/, '');
        input.value = num;
    } else {
        alertify.notify('Error, Solo se permiten numeros', 'error', 8);
        input.value = input.value.replace(/[^\d\.]*/g, '');
    }
}

function consignar() {
    let monto = $("#monto_consignacion").val();
    monto = monto.split('.').join('');
    if (idTransaccion == 0) {
        let objeto = {
            "monto": monto,
            "id_cajero": usuario.id_user,
            "id_cuenta": idCuenta,
            "cuenta": numeroCuenta
        }
        guardarConsignar(objeto);
    } else {
        let objeto = {
            "id": idTransaccion,
            "monto": monto,
            "id_cuenta": idCuenta,
            "id_cajero": usuario.id_user
        }
        editarConsignar(objeto);
    }
}

function guardarConsignar(objeto) {
    $.ajax({
        url: "http://www.apirest.890m.com/api/consignacion",
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
                cerrar_modal_consignacion();
                tbl_cuentas.ajax.reload();
                $("#monto_consignacion").val('');
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

function abrir_registrar_retiro(id, cuenta, saldo) {
    idCuenta = id;
    numeroCuenta = cuenta;
    saldoCuenta = saldo;
    $("#modal_retiro").modal("show");
    idTransaccion = 0;
}

function cerrar_modal_retiro() {
    $("#modal_retiro").modal("hide");
    $("#monto_retiro").val('');
}

function retiro() {
    let monto = $("#monto_retiro").val();
    monto = monto.split('.').join('');
    if (monto <= saldoCuenta) {
        if (idTransaccion == 0) {
            let objeto = {
                "monto": monto,
                "id_cajero": usuario.id_user,
                "id_cuenta": idCuenta,
                "cuenta": numeroCuenta
            }
            guardarRetiro(objeto);
        } else {
            let objeto = {
                "id": idTransaccion,
                "monto": monto,
                "id_cajero": usuario.id_user,
                "id_cuenta": idCuenta,
            }
            editarRetiro(objeto);
        }
    } else {
        alertify.notify('Error, el valor del retiro no puede ser mayor al saldo actual de la cuenta', 'error', 8);
    }

}

function guardarRetiro(objeto) {
    $.ajax({
        url: "http://www.apirest.890m.com/api/retiro",
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
                cerrar_modal_retiro();
                tbl_cuentas.ajax.reload();
                $("#monto_retiro").val('');
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

function ver_transacciones(id, saldo) {
    Funciones.abrirModalCargando();
    $("#div-listado-cuentas-cajero").hide();
    $("#div-listado-transacciones").show();
    idCuenta = id;
    saldoCuenta = saldo;
    tbl_transacciones = $('#tbl_transacciones').DataTable({
        "responsive": true,
        "processing": true,
        "serverSide": true,
        "pageLength": 5,
        "language": { "url": "//cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json" },
        "ajax": {
            "url": 'http://www.apirest.890m.com/api/traerTransaccionesCuenta',
            "type": "GET",
            "data": { "id_cuenta": id },
            "dataType": 'json',
            headers: {
                "Authorization": usuario.token
            },
        },
        "columns": [
            { data: "id" },
            {
                data: "tipo",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    if (oData.tipo == '1') {
                        $(nTd).html("Consignación" +
                            '<br/><button type="button" onclick="abrir_editar_consignacion(' + oData.id + ')" class="cursor btn btn-primary btn-sm">' +
                            '<b> Editar Consignación </b>' +
                            '</button>'
                        );
                    } else {
                        $(nTd).html("Retiro" +
                            '<br/>' +
                            '<button type="button"onclick="abrir_editar_retiro(' + oData.id + ')" class="cursor btn btn-info btn-sm">' +
                            '<b> Editar Retiro </b>' +
                            '</button>'
                        );
                    }
                }
            },
            { data: "fecha" },
            { data: "hora" },
            {
                data: "monto",
                "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                    num = oData.monto.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
                    num = num.split('').reverse().join('').replace(/^[\.]/, '');
                    $(nTd).html("$ " + num);
                }
            },
            { data: "descripcion" },
            { data: "name" },
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
    Funciones.cerrarModalCargando();
}

function cerrarTransacciones() {
    $("#div-listado-transacciones").hide();
    $("#div-listado-cuentas-cajero").show();
    tbl_transacciones.destroy();
}

function abrir_editar_consignacion(id) {
    idTransaccion = id;
    $("#modal_consignacion").modal("show");
}

function editarConsignar(objeto) {
    $.ajax({
        url: "http://www.apirest.890m.com/api/editarConsignacion",
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
                cerrar_modal_consignacion();
                tbl_transacciones.ajax.reload();
                tbl_cuentas.ajax.reload();
                $("#monto_consignacion").val('');
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

function abrir_editar_retiro(id) {
    idTransaccion = id;
    $("#modal_retiro").modal("show");
}

function editarRetiro(objeto) {
    $.ajax({
        url: "http://www.apirest.890m.com/api/editarRetiro",
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
                cerrar_modal_retiro();
                tbl_transacciones.ajax.reload();
                tbl_cuentas.ajax.reload();
                $("#monto_retiro").val('');
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