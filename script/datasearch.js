//populate dataset for searching diseases
d3.csv("data/diseases_list.csv", function (error, data) {
    if (error) throw error;
    data.forEach(function (d) {
        $("#diseases").append($("<option>").attr('value', d.name).text(d.name));
    });
});