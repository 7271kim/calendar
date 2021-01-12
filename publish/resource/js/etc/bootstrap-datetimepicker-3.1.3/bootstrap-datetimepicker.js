/*
 //! version : 3.1.3
 =========================================================
 bootstrap-datetimepicker.js
 https://github.com/Eonasdan/bootstrap-datetimepicker
 =========================================================
 The MIT License (MIT)

 Copyright (c) 2014 Jonathan Peterson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
;(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('moment'));
    }
    else {
        // Neither AMD or CommonJS used. Use global variables.
        if (!jQuery) {
            throw new Error('bootstrap-datetimepicker requires jQuery to be loaded first');
        }
        if (!moment) {
            throw new Error('bootstrap-datetimepicker requires moment.js to be loaded first');
        }
        factory(root.jQuery, moment);
    }
}(this, function ($, moment) {
    'use strict';
    if (typeof moment === 'undefined') {
        throw new Error('momentjs is required');
    }

    var dpgId = 0,

        DateTimePicker = function (element, options) {
            var defaults = $.fn.datetimepicker.defaults,

                icons = {
                    time: 'glyphicon glyphicon-time',
                    date: 'glyphicon glyphicon-calendar',
                    up: 'glyphicon glyphicon-chevron-up',
                    down: 'glyphicon glyphicon-chevron-down',
                    previous: 'glyphicon glyphicon-chevron-left',
                    next: 'glyphicon glyphicon-chevron-right',
                    today: 'glyphicon glyphicon-screenshot',
                    clear: 'glyphicon glyphicon-trash',
                    close: 'glyphicon glyphicon-remove'
                },

                picker = this,
                errored = false,
                dDate,

                init = function () {
					
                    update();
                    showMode();
                    if (!getPickerInput().prop('disabled')) {
                        attachDatePickerEvents();
                    }
                    if (picker.options.defaultDate !== '' && getPickerInput().val() === '') {
                        picker.setValue(picker.options.defaultDate);
                    }
                    if (picker.options.minuteStepping !== 1) {
                        rInterval = picker.options.minuteStepping;
                        picker.date.minutes((Math.round(picker.date.minutes() / rInterval) * rInterval) % 60).seconds(0);
                    }
                },

                getPickerInput = function () {
                    var input;

                    if (picker.isInput) {
                        return picker.element;
                    }
                    input = picker.element.find('.datepickerinput');
                    if (input.size() === 0) {
                        input = picker.element.find('input');
                    }
                    else if (!input.is('input')) {
                        throw new Error('CSS class "datepickerinput" cannot be applied to non input element');
                    }
                    return input;
                },

						
                place = function () {
                    var position = 'absolute',
                        offset = picker.component ? picker.component.offset() : picker.element.offset(),
                        $window = $(window),
                        placePosition;

                    picker.width = picker.component ? picker.component.outerWidth() : picker.element.outerWidth();
                    offset.top = offset.top + picker.element.outerHeight();

                    if (picker.options.direction === 'up') {
                        placePosition = 'top';
                    } else if (picker.options.direction === 'bottom') {
                        placePosition = 'bottom';
                    } else if (picker.options.direction === 'auto') {
                        if (offset.top + picker.widget.height() > $window.height() + $window.scrollTop() && picker.widget.height() + picker.element.outerHeight() < offset.top) {
                            placePosition = 'top';
                        } else {
                            placePosition = 'bottom';
                        }
                    }
                    if (placePosition === 'top') {
                        offset.bottom = $window.height() - offset.top + picker.element.outerHeight() + 3;
                        picker.widget.addClass('top').removeClass('bottom');
                    } else {
                        offset.top += 1;
                        picker.widget.addClass('bottom').removeClass('top');
                    }

                    if (picker.options.width !== undefined) {
                        picker.widget.width(picker.options.width);
                    }

                    if (picker.options.orientation === 'left') {
                        picker.widget.addClass('left-oriented');
                        offset.left = offset.left - picker.widget.width() + 20;
                    }

                    if (isInFixed()) {
                        position = 'fixed';
                        offset.top -= $window.scrollTop();
                        offset.left -= $window.scrollLeft();
                    }

                    if ($window.width() < offset.left + picker.widget.outerWidth()) {
                        offset.right = $window.width() - offset.left - picker.width;
                        offset.left = 'auto';
                        picker.widget.addClass('pull-right');
                    } else {
                        offset.right = 'auto';
                        picker.widget.removeClass('pull-right');
                    }

                    if (placePosition === 'top') {
                        picker.widget.css({
                            position: position,
                            bottom: offset.bottom,
                            top: 'auto',
                            left: offset.left,
                            right: offset.right
                        });
                    } else {
                        picker.widget.css({
                            position: position,
                            top: offset.top,
                            bottom: 'auto',
                            left: offset.left,
                            right: offset.right
                        });
                    }
                },

                notifyChange = function (oldDate, eventType) {
                    if (moment(picker.date).isSame(moment(oldDate)) && !errored) {
                        return;
                    }
                    errored = false;
                    picker.element.trigger({
                        type: 'dp.change',
                        date: moment(picker.date),
                        oldDate: moment(oldDate)
                    });

                    if (eventType !== 'change') {
                        picker.element.change();
                    }
                },

                notifyError = function (date) {
                    errored = true;
                    picker.element.trigger({
                        type: 'dp.error',
                        date: moment(date, picker.format, picker.options.useStrict)
                    });
                },

                update = function (newDate) {
                    moment.locale(picker.options.language);
                    var dateStr = newDate;
                    if (!dateStr) {
                        dateStr = getPickerInput().val();
                        if (dateStr) {
                            picker.date = moment(dateStr, picker.format, picker.options.useStrict);
                        }
                        if (!picker.date) {
                            picker.date = moment();
                        }
                    }
                    picker.viewDate = moment(picker.date).startOf('month');
                    fillDate();
                    fillTime();
                },

                fillDow = function () {
                    moment.locale(picker.options.language);
                    var html = $('<tr>'), weekdaysMin = moment.weekdaysMin(), i;
                    if (picker.options.calendarWeeks === true) {
                        html.append('<th class="cw">#</th>');
                    }
                    if (moment().localeData()._week.dow === 0) { // starts on Sunday
                        for (i = 0; i < 7; i++) {
                            html.append('<th class="dow">' + weekdaysMin[i] + '</th>');
                        }
                    } else {
                        for (i = 1; i < 8; i++) {
                            if (i === 7) {
                                html.append('<th class="dow">' + weekdaysMin[0] + '</th>');
                            } else {
                                html.append('<th class="dow">' + weekdaysMin[i] + '</th>');
                            }
                        }
                    }
                    picker.widget.find('.datepicker-days thead').append(html);
                },

                fillMonths = function () {
                    moment.locale(picker.options.language);
                    var html = '', i, monthsShort = moment.monthsShort();
                    for (i = 0; i < 12; i++) {
                        html += '<span class="month">' + monthsShort[i] + '</span>';
                    }
                    picker.widget.find('.datepicker-months td').append(html);
                },

                fillDate = function () {
                    if (!picker.options.pickDate) {
                        return;
                    }
                    moment.locale(picker.options.language);
                    var year = picker.viewDate.year(),
                        month = picker.viewDate.month(),
                        startYear = picker.options.minDate.year(),
                        startMonth = picker.options.minDate.month(),
                        endYear = picker.options.maxDate.year(),
                        endMonth = picker.options.maxDate.month(),
                        currentDate,
                        prevMonth, nextMonth, html = [], row, clsName, i, days, yearCont, currentYear, months = moment.months();

                    picker.widget.find('.datepicker-days').find('.disabled').removeClass('disabled');
                    picker.widget.find('.datepicker-months').find('.disabled').removeClass('disabled');
                    picker.widget.find('.datepicker-years').find('.disabled').removeClass('disabled');

                    picker.widget.find('.datepicker-days th:eq(1)').text(
                        months[month] + ' ' + year);

                    prevMonth = moment(picker.viewDate, picker.format, picker.options.useStrict).subtract(1, 'months');
                    days = prevMonth.daysInMonth();
                    prevMonth.date(days).startOf('week');
                    if ((year === startYear && month <= startMonth) || year < startYear) {
                        picker.widget.find('.datepicker-days th:eq(0)').addClass('disabled');
                    }
                    if ((year === endYear && month >= endMonth) || year > endYear) {
                        picker.widget.find('.datepicker-days th:eq(2)').addClass('disabled');
                    }

                    nextMonth = moment(prevMonth).add(42, 'd');
                    while (prevMonth.isBefore(nextMonth)) {
                        if (prevMonth.weekday() === moment().startOf('week').weekday()) {
                            row = $('<tr>');
                            html.push(row);
                            if (picker.options.calendarWeeks === true) {
                                row.append('<td class="cw">' + prevMonth.week() + '</td>');
                            }
                        }
                        clsName = '';
                        if (prevMonth.year() < year || (prevMonth.year() === year && prevMonth.month() < month)) {
                            clsName += ' old';
                        } else if (prevMonth.year() > year || (prevMonth.year() === year && prevMonth.month() > month)) {
                            clsName += ' new';
                        }
                        if (prevMonth.isSame(moment({y: picker.date.year(), M: picker.date.month(), d: picker.date.date()}))) {
                            clsName += ' active';
                        }
                        if (isInDisableDates(prevMonth, 'day') || !isInEnableDates(prevMonth)) {
                            clsName += ' disabled';
                        }
                        if (picker.options.showToday === true) {
                            if (prevMonth.isSame(moment(), 'day')) {
                                clsName += ' today';
                            }
                        }
                        if (picker.options.daysOfWeekDisabled) {
                            for (i = 0; i < picker.options.daysOfWeekDisabled.length; i++) {
                                if (prevMonth.day() === picker.options.daysOfWeekDisabled[i]) {
                                    clsName += ' disabled';
                                    break;
                                }
                            }
                        }
                        row.append('<td class="day' + clsName + '">' + prevMonth.date() + '</td>');

                        currentDate = prevMonth.date();
                        prevMonth.add(1, 'd');

                        if (currentDate === prevMonth.date()) {
                            prevMonth.add(1, 'd');
                        }
                    }
                    picker.widget.find('.datepicker-days tbody').empty().append(html);
                    currentYear = picker.date.year();
                    months = picker.widget.find('.datepicker-months').find('th:eq(1)').text(year).end().find('span').removeClass('active');
                    if (currentYear === year) {
                        months.eq(picker.date.month()).addClass('active');
                    }
                    if (year - 1 < startYear) {
                        picker.widget.find('.datepicker-months th:eq(0)').addClass('disabled');
                    }
                    if (year + 1 > endYear) {
                        picker.widget.find('.datepicker-months th:eq(2)').addClass('disabled');
                    }
                    for (i = 0; i < 12; i++) {
                        if ((year === startYear && startMonth > i) || (year < startYear)) {
                            $(months[i]).addClass('disabled');
                        } else if ((year === endYear && endMonth < i) || (year > endYear)) {
                            $(months[i]).addClass('disabled');
                        }
                    }

                    html = '';
                    year = parseInt(year / 10, 10) * 10;
                    yearCont = picker.widget.find('.datepicker-years').find(
                        'th:eq(1)').text(year + '-' + (year + 9)).parents('table').find('td');
                    picker.widget.find('.datepicker-years').find('th').removeClass('disabled');
                    if (startYear > year) {
                        picker.widget.find('.datepicker-years').find('th:eq(0)').addClass('disabled');
                    }
                    if (endYear < year + 9) {
                        picker.widget.find('.datepicker-years').find('th:eq(2)').addClass('disabled');
                    }
                    year -= 1;
                    for (i = -1; i < 11; i++) {
                        html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '') + ((year < startYear || year > endYear) ? ' disabled' : '') + '">' + year + '</span>';
                        year += 1;
                    }
                    yearCont.html(html);
                },

                fillHours = function () {
                    moment.locale(picker.options.language);
                    var table = picker.widget.find('.timepicker .timepicker-hours table'), html = '', current, i, j;
                    table.parent().hide();
                    if (picker.use24hours) {
                        current = 0;
                        for (i = 0; i < 6; i += 1) {
                            html += '<tr>';
                            for (j = 0; j < 4; j += 1) {
                                html += '<td class="hour">' + padLeft(current.toString()) + '</td>';
                                current++;
                            }
                            html += '</tr>';
                        }
                    }
                    else {
                        current = 1;
                        for (i = 0; i < 3; i += 1) {
                            html += '<tr>';
                            for (j = 0; j < 4; j += 1) {
                                html += '<td class="hour">' + padLeft(current.toString()) + '</td>';
                                current++;
                            }
                            html += '</tr>';
                        }
                    }
                    table.html(html);
                },

                fillMinutes = function () {
                    var table = picker.widget.find('.timepicker .timepicker-minutes table'), html = '', current = 0, i, j, step = picker.options.minuteStepping;
                    table.parent().hide();
                    if (step === 1)  {
                        step = 5;
                    }
                    for (i = 0; i < Math.ceil(60 / step / 4) ; i++) {
                        html += '<tr>';
                        for (j = 0; j < 4; j += 1) {
                            if (current < 60) {
                                html += '<td class="minute">' + padLeft(current.toString()) + '</td>';
                                current += step;
                            } else {
                                html += '<td></td>';
                            }
                        }
                        html += '</tr>';
                    }
                    table.html(html);
                },

                fillSeconds = function () {
                    var table = picker.widget.find('.timepicker .timepicker-seconds table'), html = '', current = 0, i, j;
                    table.parent().hide();
                    for (i = 0; i < 3; i++) {
                        html += '<tr>';
                        for (j = 0; j < 4; j += 1) {
                            html += '<td class="second">' + padLeft(current.toString()) + '</td>';
                            current += 5;
                        }
                        html += '</tr>';
                    }
                    table.html(html);
                },

                fillTime = function () {
                    if (!picker.date) {
                        return;
                    }
                    var timeComponents = picker.widget.find('.timepicker span[data-time-component]'),
                        hour = picker.date.hours(),
                        period = picker.date.format('A');
                    if (!picker.use24hours) {
                        if (hour === 0) {
                            hour = 12;
                        } else if (hour !== 12) {
                            hour = hour % 12;
                        }
                        picker.widget.find('.timepicker [data-action=togglePeriod]').text(period);
                    }
                    timeComponents.filter('[data-time-component=hours]').text(padLeft(hour));
                    timeComponents.filter('[data-time-component=minutes]').text(padLeft(picker.date.minutes()));
                    timeComponents.filter('[data-time-component=seconds]').text(padLeft(picker.date.second()));
                },

                click = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    picker.unset = false;
                    var target = $(e.target).closest('span, td, th'), month, year, step, day, oldDate = moment(picker.date);
                    if (target.length === 1) {
                        if (!target.is('.disabled')) {
                            switch (target[0].nodeName.toLowerCase()) {
                                case 'th':
                                    switch (target[0].className) {
                                        case 'picker-switch':
                                            showMode(1);
                                            break;
                                        case 'prev':
                                        case 'next':
                                            step = dpGlobal.modes[picker.viewMode].navStep;
                                            if (target[0].className === 'prev') {
                                                step = step * -1;
                                            }
                                            picker.viewDate.add(step, dpGlobal.modes[picker.viewMode].navFnc);
                                            fillDate();
                                            break;
                                    }
                                    break;
                                case 'span':
                                    if (target.is('.month')) {
                                        month = target.parent().find('span').index(target);
                                        picker.viewDate.month(month);
                                    } else {
                                        year = parseInt(target.text(), 10) || 0;
                                        picker.viewDate.year(year);
                                    }
                                    if (picker.viewMode === picker.minViewMode) {
                                        picker.date = moment({
                                            y: picker.viewDate.year(),
                                            M: picker.viewDate.month(),
                                            d: picker.viewDate.date(),
                                            h: picker.date.hours(),
                                            m: picker.date.minutes(),
                                            s: picker.date.seconds()
                                        });
                                        set();
                                        notifyChange(oldDate, e.type);
                                    }
                                    showMode(-1);
                                    fillDate();
                                    break;
                                case 'td':
                                    if (target.is('.day')) {
                                        day = parseInt(target.text(), 10) || 1;
                                        month = picker.viewDate.month();
                                        year = picker.viewDate.year();
                                        if (target.is('.old')) {
                                            if (month === 0) {
                                                month = 11;
                                                year -= 1;
                                            } else {
                                                month -= 1;
                                            }
                                        } else if (target.is('.new')) {
                                            if (month === 11) {
                                                month = 0;
                                                year += 1;
                                            } else {
                                                month += 1;
                                            }
                                        }
                                        picker.date = moment({
                                                y: year,
                                                M: month,
                                                d: day,
                                                h: picker.date.hours(),
                                                m: picker.date.minutes(),
                                                s: picker.date.seconds()
                                            }
                                        );
                                        picker.viewDate = moment({
                                            y: year, M: month, d: Math.min(28, day)
                                        });
                                        fillDate();
                                        set();
                                        notifyChange(oldDate, e.type);
                                    }
                                    break;
                            }
                        }
                    }
                },

                actions = {
                    incrementHours: function () {
                        checkDate('add', 'hours', 1);
                    },

                    incrementMinutes: function () {
                        checkDate('add', 'minutes', picker.options.minuteStepping);
                    },

                    incrementSeconds: function () {
                        checkDate('add', 'seconds', 1);
                    },

                    decrementHours: function () {
                        checkDate('subtract', 'hours', 1);
                    },

                    decrementMinutes: function () {
                        checkDate('subtract', 'minutes', picker.options.minuteStepping);
                    },

                    decrementSeconds: function () {
                        checkDate('subtract', 'seconds', 1);
                    },

                    togglePeriod: function () {
                        var hour = picker.date.hours();
                        if (hour >= 12) {
                            hour -= 12;
                        } else {
                            hour += 12;
                        }
                        picker.date.hours(hour);
                    },

                    showPicker: function () {
                        picker.widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                        picker.widget.find('.timepicker .timepicker-picker').show();
                    },

                    showHours: function () {
                        picker.widget.find('.timepicker .timepicker-picker').hide();
                        picker.widget.find('.timepicker .timepicker-hours').show();
                    },

                    showMinutes: function () {
                        picker.widget.find('.timepicker .timepicker-picker').hide();
                        picker.widget.find('.timepicker .timepicker-minutes').show();
                    },

                    showSeconds: function () {
                        picker.widget.find('.timepicker .timepicker-picker').hide();
                        picker.widget.find('.timepicker .timepicker-seconds').show();
                    },

                    selectHour: function (e) {
                        var hour = parseInt($(e.target).text(), 10);
                        if (!picker.use24hours) {
                            if (picker.date.hours() >= 12) {
                                if (hour !== 12) {
                                    hour += 12;
                                }
                            } else {
                                if (hour === 12) {
                                    hour = 0;
                                }
                            }
                        }
                        picker.date.hours(hour);
                        actions.showPicker.call(picker);
                    },

                    selectMinute: function (e) {
                        picker.date.minutes(parseInt($(e.target).text(), 10));
                        actions.showPicker.call(picker);
                    },

                    selectSecond: function (e) {
                        picker.date.seconds(parseInt($(e.target).text(), 10));
                        actions.showPicker.call(picker);
                    }
                },

                doAction = function (e) {
                    var oldDate = moment(picker.date),
                        action = $(e.currentTarget).data('action'),
                        rv = actions[action].apply(picker, arguments);
                    stopEvent(e);
                    if (!picker.date) {
                        picker.date = moment({y: 1970});
                    }
                    set();
                    fillTime();
                    notifyChange(oldDate, e.type);
                    return rv;
                },

                stopEvent = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                },

                keydown = function (e) {
                    if (e.keyCode === 27) { // allow escape to hide picker
                        picker.hide();
                    }
                },

                change = function (e) {
                    moment.locale(picker.options.language);
                    var input = $(e.target), oldDate = moment(picker.date), newDate = moment(input.val(), picker.format, picker.options.useStrict);
                    if (newDate.isValid() && !isInDisableDates(newDate) && isInEnableDates(newDate)) {
                        update();
                        picker.setValue(newDate);
                        notifyChange(oldDate, e.type);
                        set();
                    }
                    else {
                        picker.viewDate = oldDate;
                        picker.unset = true;
                        notifyChange(oldDate, e.type);
                        notifyError(newDate);
                    }
                },

                showMode = function (picker,dir) {
                    if (dir) {
                        picker.viewMode = Math.max(picker.minViewMode, Math.min(2, picker.viewMode + dir));
                    }
                    picker.widget.find('.datepicker > div').hide().filter('.datepicker-' + dpGlobal.modes[picker.viewMode].clsName).show();
                },

                attachDatePickerEvents = function () {
                    var $this, $parent, expanded, closed, collapseData;
                    picker.widget.on('click', '.datepicker *', $.proxy(click, this)); // this handles date picker clicks
                    picker.widget.on('click', '[data-action]', $.proxy(doAction, this)); // this handles time picker clicks
                    picker.widget.on('mousedown', $.proxy(stopEvent, this));
                    picker.element.on('keydown', $.proxy(keydown, this));
                    if (picker.options.pickDate && picker.options.pickTime) {
                        picker.widget.on('click.togglePicker', '.accordion-toggle', function (e) {
                            e.stopPropagation();
                            $this = $(this);
                            $parent = $this.closest('ul');
                            expanded = $parent.find('.in');
                            closed = $parent.find('.collapse:not(.in)');

                            if (expanded && expanded.length) {
                                collapseData = expanded.data('collapse');
                                if (collapseData && collapseData.transitioning) {
                                    return;
                                }
                                expanded.collapse('hide');
                                closed.collapse('show');
                                $this.find('span').toggleClass(picker.options.icons.time + ' ' + picker.options.icons.date);
                                if (picker.component) {
                                    picker.component.find('span').toggleClass(picker.options.icons.time + ' ' + picker.options.icons.date);
                                }
                            }
                        });
                    }
                    if (picker.isInput) {
                        picker.element.on({
                            'click': $.proxy(picker.show, this),
                            'focus': $.proxy(picker.show, this),
                            'change': $.proxy(change, this),
                            'blur': $.proxy(picker.hide, this)
                        });
                    } else {
                        picker.element.on({
                            'change': $.proxy(change, this)
                        }, 'input');
                        if (picker.component) {
                            picker.component.on('click', $.proxy(picker.show, this));
                            picker.component.on('mousedown', $.proxy(stopEvent, this));
                        } else {
                            picker.element.on('click', $.proxy(picker.show, this));
                        }
                    }
                },

                attachDatePickerGlobalEvents = function () {
                    $(window).on(
                        'resize.datetimepicker' + picker.id, $.proxy(place, this));
                    if (!picker.isInput) {
                        $(document).on(
                            'mousedown.datetimepicker' + picker.id, $.proxy(picker.hide, this));
                    }
                },

                detachDatePickerEvents = function () {
                    picker.widget.off('click', '.datepicker *', picker.click);
                    picker.widget.off('click', '[data-action]');
                    picker.widget.off('mousedown', picker.stopEvent);
                    if (picker.options.pickDate && picker.options.pickTime) {
                        picker.widget.off('click.togglePicker');
                    }
                    if (picker.isInput) {
                        picker.element.off({
                            'focus': picker.show,
                            'change': change,
                            'click': picker.show,
                            'blur' : picker.hide
                        });
                    } else {
                        picker.element.off({
                            'change': change
                        }, 'input');
                        if (picker.component) {
                            picker.component.off('click', picker.show);
                            picker.component.off('mousedown', picker.stopEvent);
                        } else {
                            picker.element.off('click', picker.show);
                        }
                    }
                },

                detachDatePickerGlobalEvents = function () {
                    $(window).off('resize.datetimepicker' + picker.id);
                    if (!picker.isInput) {
                        $(document).off('mousedown.datetimepicker' + picker.id);
                    }
                },

                isInFixed = function () {
                    if (picker.element) {
                        var parents = picker.element.parents(), inFixed = false, i;
                        for (i = 0; i < parents.length; i++) {
                            if ($(parents[i]).css('position') === 'fixed') {
                                inFixed = true;
                                break;
                            }
                        }
                        return inFixed;
                    } else {
                        return false;
                    }
                },

                set = function () {
                    moment.locale(picker.options.language);
                    var formatted = '';
                    if (!picker.unset) {
                        formatted = moment(picker.date).format(picker.format);
                    }
                    getPickerInput().val(formatted);
                    picker.element.data('date', formatted);
                    if (!picker.options.pickTime) {
                        picker.hide();
                    }
                },

                checkDate = function (direction, unit, amount) {
                    moment.locale(picker.options.language);
                    var newDate;
                    if (direction === 'add') {
                        newDate = moment(picker.date);
                        if (newDate.hours() === 23) {
                            newDate.add(amount, unit);
                        }
                        newDate.add(amount, unit);
                    }
                    else {
                        newDate = moment(picker.date).subtract(amount, unit);
                    }
                    if (isInDisableDates(moment(newDate.subtract(amount, unit))) || isInDisableDates(newDate)) {
                        notifyError(newDate.format(picker.format));
                        return;
                    }

                    if (direction === 'add') {
                        picker.date.add(amount, unit);
                    }
                    else {
                        picker.date.subtract(amount, unit);
                    }
                    picker.unset = false;
                },

                isInDisableDates = function (date, timeUnit) {
                    moment.locale(picker.options.language);
                    var maxDate = moment(picker.options.maxDate, picker.format, picker.options.useStrict),
                        minDate = moment(picker.options.minDate, picker.format, picker.options.useStrict);

                    if (timeUnit) {
                        maxDate = maxDate.endOf(timeUnit);
                        minDate = minDate.startOf(timeUnit);
                    }

                    if (date.isAfter(maxDate) || date.isBefore(minDate)) {
                        return true;
                    }
                    if (picker.options.disabledDates === false) {
                        return false;
                    }
                    return picker.options.disabledDates[date.format('YYYY-MM-DD')] === true;
                },
                isInEnableDates = function (date) {
                    moment.locale(picker.options.language);
                    if (picker.options.enabledDates === false) {
                        return true;
                    }
                    return picker.options.enabledDates[date.format('YYYY-MM-DD')] === true;
                },

                indexGivenDates = function (givenDatesArray) {
                    // Store given enabledDates and disabledDates as keys.
                    // This way we can check their existence in O(1) time instead of looping through whole array.
                    // (for example: picker.options.enabledDates['2014-02-27'] === true)
                    var givenDatesIndexed = {}, givenDatesCount = 0, i;
                    for (i = 0; i < givenDatesArray.length; i++) {
                        if (moment.isMoment(givenDatesArray[i]) || givenDatesArray[i] instanceof Date) {
                            dDate = moment(givenDatesArray[i]);
                        } else {
                            dDate = moment(givenDatesArray[i], picker.format, picker.options.useStrict);
                        }
                        if (dDate.isValid()) {
                            givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                            givenDatesCount++;
                        }
                    }
                    if (givenDatesCount > 0) {
                        return givenDatesIndexed;
                    }
                    return false;
                },

                padLeft = function (string) {
                    string = string.toString();
                    if (string.length >= 2) {
                        return string;
                    }
                    return '0' + string;
                },

                dpGlobal = {
                    modes: [
                        {
                            clsName: 'days',
                            navFnc: 'month',
                            navStep: 1
                        },
                        {
                            clsName: 'months',
                            navFnc: 'year',
                            navStep: 1
                        },
                        {
                            clsName: 'years',
                            navFnc: 'year',
                            navStep: 10
                        }
                    ]
                },

                tpGlobal = {
                    hourTemplate: 
                    minuteTemplate: '',
                    secondTemplate: ''
                };

            tpGlobal.getTemplate = function () {
                return (
                    
                    );
            };

            picker.destroy = function () {
                detachDatePickerEvents();
                detachDatePickerGlobalEvents();
                picker.widget.remove();
                picker.element.removeData('DateTimePicker');
                if (picker.component) {
                    picker.component.removeData('DateTimePicker');
                }
            };

            picker.show = function (e) {
                if (getPickerInput().prop('disabled')) {
                    return;
                }
                if (picker.options.useCurrent) {
                    if (getPickerInput().val() === '') {
                        if (picker.options.minuteStepping !== 1) {
                            var mDate = moment(),
                                rInterval = picker.options.minuteStepping;
                            mDate.minutes((Math.round(mDate.minutes() / rInterval) * rInterval) % 60).seconds(0);
                            picker.setValue(mDate.format(picker.format));
                        } else {
                            picker.setValue(moment().format(picker.format));
                        }
                        notifyChange('', e.type);
                    }
                }
                // if this is a click event on the input field and picker is already open don't hide it
                if (e && e.type === 'click' && picker.isInput && picker.widget.hasClass('picker-open')) {
                    return;
                }
                if (picker.widget.hasClass('picker-open')) {
                    picker.widget.hide();
                    picker.widget.removeClass('picker-open');
                }
                else {
                    picker.widget.show();
                    picker.widget.addClass('picker-open');
                }
                picker.height = picker.component ? picker.component.outerHeight() : picker.element.outerHeight();
                place();
                picker.element.trigger({
                    type: 'dp.show',
                    date: moment(picker.date)
                });
                attachDatePickerGlobalEvents();
                if (e) {
                    stopEvent(e);
                }
            };

            picker.disable = function () {
                var input = getPickerInput();
                if (input.prop('disabled')) {
                    return;
                }
                input.prop('disabled', true);
                detachDatePickerEvents();
            };

            picker.enable = function () {
                var input = getPickerInput();
                if (!input.prop('disabled')) {
                    return;
                }
                input.prop('disabled', false);
                attachDatePickerEvents();
            };

            picker.hide = function () {
                // Ignore event if in the middle of a picker transition
                var collapse = picker.widget.find('.collapse'), i, collapseData;
                for (i = 0; i < collapse.length; i++) {
                    collapseData = collapse.eq(i).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        return;
                    }
                }
                picker.widget.hide();
                picker.widget.removeClass('picker-open');
                picker.viewMode = picker.startViewMode;
                showMode(picker);
                picker.element.trigger({
                    type: 'dp.hide',
                    date: moment(picker.date)
                });
                detachDatePickerGlobalEvents();
            };

            picker.setValue = function (newDate) {
                moment.locale(picker.options.language);
                if (!newDate) {
                    picker.unset = true;
                    set();
                } else {
                    picker.unset = false;
                }
                if (!moment.isMoment(newDate)) {
                    newDate = (newDate instanceof Date) ? moment(newDate) : moment(newDate, picker.format, picker.options.useStrict);
                } else {
                    newDate = newDate.locale(picker.options.language);
                }
                if (newDate.isValid()) {
                    picker.date = newDate;
                    set();
                    picker.viewDate = moment({y: picker.date.year(), M: picker.date.month()});
                    fillDate();
                    fillTime();
                }
                else {
                    notifyError(newDate);
                }
            };

            picker.getDate = function () {
                if (picker.unset) {
                    return null;
                }
                return moment(picker.date);
            };

            picker.setDate = function (date) {
                var oldDate = moment(picker.date);
                if (!date) {
                    picker.setValue(null);
                } else {
                    picker.setValue(date);
                }
                notifyChange(oldDate, 'function');
            };

            picker.setDisabledDates = function (dates) {
                picker.options.disabledDates = indexGivenDates(dates);
                if (picker.viewDate) {
                    update();
                }
            };

            picker.setEnabledDates = function (dates) {
                picker.options.enabledDates = indexGivenDates(dates);
                if (picker.viewDate) {
                    update();
                }
            };



            init();
        };

    $.fn.datetimepicker = function (options) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('DateTimePicker');
            if (!data) {
                $this.data('DateTimePicker', new DateTimePicker(this, options));
            }
        });
    };

    $.fn.datetimepicker.defaults = {
        format: false,
        pickDate: true,
        pickTime: true,
        useMinutes: true,
        useSeconds: false,
        useCurrent: true,
        calendarWeeks: false,
        minuteStepping: 1,
        minDate: moment({y: 1900}),
        maxDate: moment().add(100, 'y'),
        showToday: true,
        collapse: true,
        language: moment.locale(),
        defaultDate: '',
        disabledDates: false,
        enabledDates: false,
        icons: {},
        useStrict: false,
        direction: 'auto',
        sideBySide: false,
        daysOfWeekDisabled: [],
        widgetParent: false
    };
}));