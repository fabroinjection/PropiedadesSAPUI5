sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History) {
        "use strict";
        var that;
        return Controller.extend("com.softtek.aca20241q.controller.BaseController", {
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },
            onBack: function () {
                var oHistory = History.getInstance();
                var oPrevHash = oHistory.getPreviousHash();
                if (oPrevHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getRouter().navTo("RouteMain");
                }
            },
        });
    });
