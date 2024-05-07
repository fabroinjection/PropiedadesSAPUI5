sap.ui.define([], function() {
    "use strict";

    return {
        formatDate: function(dateString) {
            var date = new Date(dateString);

            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();

            var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;

            return formattedDate;
        },
        formatHighlight: function (iPuntuacion) {
            if (iPuntuacion <= 3) {
                return "Warning";
            } else if (iPuntuacion >= 4 && iPuntuacion <= 7) {
                return "Information";
            } else {
                return "Success";
            }
        },
    };
});
