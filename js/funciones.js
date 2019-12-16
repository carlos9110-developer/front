var Funciones = function() {
    return {
        cerrarModalCargando: function() {
            setTimeout(function() {
                $("#cargando").modal("hide");
            }, 1000);
        },
        abrirModalCargando: function() {
            $("#cargando").modal("show");
        },
        bienvenido: function() {
            let usuario = JSON.parse(localStorage.getItem("usuario"));
            $(".texto-bienvenida").html("Bienvenido asesor <br/>" + usuario.nombre);
        }
    }
}();