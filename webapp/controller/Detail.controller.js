sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageToast, formatter) {
        "use strict";
        var that;
        var selectedItem;
        var oPropiedad;
        var sPropiedad;
        var oVisita;
        return BaseController.extend("com.softtek.propiedadesaca.controller.Detail", {
            formatter: formatter,
            onInit: function () {
                that = this;
                var oRouter = this.getRouter();
                oRouter.getRoute("Detail").attachPatternMatched(this._onPatternMatched, this);
            },
            _getPropiedad: function (sPath) {
                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.read(sPath, {
                    success: function (oData) {
                        oPropiedad = oData;
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error inesperado al obtener la propiedad");
                    }
                });
            },
            _onPatternMatched: function (oEvent) {
                this.selectedItem = undefined;
                this._toggleToolbarVisibility();
                sPropiedad = oEvent.getParameter("arguments").idPropiedad;
                let oModel = this.getOwnerComponent().getModel();
                oModel.metadataLoaded().then(function () {
                    this.getView().bindElement({
                        path: `/PropiedadSet('${sPropiedad}')`,
                        events: {
                            change: this._oBindingChange.bind(this),
                            dataRequested: function () {
                                that.getView().setBusy(true);
                            },
                            dataReceived: function (oData) {
                                that.getView().setBusy(false);
                            }
                        }
                    });
                }.bind(this));
            },
            onEditPropiedad: function (oEvent) {
                if (!this.oCreateFragment) {
                    this.oCreateFragment = 
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.propiedadesaca.view.fragments.CrearPropiedad",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            let oModel = new sap.ui.model.json.JSONModel({
                                "NombreDuenio": oPropiedad.NombreDuenio,
                                "ApellidoDuenio": oPropiedad.ApellidoDuenio,
                                "TipoProp": oPropiedad.TipoProp,
                                "Superficie": parseFloat(oPropiedad.Superficie).toFixed(2),
                                "NombreCalle": oPropiedad.NombreCalle,
                                "NumeroCalle": oPropiedad.NumeroCalle,
                                "Provincia": oPropiedad.Provincia,
                                "Localidad": oPropiedad.Localidad,
                                "NumHabitaciones": parseInt(oPropiedad.NumHabitaciones),
                                "Precio": parseFloat(oPropiedad.Precio).toFixed(2),
                            });
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "PropiedadCreate");
                            oDialog.attachAfterClose(that._afterCloseDialog);
                            return oDialog;
                        }.bind(that));
                        that.oCreateFragment.then(function (oDialog) {
                            oDialog.open()
                        }.bind(that));
                }
            },
            _afterCloseDialog: function (oEvent) { 
                oEvent.getSource().destroy();
                that.oCreateFragment = null;
            },
            onCerrarCrearPropiedadPress: function (oEvent) {
                that.oCreateFragment.then(function (oDialog) {
                    oDialog.close();
                });
            },
            onCrearPropiedadPress: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("PropiedadCreate").getData();
                if (!that._validarPropiedad(oEntry)) {
                    return;
                };
                oEntry.Superficie = parseFloat(oEntry.Superficie, 2);
                oEntry.NumHabitaciones = parseFloat(oEntry.NumHabitaciones, 0);
                oEntry.Precio = parseFloat(oEntry.Precio, 2);
                var oDataModel = that.getView().getModel();
                var sPath = oEvent.getSource().getBindingContext().getPath();
                oDataModel.update(sPath, oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        sap.m.MessageBox.success("La propiedad fue actualizada correctamente");
                        that.getOwnerComponent().getModel().refresh(true, true);
                        that.onCerrarCrearPropiedadPress();
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error inesperado al actualizar la propiedad");
                    }
                });
            },
            _validarPropiedad: function (oEntry) {
                //Validaciones
                if (!oEntry.NombreDuenio) {
                    sap.m.MessageBox.error("Por favor, ingrese el nombre del dueño");
                    return false;
                };
                if (!oEntry.ApellidoDuenio) {
                    sap.m.MessageBox.error("Por favor, ingrese el apellido del dueño");
                    return false;
                };
                if (!oEntry.TipoProp) {
                    sap.m.MessageBox.error("Por favor, ingrese el tipo de propiedad");
                    return false;
                };
                if (!oEntry.Superficie) {
                    sap.m.MessageBox.error("Por favor, ingrese la superficie");
                    return false;
                };
                if (!oEntry.NombreCalle) {
                    sap.m.MessageBox.error("Por favor, ingrese el nombre de la calle");
                    return false;
                };
                if (!oEntry.NumeroCalle) {
                    sap.m.MessageBox.error("Por favor, ingrese la altura de la calle");
                    return false;
                };
                if (!oEntry.Provincia) {
                    sap.m.MessageBox.error("Por favor, ingrese la provincia de la propiedad");
                    return false;
                };
                if (!oEntry.Localidad) {
                    sap.m.MessageBox.error("Por favor, ingrese la localidad de la propiedad");
                    return false;
                };
                if (!oEntry.NumHabitaciones) {
                    sap.m.MessageBox.error("Por favor, ingrese el número de habitaciones de la propiedad");
                    return false;
                };
                if (!oEntry.Precio) {
                    sap.m.MessageBox.error("Por favor, ingrese el precio de la propiedad");
                    return false;
                };
                return true;
            },
            onSelectionChange: function(oEvent) {
                var selectedItem = oEvent.getParameter("listItem");
                this.selectedItem = selectedItem;
                this._toggleToolbarVisibility();
            },
            _toggleToolbarVisibility: function() {
                var selectedItem = this.selectedItem;
                var oToolbar = this.getView().byId("_IDGenToolbar1");
                if (selectedItem) {
                    oToolbar.setVisible(true);
                } else {
                    oToolbar.setVisible(false);
                }
            },
            onCreateVisita: function (oEvent) {
                if (!this.oCreateFragment) {
                    this.oCreateFragment = 
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.propiedadesaca.view.fragments.CrearVisita",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            let oModel = new sap.ui.model.json.JSONModel({
                                "NombreVisit": "",
                                "ApellidoVisit": "",
                                "Puntuacion": 0,
                                "Fecha": "",
                                "Observaciones": "",
                            });
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "VisitaCreate");
                            oDialog.attachAfterClose(that._afterCloseDialog);
                            return oDialog;
                        }.bind(that));
                        that.oCreateFragment.then(function (oDialog) {
                            oDialog.open();
                        }.bind(that));
                }
            },
            onCrearVisitaPress: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("VisitaCreate").getData();
                if (!that._validarVisita(oEntry)) {
                    return;
                };
                let fecha = new Date(oEntry.Fecha);
                fecha.setDate(fecha.getDate() + 1);
                oEntry.Fecha = fecha;
                oEntry.Puntuacion = parseFloat(oEntry.Puntuacion, 0);
                oEntry.Fecha = new Date(oEntry.Fecha);
                var sPath = oEvent.getSource().getBindingContext().getPath();
                var idPropiedad = sPath.match(/\('([^']+)'\)/)[1];
                oEntry.IdPropiedad = idPropiedad;
                var oDataModel = that.getView().getModel();
                oDataModel.create("/VisitaSet", oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        sap.m.MessageBox.success("La visita fue registrada correctamente");
                        that.getOwnerComponent().getModel().refresh(true, true);
                        that.onCerrarCrearPropiedadPress();
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error inesperado al registrar la visita");
                    }
                });
            },
            _validarVisita: function (oEntry) {
                //Validaciones
                if (!oEntry.NombreVisit) {
                    sap.m.MessageBox.error("Por favor, ingrese el nombre del visitante");
                    return false;
                };
                if (!oEntry.ApellidoVisit) {
                    sap.m.MessageBox.error("Por favor, ingrese el apellido del visitante");
                    return false;
                };
                if (!oEntry.Puntuacion) {
                    sap.m.MessageBox.error("Por favor, ingrese la puntuación");
                    return false;
                };
                if (!oEntry.Fecha) {
                    sap.m.MessageBox.error("Por favor, ingrese la fecha");
                    return false;
                };
                if (!oEntry.Observaciones) {
                    sap.m.MessageBox.error("Por favor, ingrese la observación de la visita");
                    return false;
                };
                return true;
            },
            onEditarVisita: function (oEvent) {
                this._getVisita(this.selectedItem.getBindingContextPath()).then(function() {
                    if (!that.oCreateFragment) {
                        that.oCreateFragment = sap.ui.core.Fragment.load({
                            name: "com.softtek.propiedadesaca.view.fragments.EditarVisita",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            let oModel = new sap.ui.model.json.JSONModel({
                                "NombreVisit": oVisita.NombreVisit,
                                "ApellidoVisit": oVisita.ApellidoVisit,
                                "Puntuacion": parseInt(oVisita.Puntuacion),
                                "Fecha": oVisita.Fecha,
                                "Observaciones": oVisita.Observaciones,
                            });
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "VisitaEdit");
                            oDialog.attachAfterClose(that._afterCloseDialog);
                            return oDialog;
                        })
                        that.oCreateFragment.then(function (oDialog) {
                            oDialog.open();
                        }.bind(that));
                    }
                });
            },
            onEditarVisitaPress: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("VisitaEdit").getData();
                if (!that._validarVisita(oEntry)) {
                    return;
                }
                oEntry.Puntuacion = parseFloat(oEntry.Puntuacion, 0);
                let fecha = new Date(oEntry.Fecha);
                fecha.setDate(fecha.getDate() + 1);
                oEntry.Fecha = fecha;
                var sPath = oEvent.getSource().getBindingContext().getPath();
                var idPropiedad = sPath.match(/\('([^']+)'\)/)[1];
                oEntry.IdPropiedad = idPropiedad;
                var oDataModel = that.getView().getModel();
                oDataModel.update(this.selectedItem.getBindingContextPath(), oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        sap.m.MessageBox.success("La visita fue actualizada correctamente");
                        that.getOwnerComponent().getModel().refresh(true, true);
                        that.onCerrarCrearPropiedadPress();
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error inesperado al actualizar la visita");
                    }
                });
            },
            onEliminarVisita: function (oEvent) {
                let sPath = this.selectedItem.getBindingContextPath()
                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.remove(`${sPath}`, {
                    success: function (oResponse) {
                        sap.m.MessageBox.success("Se eliminó correctamente la visita");
                        that.getOwnerComponent().getModel().refresh(true, true);
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error al eliminar la visita");
                    }
                });
            },
            _oBindingChange: function (oEvent) {
                this._getPropiedad(oEvent.getSource().getPath());
            },
            _getVisita: function (sPath) {
                return new Promise(function(resolve, reject) {
                    var oDataModel = this.getOwnerComponent().getModel();
                    oDataModel.read(`${sPath}`, {
                        success: function (oResponse) {
                            oVisita = oResponse;
                            resolve();
                        },
                        error: function (oError) {
                            sap.m.MessageBox.error("Error inesperado al obtener la visita");
                            reject(oError);
                        }
                    });
                }.bind(this));
            },
            });
    });
