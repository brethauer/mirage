 // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
'use strict';

// for vendor pages
LayoutManager.vendorInit = function(original) {
    // binds events needed only in the vendor context on init and then
    // calls original init function
    Events.subscribe('contractDataLoaded', this.buildContractTable.bind(LayoutManager));

    original.bind(LayoutManager).call();
};

LayoutManager.originalInit = LayoutManager.init;

LayoutManager.init = function() {
    LayoutManager.vendorInit(LayoutManager.originalInit);
};

LayoutManager.render = function(results) {
    var currentDate = new Date();
    var mailto, t, indicatorsRow, formattedDate, dateObj;

    $('.vendor_title').html(results.name);
    if (results.sam_exclusion == true) {
            $('.debarred_status').show();
    }
    $('.duns_number').html(results.duns ? results.duns : ' ');
    $('.cage_code').html(results.cage ? results.cage : ' ');
    $('.number_of_employees').html(results.number_of_employees ? results.number_of_employees : 'N/A');
    $('.annual_revenue').html(results.annual_revenue ? '$' + this.numberWithCommas(results.annual_revenue) : 'N/A');

    //load SAM expiration date
    if (results['sam_expiration_date']) {
        dateObj = this.createDate(results['sam_expiration_date']);
        formattedDate = this.formatDate(dateObj);
    }
    else {
        formattedDate = 'unknown';
    }

    $(".vendor_sam_expiration_date").text(formattedDate);
    if (currentDate > dateObj) {
        $(".vendor_sam_expiration_notice").show();
    }

    //contact info
    $('.vendor_address1').html(results.sam_address ? results.sam_address : ' ');
    $('.vendor_address2').html(results.sam_citystate ? results.sam_citystate : ' ');
    $('.vendor_poc_name').html(results.pm_name ? results.pm_name : ' ');
    $('.vendor_poc_phone').html(results.pm_phone ? results.pm_phone : ' ');

    if (results.pm_email !== null) {
        mailto = $('<a href="mailto:' + results.pm_email + '">' + results.pm_email + '</a>');
        $('.vendor_poc_email').html(mailto);
    }

    //socioeconomic indicators
    t = $('#socioeconomic_indicators');
    indicatorsRow = $('<tr></tr>');
    indicatorsRow.append(this.renderColumn(results, '8a', 'A6'));
    indicatorsRow.append(this.renderColumn(results, 'Hubz', 'XX'));
    indicatorsRow.append(this.renderColumn(results, 'sdvo', 'QF'));
    indicatorsRow.append(this.renderColumn(results, 'wo', 'A2'));
    indicatorsRow.append(this.renderColumn(results, 'vo', 'A5'));
    indicatorsRow.append(this.renderColumn(results, 'sdb', '27'));
    t.append(indicatorsRow);

    //breadcrumbs
    $('#vendor_breadcrumb').html(results.name);
}; 

LayoutManager.renderColumn = function(v, prefix, setasideCode) {
    return $('<td class="' + prefix + '">' + this.vendorIndicator(v, prefix, setasideCode) + '</td>');
};

LayoutManager.buildContractTable = function(data) {
    var table = $("div#ch_table table").clone();
    var results = data['results'];
    var contract, tr, displayDate, pointOfContact, piid, agencyName, pricingType, obligatedAmount, status;

    for (contract in results) {
        if (results.hasOwnProperty(contract)) {
            tr = $('<tr></tr>');
            displayDate = (results[contract]['date_signed'] ? this.formatDate(this.createDate(results[contract]['date_signed'])) : ' ');
            piid = (results[contract]['piid'] ? results[contract]['piid'] : ' ');
            agencyName = (results[contract]['agency_name'] ? results[contract]['agency_name'] : ' ');
            pricingType = (results[contract]['pricing_type'] ? results[contract]['pricing_type'] : ' ');
            obligatedAmount = (results[contract]['obligated_amount'] ? this.numberWithCommas(results[contract]['obligated_amount']) : ' ');
            status = (results[contract]['status'] ? results[contract]['status'] : ' ');

            if (typeof results[contract]['point_of_contact'] === 'string') {
                pointOfContact = results[contract]['point_of_contact'].toLowerCase();
            }
            else {
                pointOfContact = (results[contract]['point_of_contact'] ? results[contract]['point_of_contract'] : ' ');
            }

            tr.append('<td class="date_signed">' + displayDate + '</td>');
            tr.append('<td class="piid">' + piid + '</td>');
            tr.append('<td class="agency">' + agencyName + '</td>');
            tr.append('<td class="type">' + pricingType + '</td>');
            tr.append('<td class="value">' + obligatedAmount+ '</td>');
            tr.append('<td class="email_poc">' + pointOfContact + '</td>');
            tr.append('<td class="status">' + status + '</td>');
            //more goes here
        
            table.append(tr);
        }
    }

    $("div#ch_table table").remove();
    $("div#ch_table").append(table);
};

LayoutManager.formatDate = function(dateObj) {
	//returns (mm/dd/yyyy) string representation of a date object
	return (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear().toString().substring(2);
};

LayoutManager.vendorIndicator = function(v, prefix, setaside_code) {
    //returns X if vendor and socioeconomic indicator match
    if (v['setasides'].length > 0) {
        for (var i=0; i<v['setasides'].length; i++) {
            if (v['setasides'][i]['code'] == setaside_code) {
                return 'X';
            }
        }
    }

    return '';
};

LayoutManager.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
