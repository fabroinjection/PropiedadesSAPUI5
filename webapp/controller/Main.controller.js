sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageToast) {
        "use strict";
        var that;
        return BaseController.extend("com.softtek.propiedadesaca.controller.Main", {
            onInit: function () {
                that = this;
                var oRouter = this.getRouter();
                oRouter.getRoute("RouteMain").attachPatternMatched(this._onPatternMatched, this);
            },
            _onPatternMatched: function () {
                let oGrid = this.getView().byId("gridList");
                oGrid.removeSelections();
            },
            getPropiedades: function () {

                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.read("/PropiedadSet", {
                    success: function (oResponse) {
                    
                    },
                    error: function (oError) {
                        MessageToast.show("Error al leer las propiedades")
                    }
                });
            },
            onSelectionPropiedad: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var sPropiedadId = oSelectedItem.getBindingContext().getProperty("IdPropiedad");
                this.getRouter().navTo("Detail", {
                    idPropiedad: sPropiedadId
                });
            },
            onCreatePropiedad: function (oEvent) {
                if (!this.oCreateFragment) {
                    this.oCreateFragment = 
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.propiedadesaca.view.fragments.CrearPropiedad",
                            controller: that
                        }).then(function (oDialog) {
                            that.getView().addDependent(oDialog);
                            let oModel = new sap.ui.model.json.JSONModel({
                                "NombreDuenio": "",
                                "ApellidoDuenio": "",
                                "TipoProp": "",
                                "Superficie": "",
                                "NombreCalle": "",
                                "NumeroCalle": "",
                                "Provincia": "",
                                "Localidad": "",
                                "NumHabitaciones": "",
                                "Precio": "",
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
                this.oCreateFragment.then(function (oDialog) {
                    oDialog.close();
                }.bind(that));
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
                oDataModel.create("/PropiedadSet", oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        sap.m.MessageBox.success("La propiedad fue registrada correctamente");
                        that.getOwnerComponent().getModel().refresh(true, true);
                        that.onCerrarCrearPropiedadPress();
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error inesperado al registrar la propiedad");
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
            onDeletePropiedad: function (oEvent) {
                let sPath = oEvent.getSource().getBindingContext().getPath();
                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.remove(`${sPath}`, {
                    success: function (oResponse) {
                        sap.m.MessageBox.success("Se eliminó correctamente la propiedad");
                        that.getOwnerComponent().getModel().refresh(true, true);
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error al eliminar la propiedad");
                    }
                });
            },
            onSearch: function (oEvent) {
                var aFilters = [],
                sNombre,
                sApellido,
                sTipo,
                sPrecio,
                sSuperficie
                ;
                var aSelectionSet = oEvent.getParameter("selectionSet");
                aSelectionSet.forEach(x => {
                    switch(x.getName()){
                        case "NombreDuenio":
                            sNombre = x.getValue();     
                            break;
                        case "ApellidoDuenio":
                            sApellido = x.getValue();
                            break;
                        case "TipoProp":
                            sTipo = x.getValue();
                            break;
                        case "Precio":
                            sPrecio = x.getValue();
                            break;
                        case "Superficie":
                            sSuperficie = x.getValue();
                            break;
                        default:
                    }
                });
                if (sNombre) {
                    let oFilterProp = new sap.ui.model.Filter({
                        path: 'NombreDuenio',
                        operator: 'EQ',
                        value1: sNombre
                    });
                    aFilters.push(oFilterProp);
                }
                if (sApellido) {
                    let oFilterProp = new sap.ui.model.Filter({
                        path: 'ApellidoDuenio',
                        operator: 'EQ',
                        value1: sApellido
                    });
                    aFilters.push(oFilterProp);
                }
                if (sTipo) {
                    let oFilterProp = new sap.ui.model.Filter({
                        path: 'TipoProp',
                        operator: 'EQ',
                        value1: sTipo
                    });
                    aFilters.push(oFilterProp);
                }
                if (sPrecio) {
                    let oFilterProp = new sap.ui.model.Filter({
                        path: 'Precio',
                        operator: 'EQ',
                        value1: sPrecio
                    });
                    aFilters.push(oFilterProp);
                }
                if (sSuperficie) {
                    let oFilterProp = new sap.ui.model.Filter({
                        path: 'Superficie',
                        operator: 'EQ',
                        value1: sSuperficie
                    });
                    aFilters.push(oFilterProp);
                }

                this.getView().byId("gridList").getBinding("items").filter(aFilters);

            },
        });
    });
