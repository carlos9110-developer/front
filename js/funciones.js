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
            if (usuario.rol == 1) {
                $(".texto-bienvenida").html("Bienvenido cajero <br/>" + usuario.nombre);
            } else {
                $(".texto-bienvenida").html("Bienvenido asesor <br/>" + usuario.nombre);
            }
        },
        salir: function() {
            window.location.href = "index.html";
        }
    }
}();