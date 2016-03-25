/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
miAppHome.controller('FacturaController',
        ['$scope', '$state', '$stateParams', 'clienteService', 'toaster', '$rootScope', 'NgTableParams', '_productoService', '$http', '$timeout', '$uibModal', '$cookies', '$route', 'facturaService', '$location', '$routeParams', 'metodoPagoFacturaService', 'medioPagoService', 'entidadBancariaService', 'planPagoService', 'tarjetaService',
            function ($scope, $state, $stateParams, clienteService, toaster, $rootScope, NgTableParams, _productoService, $http, $timeout, $uibModal, $cookies, $route, facturaService, $location, $routeParams, metodoPagoFacturaService, medioPagoService, entidadBancariaService, planPagoService, tarjetaService) {

                $scope._newFactura = {
                    "idFactura": null,
                    "cliente": null,
                    "estado": "INICIADO",
                    "idVendedor": null,
                    "fechaCreacion": null,
                    "fechaModificacion": null,
                    "usuarioCreacion": null,
                    "usuarioModificacion": null,
                    "total": null
                };
                $rootScope.factura = "";
                $scope._metodoPago = {
                    "idMetodoPagoFactura": null,
                    "planPago": null,
                    "factura": null,
                    "montoPago": null,
                    "estado": true,
                    "fechaCreacion": null,
                    "fechaModificacion": null,
                    "usuarioCreacion": null,
                    "usuarioModificacion": null
                };

                $scope.barcode = "";
                $scope.vendedor = "";
                $scope.tipoFactura = "";
                $scope.montoPago = "";
                $scope.totalCompra = 0;
                $scope.totalPago = 0;
                $scope.entidadPago = "";
                $scope.planPago = null;
                $scope.comprobantePago = "";
                $scope.tarjetasPago = "";
                $scope.mediosPago = "";
                $scope.disableSelectEntidades = true;
                $scope.disableSelectTarjeta = true;
                $scope.disableSelectMetodo = true;

                $scope.clienteFactura = {
                    "idCliente": null,
                    "nombreCliente": "",
                    "apellidoCliente": "",
                    "fechaNacimiento": "",
                    "dniCuit": "",
                    "domicilio": "",
                    "telefono": "",
                    "emailCliente": "",
                    "fechaCreacion": "",
                    "fechaModificacion": null,
                    "usuarioCreacion": null,
                    "usuarioModificacion": null
                };

                $scope.agregarFactura = function (factura) {
                    $promesa = facturaService.add(factura);
                    $promesa.then(function (datos) {
                        if (datos.status === 200) {
                            $state.transitionTo('home.factura', {idFactura: datos.data.msg});
                        }
                    });
                };

                $scope.detailFactura = function () {
                    var idFactura = $stateParams.idFactura;
                    $promesa = facturaService.searchById(idFactura);
                    $promesa.then(function (datos) {
                        $rootScope.factura = datos.data;
                    });
                };

                $scope.open = function () {
                    $rootScope.productosBarcode = "";
                    var control = $scope.barcode.length;
                    if (control >= 8) {
                        $promesa = _productoService.searchByBarcode($scope.barcode);
                        $promesa.then(function (datos) {
                            $rootScope.productosBarcode = datos.data;
                        });
                        $timeout(function timer() {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: 'searchResultados.html',
                                controller: 'ModalController',
                                size: 'lg',
                                resolve: {}
                            });
                        }, 2000);
                    }
                };

                $scope.listaDetalleFactura = function () {
                    var idFacturaDetalle = $stateParams.idFactura;
                    $scope.detalleFacturas = "";
                    $promesa = facturaService.getDetalleFacturaList(idFacturaDetalle);
                    $promesa.then(function (datos) {
                        $scope.detalleFacturas = datos.data;
                        var data = datos.data;
                        angular.forEach(data, function (value, key) {
//                            value.idDetalleFactura = key + 1; //posiblemente a eliminar, de mas
                            $scope.totalCompra = parseFloat($scope.totalCompra) + parseFloat(value.totalDetalle);
                        });
                        $scope.tableParams = new NgTableParams({
                            page: 1,
                            count: 5
                        }, {
                            total: data.length,
                            getData: function (params) {
                                data = $scope.detalleFacturas;
                                params.total(data.length);
                                if (params.total() <= ((params.page() - 1) * params.count())) {
                                    params.page(1);
                                }
                                return data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                            }});
                    });
                };

                $rootScope.$on('ReloadTable', function () {
                    var idFacturaDetalle = $stateParams.idFactura;
                    $timeout(function timer() {
                        facturaService.getDetalleFacturaList(idFacturaDetalle).then(function (datos) {
                            $scope.detalleFacturas = datos.data;
                            $scope.totalCompra = 0;
                            angular.forEach(datos.data, function (value, key) {
//                                value.idDetalleFactura = key; //posiblemente a eliminar, de mas
                                $scope.totalCompra = parseFloat($scope.totalCompra) + parseFloat(value.totalDetalle);
                            });
                            $scope.tableParams.reload();
                        });
                    }, 1000);
                });


                $scope.getCliente = function (val) {
                    var token = $cookies.getObject('token');
                    var uri = 'https://tierradecoloresapi.herokuapp.com/cliente/searchApellido';
                    return $http({
                        url: uri,
                        method: 'post',
                        headers: {
                            'Authorization': 'Bearer ' + token.data.access_token
                        },
                        params: {
                            'apellidoCliente': val
                        }
                    }).then(function (response) {
                        return response.data.map(function (item) {
                            return item;
                        });
                    });
                };

                $scope.listaMetodoPagoFactura = function () {
                    $scope.metodoPagos = "";
                    var idFactura = $stateParams.idFactura;
                    $promesa = metodoPagoFacturaService.getListaPagoFactura(idFactura);
                    $promesa.then(function (datos) {
                        $scope.metodoPagos = datos.data;
                        var data = datos.data;
                        angular.forEach(datos.data, function (value, key) {
                            $scope.totalPago = parseFloat($scope.totalPago) + parseFloat(value.montoPago);
                        });
                        $scope.tableMetodos = new NgTableParams({
                            page: 1,
                            count: 5
                        }, {
                            total: data.length,
                            getData: function (params) {
                                data = $scope.metodoPagos;
                                params.total(data.length);
                                if (params.total() <= ((params.page() - 1) * params.count())) {
                                    params.page(1);
                                }
                                return data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                            }});
                    });
                };


                /**
                 * Modulo carga metodo de pago, correspondientes listados
                 * @returns {undefined}
                 */
                $scope.listaMedioPago = function () {
                    $promesa = medioPagoService.getAll();
                    $promesa.then(function (datos) {
                        $scope.mediosPagos = datos.data;
                    });
                };
                $scope.listaEntidades = function () {
                    $promesa = entidadBancariaService.getAll();
                    $promesa.then(function (datos) {
                        $scope.entidades = datos.data;
                    });
                };
                $scope.listaPlanesPago = function () {
                    $promesa = planPagoService.getAll();
                    $promesa.then(function (datos) {
                        $scope.planesPago = datos.data;
                    });
                };
                $scope.listaTarjetas = function () {
                    $promesa = tarjetaService.getAll();
                    $promesa.then(function (datos) {
                        $scope.tarjetas = datos.data;
                    });
                };

                $scope.$watch('mediosPago', function (newValue, oldValue) {
                    if (newValue.nombrePago === 'CONTADO') {
                        $scope.disableSelectEntidades = true;
                        $scope.disableSelectTarjeta = true;
                        $scope.disableSelectMetodo = true;
                        $scope.entidadPago = "";
                        $scope.planPago = "";
                        $scope.tarjetasPago = "";
                    }
                    if (newValue.nombrePago === 'CREDITO' || newValue.nombrePago === 'DEBITO') {
                        $scope.disableSelectEntidades = false;

                    }
                });

                $scope.busquedaTarjeta = function () {
                    $promesa = tarjetaService.getEntidades($scope.entidadPago.idEntidadMonetaria, $scope.mediosPago.idMedioPago);
                    $promesa.then(function (datos) {
                        $scope.disableSelectTarjeta = false;
                        $scope.tarjetas = datos.data;
                    });
                };

                $scope.busquedaPlanByTarjeta = function () {
                    $promesa = planPagoService.searchByTarjeta($scope.tarjetasPago.idTarjeta);
                    $promesa.then(function (datos) {
                        $scope.planesPago = datos.data;
                        $scope.disableSelectMetodo = false;
                    });
                };

                $scope.agregarMetodoPago = function () {
                    var idFactura = $stateParams.idFactura;
                    $promesa = facturaService.searchById(idFactura);
                    $promesa.then(function (datos) {
                        /* suma monto a pagar y total para controlar que no exceda a la factura*/
                        var compare = parseFloat($scope.totalPago) + parseFloat($scope.montoPago);
                        if (datos.data.total >= compare) {
                            $scope._metodoPago.factura = datos.data;
                            /* control para separar pago contado y otros metodos*/
                            if ($scope.mediosPago.idMedioPago !== 1) {
                                $scope._metodoPago.planPago = $scope.planPago;
                            } else {
                                $scope._metodoPago.planPago = null;
                            }
                            /* control para evitar monto vacio*/
                            if ($scope.montoPago === "") {
                                toaster.pop({
                                    type: 'warning',
                                    title: 'Advertencia',
                                    body: 'El monto a pagar no puede estar vacio.',
                                    showCloseButton: false
                                });
                            } else {
                                $scope._metodoPago.montoPago = $scope.montoPago;
                                /* control para evitar comprobante de pago vacio*/
                                if ($scope.comprobantePago === "" && $scope.mediosPago.idMedioPago !== 1) {
                                    toaster.pop('warning', 'Advertencia', 'El comprobante no puede estar vacio.');
                                    toaster.pop({
                                        type: 'warning',
                                        title: 'Advertencia',
                                        body: 'El comprobante no puede estar vacio.',
                                        showCloseButton: false
                                    });
                                } else {
                                    $scope._metodoPago.comprobante = $scope.comprobantePago;
                                    $prom = metodoPagoFacturaService.addMetodoPago($scope._metodoPago);
                                    $prom.then(function (datos) {
                                        if (datos.status === 200) {
                                            $recharge = metodoPagoFacturaService.getListaPagoFactura(idFactura);
                                            $recharge.then(function (datos) {
                                                var control = 0;
                                                angular.forEach(datos.data, function (value, key) {
                                                    control = parseFloat(control) + parseFloat(value.montoPago);
                                                });
                                                $scope.totalPago = control;
                                                $scope.metodoPagos = datos.data;
                                                $scope.tableMetodos.reload();
                                                $scope.montoPago = "";
                                                $scope.planPago = null;
                                                $scope.tarjetasPago = "";
                                                $scope.entidadPago = "";
                                                $scope.mediosPago = "";
                                                $scope.comprobantePago = "";
                                                $scope.disableSelectEntidades = true;
                                                $scope.disableSelectTarjeta = true;
                                                $scope.disableSelectMetodo = true;
                                                toaster.pop({
                                                    type: 'success',
                                                    title: 'Exito',
                                                    body: 'Metodo de pago agregado.',
                                                    showCloseButton: false
                                                });
                                            });
                                        }
                                    });
                                }
                            }
                        } else {
                            /* control para diferenciar monto vacio*/
                            if (isNaN(compare)) {
                                toaster.pop({
                                    type: 'error',
                                    title: 'Error',
                                    body: 'El monto no puede estar vacio.',
                                    showCloseButton: false
                                });
                            } else {
                                toaster.pop({
                                    type: 'error',
                                    title: 'Error',
                                    body: 'El monto supera el total de la factura.',
                                    showCloseButton: false
                                });
                            }
                        }
                    });
                };

                $scope.agregarCliente = function (cliente) {
                    $addCliente = clienteService.add(cliente);
                    $addCliente.then(function (datos) {
                        if (datos.status === 200) {
                            toaster.pop({
                                type: 'success',
                                title: 'Exito',
                                body: 'Cliente agregado con exito.',
                                showCloseButton: false
                            });
                            cliente.idCliente = datos.data.msg;
                            $rootScope.factura.cliente = cliente;
                            $promesa = facturaService.update($rootScope.factura);
                            $promesa.then(function (datos) {
                                if (datos.status === 200) {
                                    toaster.pop({
                                        type: 'success',
                                        title: 'Exito',
                                        body: 'Factura actualizada.',
                                        showCloseButton: false
                                    });
                                    $timeout(function timer() {
                                        $route.reload();
                                    }, 2000);
                                }
                            });
                        } else {
                            toaster.pop({
                                type: 'error',
                                title: 'Error',
                                body: 'El cliente no pudo ser agregado',
                                showCloseButton: false
                            });
                        }
                    });
                };

                $scope.agregarClienteDynamic = function (cliente) {
                    $rootScope.factura.cliente = cliente;
                    $promesa = facturaService.update($rootScope.factura);
                    $promesa.then(function (datos) {
                        if (datos.status === 200) {
                            toaster.pop({
                                type: 'success',
                                title: 'Exito',
                                body: 'Factura actualizada.',
                                showCloseButton: false
                            });
                        } else {
                            toaster.pop({
                                type: 'error',
                                title: 'Error',
                                body: 'Error, la factura no pudo ser actualizada',
                                showCloseButton: false
                            });
                        }
                    });
                };

                /*listdos de las tabs */

                $scope.listaFacturas = function () {
                    $scope.facturas = "";
                    $promesa = facturaService.getAll();
                    $promesa.then(function (datos) {
                        if (datos.status === 200) {
                            $scope.totalFacturas = 0;
                            angular.forEach(datos.data, function (value, key) {
                                if (value.estado === 'CONFIRMADO') {
                                    $scope.totalFacturas = parseFloat($scope.totalFacturas) + parseFloat(value.total);
                                }
                            });
                            $scope.facturas = datos.data;
                            var data = datos.data;
                            $scope.tableFacturas = new NgTableParams({
                                page: 1,
                                count: 10
                            }, {
                                total: data.length,
                                getData: function (params) {
                                    data = $scope.facturas;
                                    params.total(data.length);
                                    if (params.total() <= ((params.page() - 1) * params.count())) {
                                        params.page(1);
                                    }
                                    return data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                }});
                        }
                    });
                };
                $scope.listaFacturasDiaria = function () {
                    $scope.facturaDiarias = "";
                    $promesa = facturaService.getDay();
                    $promesa.then(function (datos) {
                        if (datos.status === 200) {
                            $scope.totalFacturasDiaria = 0;
                            angular.forEach(datos.data, function (value, key) {
                                if (value.estado === 'CONFIRMADO') {
                                    $scope.totalFacturasDiaria = parseFloat($scope.totalFacturasDiaria) + parseFloat(value.total);
                                }
                            });
                            $scope.facturaDiarias = datos.data;
                            var data = datos.data;
                            $scope.tableFacturasDiaria = new NgTableParams({
                                page: 1,
                                count: 10
                            }, {
                                total: data.length,
                                getData: function (params) {
                                    data = $scope.facturaDiarias;
                                    params.total(data.length);
                                    if (params.total() <= ((params.page() - 1) * params.count())) {
                                        params.page(1);
                                    }
                                    return data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                }});
                        }
                    });
                };

                $scope.listaVendedores = function () {
                    $scope.vendedores = "";
                    $promesa = facturaService.getVendedores();
                    $promesa.then(function (datos) {
                        if (datos.status === 200) {
                            $scope.vendedores = datos.data;
                        }
                    });
                };

                $scope.finalizarFactura = function () {
                    var idFactura = $stateParams.idFactura;
                    if ($scope.vendedor !== "") {
                        var metodo = 0;
                        $metodo = metodoPagoFacturaService.getListaPagoFactura(idFactura);
                        $metodo.then(function (datos) {
                            angular.forEach(datos.data, function (value, key) {
                                metodo = parseFloat(metodo) + parseFloat(value.montoPago);
                            });
                            $promesa = facturaService.searchById(idFactura);
                            $promesa.then(function (datos) {
                                if (datos.data.total === metodo && datos.data.total !== 0) {
                                    $rootScope.factura.idVendedor = $scope.vendedor;
                                    $rootScope.factura.estado = 'CONFIRMADO';
                                    $update = facturaService.update($rootScope.factura);
                                    $update.then(function (datos) {
                                        if (datos.status === 200) {
                                            $state.transitionTo('home.facturacion');
                                        } else {
                                            toaster.pop({
                                                type: 'error',
                                                title: 'Error',
                                                body: "¡Op's algo paso!, comunicate con el administrador.",
                                                showCloseButton: false
                                            });
                                        }
                                    });
                                } else {
                                    if (datos.data.total === 0) {
                                        toaster.pop({
                                            type: 'warning',
                                            title: 'Advertencia',
                                            body: "Advertencia', 'El monto no puede ser cero.",
                                            showCloseButton: false
                                        });
                                    } else {
                                        toaster.pop('error', 'Error', 'Aun queda saldo por pagar.');
                                        toaster.pop({
                                            type: 'error',
                                            title: 'Error',
                                            body: 'Aun queda saldo por pagar.',
                                            showCloseButton: false
                                        });
                                    }
                                }
                            });
                        });
                    } else {
                        toaster.pop({
                            type: 'warning',
                            title: 'Advertencia',
                            body: 'Por favor elige un vendedor',
                            showCloseButton: false
                        });
                    }
                };

            }]);

