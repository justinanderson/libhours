window.onload = function() {
    init()
};

var public_spreadsheet_url = '1aEV-CZIqJD9hHJWNWTWIN0I4Cgz3M8jpl4hQwA9l8JU';

function init() {
    Tabletop.init({
        key: public_spreadsheet_url,
        callback: showHours,
        simpleSheet: false
    });
}

var page_date = new Date();

function showHours(data, tabletop) {
    // get passed date -or- current date
    var current_date = moment(page_date);
    // use that date to determine the monday of "this" week
    var start_date = moment().subtract(current_date.isoWeekday()-1, 'days');
    // array with date (using moment) for each day-of-week (dow) 0=monday, 6=sunday
    var dates_per_day = [];
    // array with name of day for each dow
    var names_per_day = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
    ];
    // hash of exceptions--hash of dates each contain a hash of lib names (this could be reversed if that makes more sense)
    var exceptions = {};
    // hash of hours broken down by semester, location, day
    var hours_data = {};
    // array of semester for each dow--in case the semester changes in the middle of the week
    var semester_per_day = [];
    // hash of hours data for "this" week
    var hours = {};

    // exceptions much be access by date, then location
    _.each(data['Holidays and Special Hours'].elements, function(exception) {
        exceptions[exception.date] = exceptions[exception.date] || {};
        exceptions[exception.date][exception.library] = exception;
    });

    // hours_data must be access by semester, then location, then by day
    _.each(data['Semester Breakdown'].elements, function(semester) {
        hours_data[semester.semestername] = {};

        if (data[semester.semestername]) {
            _.each(data[semester.semestername].elements, function(location) {
                hours_data[semester.semestername][location.location] = location;
            });
        }
    });

    // run through each DOW for "this" week
    // determine what date the day is
    // determine which semester that date falls in
    for (var i=0; i < 7; i++) {
        var date = start_date.add(i, 'days');
        
        dates_per_day.push(date);
        
        semester_per_day.push(_.find(data['Semester Breakdown'].elements, function(semester) {
            if (    date.isSame(semester.start, 'day') ||
                    date.isSame(semester.end, 'day') ||
                    (   date.isAfter(semester.start, 'day') &&
                        date.isBefore(semester.end, 'day'))) {
                return semester.semestername;   
            }
        }));
    }

    // build hash of arrays (weekly hours) for display in template
    // lib name as key, value as array of hours for each DOW
        // for each lib
            // for each DOW
                // check date against lib exceptions list
                // check against lib tab hours
                // if no exceptions and no lib tab, use default hours from default hours object
    _.each(data['Default Hours'].elements, function(lib) {
        for (var i=0; i < 7; i++) {
            var library = lib.location;
            var date = dates_per_day[i];
            var day_name = names_per_day[i];
            var semester = semester_per_day[i].semestername;

            hours[library] = hours[library] || {};

            if (exceptions[date] && exceptions[date][library]) {
                hours[library][i] = exceptions[date][library].hours;
            }
            else if (hours_data[semester] && hours_data[semester][library] && hours_data[semester][library][day_name]) {
                hours[library][i] = hours_data[semester][library][day_name];
            }
            else {
                hours[library][i] = lib[day_name];
            }
        }
    });

    console.log(hours);

    // build template passing hours hash

    // print!

    // should this be a backbone app?
}