//populate dataset for searching diseases
d3.csv("data/diseases_list.csv", function (error, data) {
    if (error) throw error;
    data.forEach(function (d) {
        $("#diseases").append($("<option>").attr('value', d.name).text(d.name));
    });
});

//submit by clicking enter
$(function() {
    $('#search').each(function() {
        $(this).find('input').keypress(function(e) {
            // Enter pressed?
            if(e.which == 10 || e.which == 13) {
                this.form.submit();
            }
        });
        $(this).find('input[type=submit]').hide();
    });
});
