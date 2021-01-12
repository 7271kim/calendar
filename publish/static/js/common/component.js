class DatePicker {
    static idx = 0;
    static weakMapPickers = new WeakMap();

    static datetimepicker( targetDom, inputOpts ){
        if ( typeof moment === 'undefined' || !moment ) {
            throw new Error('moment.js 가 필요합니다.');
        }
        if( targetDom && !DatePicker.weakMapPickers.get(targetDom) ){
            if(!DatePicker.weakMapPickers.get(targetDom)){
                const newDatePicker = new DatePicker( targetDom, inputOpts );
                DatePicker.weakMapPickers.set( targetDom, newDatePicker )
                return newDatePicker;
            } else {
                return DatePicker.weakMapPickers.get(targetDom);
            }
        } else {
            throw new Error('target이 잘못되었습니다.');
        }
    }

    constructor( targetDom, inputOpts ){
        const defaults = getDefaults();

        this.targetDom = targetDom;
        this.opts = { ...defaults, ...inputOpts };
        this.constant = {
            modes: [
                {
                    className: 'days',
                    navFnc: 'month',
                    navStep: 1
                },
                {
                    className: 'months',
                    navFnc: 'year',
                    navStep: 1
                },
                {
                    className: 'years',
                    navFnc: 'year',
                    navStep: 10
                }
            ]
        }
        this.init();

        function getDefaults(){
            return {
                showTimeOption : true,
                showDateOption : true,
                showMinutes : true,
                showSeconds : false,
                useToday : true,
                useTodayButton : true,
                defaultDate : moment(),
                language : 'ko',
                direction : 'auto',
                minViewMode : '',
                viewMode : '',
                disabledDates : [],
                minDate : '',
                maxDate : '',
                format : '',
                stepInterval : 5,
                icons : {
                    time: 'glyphicon glyphicon-time',
                    date: 'glyphicon glyphicon-calendar',
                    up: 'glyphicon glyphicon-chevron-up',
                    down: 'glyphicon glyphicon-chevron-down',
                    previous: 'glyphicon glyphicon-chevron-left',
                    next: 'glyphicon glyphicon-chevron-right',
                    today: 'glyphicon glyphicon-screenshot',
                    clear: 'glyphicon glyphicon-trash',
                    close: 'glyphicon glyphicon-remove'
                }
            }
        }
    }
    
    init(){

        const picker = this;

        if (!( picker.opts.showTimeOption || picker.opts.showDateOption ) ) {
            throw new Error( 'showTimeOption 옵션, showDateOption 옵션 둘 중에 하나는 true 여야 합니다.' );
        }

        settingMomentData( picker );
        settingTemplate(picker);
        settingDisabledDates( picker );
        settingViewMode( picker );
        picker.opts.minDate = changeMoment( picker, picker.opts.minDate );
        picker.opts.maxDate = changeMoment( picker, picker.opts.maxDate );
        drawDayOfTheWeek( picker );
        drawMonths( picker );
        drawHours( picker );
        drawMinutes( picker );
        drawSeconds( picker );
        updateDate( picker );
        
        function updateDate ( picker, newDate ){
            let initDate = picker.date;
            if( newDate ){
                initDate = newDate;
            }
            initDate = changeMoment( picker, initDate);
            picker.date = initDate;
            picker.viewDate = moment(initDate).startOf('month'); // 선택 했을 때를 위한 요일.

            removeClass( picker.widget.querySelectorAll('.datepicker-days .disabled'), 'disabled' );
            removeClass( picker.widget.querySelectorAll('.datepicker-months .disabled'), 'disabled' );
            removeClass( picker.widget.querySelectorAll('.datepicker-years .disabled'), 'disabled' );

            drawDate( picker );
            drawTime( picker );

            showMode(picker);
            attachEvents( picker );
        }

        function attachEvents ( picker ){
            const allTargete =  picker.widget.querySelectorAll('.datepicker *').forEach((target)=>{
                target.addEventListener('click' , clickEvent.bind(picker) );
            });
        }

        function clickEvent( event ){
            event.stopPropagation();
            event.preventDefault();
            const target = event.target.closest('span, td, th');

            if( target && !target.classList.contains('disabled') ){
                switch (target.nodeName.toLowerCase()) {
                    case 'th':
                        switch (target.className) {
                            case 'picker-switch':
                                showMode(picker, 1);
                                break;
                            case 'prev':
                            case 'next':
                                let step = picker.constant.modes[picker.viewMode].navStep;
                                if (target.className === 'prev') {
                                    step = step * -1;
                                }
                                picker.viewDate.add(step, picker.constant.modes[picker.viewMode].navFnc);
                                drawDate(picker);
                                break;
                        }
                        break;
                    case 'span':
                        if ( target.classList.contains('month') ) {
                            //월 
                            const month = [].indexOf.call(target.parentElement.querySelectorAll('span'), target);
                            picker.viewDate.month(month);
                        } else {
                            // 년 클릭시 
                            const year = parseInt(target.textContent, 10) || 0;
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
                            //set();
                            //notifyChange(oldDate, e.type);
                        }
                        showMode(picker,-1);
                        drawDate(picker);
                        break;
                }
            }
            
        }
        
        function showMode( picker, input ){
            if (input) {
                picker.viewMode = Math.max(picker.minViewMode, Math.min(2, picker.viewMode + input));
            }
            const target  = picker.widget.querySelectorAll('.datepicker > div');
            const showTarget  = picker.widget.querySelector(`.datepicker-${picker.constant.modes[picker.viewMode].className}`);

            for( const item of target ){
                const classList = item.classList;

                if( !classList.contains('hide') ){
                    classList.add('hide');
                }
            }
            showTarget.classList.remove('hide');
        }

        function drawTime( picker ){
            if( !picker.date ){
                return;
            }
            const targetTime  = picker.widget.querySelectorAll('.timepicker span[data-time-component]');
            const targetPeriod = picker.widget.querySelector('.timepicker [data-action=togglePeriod]');
            const period = picker.date.format('A');
            let hour = picker.date.hour();

            if( !picker.use24hours ){
                if( hour === 0 ){
                    hour = 12;
                } else if( hour !== 12 ){
                    hour %= 12;
                }

                targetPeriod.textContent = period;
            }
            for( const item of targetTime ){
                let textInner = '';
                if( item.dataset['timeComponent'] === 'hours'){
                    textInner = padLeft(hour);
                } else if ( item.dataset['timeComponent'] === 'minutes' ){
                    textInner = padLeft(picker.viewDate.minutes());
                } else if ( item.dataset['timeComponent'] === 'seconds' ){
                    textInner = padLeft(picker.viewDate.second());
                }

                item.textContent = textInner;
            }
        }

        function drawDate( picker ){
            drawDateInMode( picker );
            drawMonthsInMode(picker);
            drawYearsInMode(picker);
        }

        function drawYearsInMode(picker){
            const currentYear = picker.date.year();
            const startYear = picker.opts.minDate.year();
            const endYear = picker.opts.maxDate.year();
            const targetYearTh = picker.widget.querySelectorAll('.datepicker-years th');
            const yearText = picker.widget.querySelector('.datepicker-years table td');
            yearText.innerHTML='';
            let year = parseInt(picker.viewDate.year()/10)*10;

            targetYearTh[1].textContent = `${year} - ${year+9}`;

            if (startYear > year) {
                addClass( targetYearTh[0], 'disabled' ); // 화살표 회색부분 diabled
            }
            if (endYear < year + 9) {
                addClass( targetYearTh[2], 'disabled' ); // 화살표 회색부분 diabled
            }

            year--;

            for ( let i = -1; i < 11; i++ ) {
                const tempSpan = document.createElement('span');
                const className = ['year'];
                if( i == -1 || i === 10 ){
                    className.push('old');
                }

                if( year === currentYear ){
                    className.push('active');
                }

                if ( (year < startYear || year > endYear )) {
                    className.push('disabled');
                }

                tempSpan.setAttribute('class',`${className.join(' ')}`);
                tempSpan.textContent = year;
                year++;
                yearText.appendChild(tempSpan);
            }
        }

        function drawMonthsInMode(picker){
            const year = picker.viewDate.year();
            const month = picker.viewDate.month();
            const startYear = picker.opts.minDate.year();
            const startMonth = picker.opts.minDate.month();
            const endYear = picker.opts.maxDate.year();
            const endMonth = picker.opts.maxDate.month();
            const months = moment.months();
            const targetMonthTh = picker.widget.querySelectorAll('.datepicker-months th');
            const monthText = picker.widget.querySelectorAll('.datepicker-months span');


            targetMonthTh[1].textContent = `${year}`;
            removeClass( monthText, 'active' );

            if (year - 1 < startYear) {
                addClass( targetMonthTh[0], 'disabled' ); // 화살표 회색부분 diabled
            }
            if (year + 1 > endYear) {
                addClass( targetMonthTh[2], 'disabled' ); // 화살표 회색부분 diabled
            }

            for (let i = 0; i < 12; i++) {
                if ( month === i ) {
                    addClass( monthText[i], 'active' );
                }
                if ((year === startYear && startMonth > i) || (year < startYear)) {
                    addClass( monthText[i], 'disabled' );
                } else if ((year === endYear && endMonth < i) || (year > endYear)) {
                    addClass( monthText[i], 'disabled' );
                }
            }
        }

       

        function drawDateInMode( picker ){
            if( picker.opts.showDateOption ){
                const year = picker.viewDate.year();
                const month = picker.viewDate.month();
                const startYear = picker.opts.minDate.year();
                const startMonth = picker.opts.minDate.month();
                const endYear = picker.opts.maxDate.year();
                const endMonth = picker.opts.maxDate.month();
                const months = moment.months();
                const targetDaysTh = picker.widget.querySelectorAll('.datepicker-days th');
                targetDaysTh[1].textContent = `${year} ${months[month]}`;

                const prevMonth = changeMoment( picker, picker.viewDate).subtract(1,'months');
                prevMonth.date(prevMonth.daysInMonth()).startOf('week'); // 그 달의 마지막 주의 첫째 요일로 세팅

                if ((year === startYear && month <= startMonth) || year < startYear) {
                    // 날에 나오는 왼쪽 화살표가 회식이 되어야 하는 로직
                    // 현재 달이 제한 달보다 작거나 같을 경우 단
                    // 년이 넘어가는 경우도 있어서 현재 년이 제한 년도보다 작을 경우
                    addClass( targetDaysTh[0], 'disabled' ); // 화살표 회색부분 diabled
                }
                if ((year === endYear && month >= endMonth) || year > endYear) {
                    addClass( targetDaysTh[2], 'disabled' ); // 화살표 회색부분 diabled
                }


                const nextMonth = changeMoment( picker, prevMonth).add(42, 'd'); // 달력상 42일 추가한 요일로 nextMonth 세팅.
                const tempDayDom = document.createElement('div');
                let tempTr;
                while (prevMonth.isBefore(nextMonth)) {
                    // prevMonth를 증가시키면서 날짜 채워가는 로직 
                    if (prevMonth.weekday() === moment().startOf('week').weekday()) {
                        tempTr = document.createElement('tr');
                    }
                    const className = ['day'];

                    if (prevMonth.year() < year || (prevMonth.year() === year && prevMonth.month() < month)) {
                        // old 조건. 전년의 요일( 월은 전년이 더 커버림), 같은년 일 때 전달의 요일일 시 
                        className.push('old');
                    } else if (prevMonth.year() > year || (prevMonth.year() === year && prevMonth.month() > month)) {
                        // new 조건. 내년의 요일. 같은년 일 때  다음달의 요일일 시 
                        className.push('new');
                    }
                    if (prevMonth.isSame(moment({y: picker.date.year(), M: picker.date.month(), d: picker.date.date()}))) {
                        // 선택한 날일 시 
                        className.push('active');
                    }
                    if ( isInDisableDates(picker, prevMonth) ) {
                        // disabled 조건
                        className.push('disabled');
                    }
                    if (picker.opts.useToday === true) {
                        if (prevMonth.isSame(moment(), 'day')) {
                            className.push('today');
                        }
                    }
                    const tempTd = document.createElement('td');
                    tempTd.setAttribute('class',`${className.join(' ')}`);
                    tempTd.textContent = prevMonth.date();
                    tempTr.appendChild( tempTd );

                    prevMonth.add(1, 'd');

                    if (prevMonth.weekday() === moment().endOf('week').weekday()) {
                        tempDayDom.appendChild(tempTr);
                    }
                }

                const targetDayTextDom = picker.widget.querySelector('.datepicker-days tbody');
                targetDayTextDom.textContent = '';
                atoBMoveChilden( targetDayTextDom, tempDayDom );
            }
        }

        function isInDisableDates( picker, inputDate ){
            const minDate = changeMoment( picker, picker.opts.minDate ).startOf('day'); // 그날의 시작 시로 변경.
            const maxDate = changeMoment( picker, picker.opts.maxDate).endOf('day'); // 그날의 마지막 시간으로 변경

            if (inputDate.isAfter(maxDate) || inputDate.isBefore(minDate)) {
                return true;
            }

            return  picker.opts.disabledDates && picker.opts.disabledDates[ changeMoment(picker, inputDate) ] === true;

        }

        function addClass( node, className ){
            if( node && node.length != 0 ){
                if( node.length > 1 ){
                    for ( const childNode of node ){
                        childNode.classList.add(className);
                    }
                } else {
                    node.classList.add(className);
                }
                
            }
        }

        function removeClass( node, className ){
            if( node && node.length != 0 ){
                if( node.length > 1 ){
                    for ( const childNode of node ){
                        childNode.classList.remove(className);
                    }
                } else {
                    node.classList.remove(className);
                }
                
            }
        }

        function drawSeconds( picker ){
            const table = picker.widget.querySelector('.timepicker .timepicker-seconds table');
            const step = picker.opts.stepInterval;
            let current = 0;

            if(table){
                table.parentElement.classList.add('hide');

                for (let i = 0; i < Math.ceil(60 / step / 4) ; i++) {
                    const tempTr = document.createElement('tr');
                    for (let j = 0; j < 4; j++ ) {
                        const tempTd = document.createElement('td');
                        tempTd.setAttribute('class','second');
                        tempTd.textContent = padLeft(current.toString());
                        tempTr.appendChild(tempTd);
                        current += step;
                    }
                    table.appendChild(tempTr);
                }
            }
        }

        function drawMinutes ( picker ){
            const table = picker.widget.querySelector('.timepicker .timepicker-minutes table');
            const step = picker.opts.stepInterval;
            let current = 0;

            if(table ){
                table.parentElement.classList.add('hide');

                for (let i = 0; i < Math.ceil(60 / step / 4) ; i++) {
                    const tempTr = document.createElement('tr');

                    for (let j = 0; j < 4; j++) {
                        if ( current < 60 ) {
                            const tempTd = document.createElement('td');
                            tempTd.setAttribute('class','minute');
                            tempTd.textContent = padLeft(current.toString());
                            tempTr.appendChild(tempTd);
                            current += step;
                        } else {
                            const tempTd = document.createElement('td');
                            tempTr.appendChild(tempTd);
                        }
                    }
                    table.appendChild(tempTr);
                }
            }
        }

        function drawHours( picker ){
            const monthsShort = moment.monthsShort();
            const table = picker.widget.querySelector('.timepicker .timepicker-hours table');
            let current;

            if( table ){
                table.parentElement.classList.add('hide');

                if ( picker.use24hours ) {
                    current = 0;
                    for (let i = 0; i < 6; i ++ ) {
                        const tempTr = document.createElement('tr');
                        for (j = 0; j < 4; j++ ) {
                            const tempTd = document.createElement('td');
                            tempTd.setAttribute('class','hour');
                            tempTd.textContent = padLeft(current.toString());
                            current++;
                            tempTr.appendChild(tempTd);
                        }
                        table.appendChild(tempTr);
                    }
                } else {
                    current = 1;
                    for (let i = 0; i < 3; i++) {
                        const tempTr = document.createElement('tr');
                        for (let j = 0; j < 4; j++ ) {

                            const tempTd = document.createElement('td');
                            tempTd.setAttribute('class','hour');
                            tempTd.textContent = padLeft(current.toString());
                            current++;
                            tempTr.appendChild(tempTd);
                        }
                        table.appendChild(tempTr);
                    }
                }
            }
        }

        function padLeft (string) {
            string = string.toString();
            if (string.length >= 2) {
                return string;
            }
            return '0' + string;
        }

        function drawMonths( picker ){
            const monthsShort = moment.monthsShort();
            const tempDom = document.createElement('div');

            for (let i = 0; i < 12; i++) {
                const tempDomSpan = document.createElement('span');
                tempDomSpan.setAttribute('class','month');
                tempDomSpan.textContent = monthsShort[i];
                tempDom.appendChild(tempDomSpan);
            }

            const widgetTarget = picker.widget.querySelector('.datepicker-months td');
            
            if( widgetTarget ){
                atoBMoveChilden( widgetTarget, tempDom );
            }
        }

        function atoBMoveChilden( targetNode, removeNode ){
            if( removeNode ){
                while( removeNode.childNodes.length > 0 ){
                    targetNode.appendChild(removeNode.childNodes[0]);
                }
            }
        }

        function drawDayOfTheWeek( picker ){
            const tempDom = document.createElement('tr');
            const weekdaysMin = moment.weekdaysMin();

            if (moment().localeData()._week.dow === 0) { // starts on Sunday
                for (let i = 0; i < 7; i++) {
                    const tempDomTh = document.createElement('th');
                    tempDomTh.setAttribute('class','dow');
                    tempDomTh.textContent = weekdaysMin[i];
                    tempDom.appendChild(tempDomTh);
                }
            } else {
                for ( let i = 1; i < 8; i++) {
                    const tempDomTh = document.createElement('th');
                    tempDomTh.setAttribute('class','dow');

                    if (i === 7) {
                        tempDomTh.textContent = weekdaysMin[0];
                    } else {
                        tempDomTh.textContent = weekdaysMin[i];
                    }

                    tempDom.appendChild(tempDomTh);
                }
            }

            const widgetTarget = picker.widget.querySelector('.datepicker-days thead');
            if( widgetTarget ){
                widgetTarget.appendChild(tempDom);
            }
        }

        function settingViewMode( picker ){
            picker.minViewMode = picker.opts.minViewMode || 0;
            if (typeof picker.minViewMode === 'string') {
                switch (picker.minViewMode) {
                    case 'months':
                        picker.minViewMode = 1;
                        break;
                    case 'years':
                        picker.minViewMode = 2;
                        break;
                    default:
                        picker.minViewMode = 0;
                        break;
                }
            }

            picker.viewMode = picker.opts.viewMode || 0;
            if (typeof picker.viewMode === 'string') {
                switch (picker.viewMode) {
                    case 'months':
                        picker.viewMode = 1;
                        break;
                    case 'years':
                        picker.viewMode = 2;
                        break;
                    default:
                        picker.viewMode = 0;
                        break;
                }
            }
            picker.viewMode = Math.max(picker.viewMode, picker.minViewMode);
            picker.startViewMode = picker.viewMode;
        }


        function changeMoment( picker, date ){
            if (date === undefined) {
                return;
            }
            if (moment.isMoment(date) || date instanceof Date) {
                return moment(date);
            } else {
                return moment(date, picker.format );
            }
        }

        function settingDisabledDates( picker ){
            
            let result = {};

            picker.opts.disabledDates.map( ( day, index ) =>{
                let temp;
                if( moment.isMoment(day) || day instanceof Date ){
                    temp =  moment(day);
                } else {
                    temp = moment(day, picker.format);
                }

                if( temp.isValid() ){
                    result[temp] = true;
                } else {
                    result[day] = false;
                }
            })

            picker.opts.disabledDates = result;
        }

        function settingTemplate( picker ){
            picker.opts.widgetParent =  document.getElementsByTagName('body')[0];
            picker.widget = getTemplate(picker);

            picker.opts.widgetParent.appendChild(picker.widget);
        };

        function getTimeTemplate( picker ){
            const useMinutesTemplate = picker.opts.showMinutes ? `
                <td>
                    <a href="#" class="btn" data-action="incrementMinutes">
                        <span class="${picker.opts.icons.up}"></span>
                    </a>
                </td>` : '';

            const useSecondsTempalte = picker.opts.showSeconds ? `
                <td class="separator"></td>
                <td>
                    <a href="#" class="btn" data-action="incrementSeconds">
                        <span class="${picker.opts.icons.up}"></span>
                    </a>
                </td>` : '';

            const use24hoursTemplate = !picker.use24hours ? `
                <td class="separator"></td>` : '';

            const minuteTemplate =  picker.opts.showMinutes? `
                <span data-action="showMinutes" data-time-component="minutes" class="timepicker-minute"></span>
            ` : `<span class="timepicker-minute">00</span>`;
            
            const secondsTemplate = picker.opts.showSeconds ? `
                <td class="separator">:</td>
                <td>
                    <span data-action="showSeconds"  data-time-component="seconds" class="timepicker-second"></span>
                </td>` :''

            const use24hoursTemplate2 = !picker.use24hours ? `
               ${use24hoursTemplate} 
                <td>
                    <button type="button" class="btn btn-primary" data-action="togglePeriod"></button>
                </td>` : '';

            const secondsTemplate2 = picker.opts.showSeconds ? `
                <td class="separator"></td>
                <td>
                    <a href="#" class="btn" data-action="decrementSeconds">
                        <span class="${picker.opts.icons.down}"></span>
                    </a>
                </td>
                ${use24hoursTemplate}` :'';

            const secondsTemplate3 = picker.opts.showSeconds ? `
                <div class="timepicker-seconds" data-action="selectSecond">
                    <table class="table-condensed"></table>
                </div>` :'';

            const timeTemplate = `
                <div class="timepicker-picker">
                    <table class="table-condensed">
                        <tr>
                            <td>
                                <a href="#" class="btn" data-action="incrementHours">
                                    <span class="${picker.opts.icons.up}"></span>
                                </a>
                            </td>
                            <td class="separator"></td>
                            ${useMinutesTemplate}
                            ${useSecondsTempalte}
                            ${use24hoursTemplate}
                        </tr>
                        <tr>
                            <td>
                                <span data-action="showHours" data-time-component="hours" class="timepicker-hour"></span>
                            </td>
                            <td class="separator">:</td>
                            <td>${minuteTemplate}</td>
                            ${secondsTemplate}
                            ${use24hoursTemplate2}
                        </tr>
                        <tr>
                            <td>
                                <a href="#" class="btn" data-action="decrementHours">
                                    <span class="${picker.opts.icons.down}"></span>
                                </a>
                            </td>
                            <td class="separator"></td>
                            <td> 
                                ${picker.opts.showMinutes ? '<a href="#" class="btn" data-action="decrementMinutes"><span class="' + picker.opts.icons.down + '"></span></a>' : ''}
                            </td>
                            ${secondsTemplate2}
                        </tr>
                    </table>
                </div>
                <div class="timepicker-hours" data-action="selectHour">
                    <table class="table-condensed"></table>
                </div>
                <div class="timepicker-minutes" data-action="selectMinute">
                    <table class="table-condensed"></table>
                </div>
                ${secondsTemplate3}
            `;

            return timeTemplate;
        };

        function getTemplate( picker ){
            const tempParent = document.createElement('div');
            const headTemplate = `
                <thead>
                    <tr>
                        <th class="prev">
                            <div class="${picker.opts.icons.previous}"></div>
                        </th>
                        <th colspan="" class="picker-switch"></th>
                        <th class="next"><div class="${picker.opts.icons.next}"></div></th>
                    </tr>
                </thead>
            `;

            const contentTemplate =`
                <tbody>
                    <tr>
                        <td colspan="7"></td>
                    </tr>
                </tbody>
            `;

            const todayButton = picker.opts.useTodayButton ? `<a class="btn ${picker.opts.icons.today}" style="width:100%"></a>` : '';

            const timeTemplate = getTimeTemplate( picker );
            let templateText = '';
            if( !picker.opts.showDateOption && picker.opts.showTimeOption  ){
                templateText =  `
                    <div class="dropdown-menu datetimepicker-widget hidden">
                        <div class="timepicker">
                            ${timeTemplate}
                        </div>
                    </div>
                `
            } else {
                templateText = `
                    <div class="dropdown-menu datetimepicker-widget ${picker.use24hours ? 'usetwentyfour' : ''}">
                        <ul>
                            <li class="collapse in" >
                                <div class="datepicker">
                                    <div class="datepicker-days">
                                        <table class="table-condensed">
                                            ${headTemplate}
                                            <tbody></tbody>
                                        </table>
                                    </div>
                                    <div class="datepicker-months">
                                        <table class="table-condensed"> 
                                            ${headTemplate} 
                                            ${contentTemplate}
                                        </table>
                                    </div>
                                    <div class="datepicker-years">
                                        <table class="table-condensed"> 
                                            ${headTemplate} 
                                            ${contentTemplate}
                                        </table>
                                    </div>
                                </div>
                            </li>
                            <li class="picker-switch accordion-toggle">
                                ${todayButton}
                            </li>
                            ${ picker.opts.showTimeOption ? `
                                <li class="collapse">
                                    <div class="timepicker">
                                        ${timeTemplate}
                                    <div>
                                </li>` : ''}
                        </ul>
                    <div> `;
            }

            tempParent.innerHTML= templateText ;
            return tempParent.getElementsByClassName('datetimepicker-widget')[0];
        }

        function settingMomentData( picker ){
            moment.locale(picker.opts.language);
            picker.opts.defaultDate = changeMoment ( picker, picker.opts.defaultDate ); // 초기화 버튼을 위한 값.
            picker.date = changeMoment ( picker, picker.opts.defaultDate ); // 현재 선택된 날짜.
            picker.format = picker.opts.format;
            
            const localeData = moment().localeData();

            if (!picker.format) {
                picker.format = picker.opts.showDateOption ? localeData.longDateFormat('L') : '';
                
                if (picker.opts.showDateOption && picker.opts.showTimeOption) {
                    picker.format += ' ';
                }

                picker.format += picker.opts.showTimeOption ? localeData.longDateFormat('LT') : '';
                
                if ( picker.opts.showSeconds ) {
                    if ( localeData.longDateFormat('LT').indexOf(' A') !== -1 ) {
                        picker.format = picker.format.split(' A')[0] + ':ss A';
                    } else {
                        picker.format += ':ss';
                    }
                }
            }
            picker.use24hours = picker.format.toLowerCase().indexOf('a') < 0 && picker.format.indexOf('h') < 0;
        }
    }
}



export {DatePicker};

/**
 * 1. StringUtils
 *  - defaultIfBlank( input string값, 디폴트 값 ) : input이 null일 시 원하는 디폴트 값 세팅
 * 
 * 2. ObjectUtils
 * - isEmpty ( object ) : 객체가 빈 객체인지 확인
 * - isNotEmpty ( object ) : 객체가 빈 객체인지 확인
 * 
 * 3. ArrayUtils
 * - isNotEmpty ( 배열 ) : 배열이 빈 배열인지 확인 
 * 
 * 4. NodeUtils
 * - removeOnlyCurrentNode( currentNode ) : DOM 노드 중 현재 자신 노드만 제거. 즉 parent <-> 자기자식 연결.
 * - AtoBMoveChilden( targetNode, removeNode ) : removeNode의 자식들을 targetNode에 추가 
 * - removeAllChilden( currentNode ) : 현재 자기 노드의 모든 자식 노드 제거
 * - hasClass( node ) : 특정 노트에 class 존재하는지 확인
 */

class StringUtils {
    static defaultIfBlank( string, defaultStr ){
        let result = string;
        
        if( typeof string === 'number' ){
            result = parseInt(string);
        } else if( typeof string === 'undefined' || string === null ){
            result = defaultStr;
        }

        return result;
    }
}

class ObjectUtils {
    static isEmpty( obj ){
        return Object.keys(obj).length === 0;
    }

    static isNotEmpty( obj ){
        return Object.keys(obj).length !== 0;
    }
}

class ArrayUtils {
    static isNotEmpty( array ){
        return array && array.length > 0;
    }
}

class NodeUtils {
    static removeOnlyCurrentNode( currentNode ){
        const parentNode = currentNode.parentNode;
        
        while( currentNode.childNodes.length > 0  ){
            const child = currentNode.childNodes[0];
            parentNode.insertBefore( child, currentNode);
        }
        parentNode.removeChild( currentNode );
    }

    static AtoBMoveChilden( targetNode, removeNode ){
        if( removeNode ){
            while( removeNode.childNodes.length > 0 ){
                targetNode.appendChild(removeNode.childNodes[0]);
            }
        }
    }

    static removeAllChilden( currentNode ){
        if( currentNode && currentNode.childNodes.length > 0 ){
            while( currentNode.childNodes.length > 0 ){
                currentNode.removeChild(currentNode.childNodes[0]);
            }
        }
    }
}

class Stack {

    constructor(){
        this.top =-1;
        this.stackAttay = [];
    }

    push ( input ){
        this.top++;
        this.stackAttay.push(input);
    }

    pop(){
        this.top--;
        return this.stackAttay.pop();
    }

    peak(){
        if( this.isEmpty() ){
            throw new Error('stack이 비었습니다.');
        } else {
            return this.stackAttay[this.top];
        }
    }

    isEmpty(){
        return this.top == -1;
    }

}

/**
 * Calculator.cal('2*4') : String input 계산기
 */
class Calculator {
    static postfix( inputString ){
        let result = [inputString];
        const split = Calculator.splitText ( inputString );
    
        if( split.length > 0 ){
                const stack = new Stack();
                const lowData = inputString.replace(/ /g,'');
                let temp = [];
                const operatorSet = {
                    '*' : 5,
                    '%' : 5,
                    '/' : 5,
                    '+' : 4,
                    '-' : 4,
                    '&&' : 3,
                    '||' : 3,
                    '==' : 3,
                    '<=' : 3,
                    '>=' : 3,
                    '<' : 3,
                    '>' : 3
                };
                for( const oneText of split ){
                    if( oneText === "(" ){
                        stack.push(oneText);
                    } else if(oneText === ")") {
                        let popData = stack.pop();
                        while( popData !== "(" ){
                            temp.push(popData);
                            popData = stack.pop();
                        }
                    } else if( operatorSet.hasOwnProperty(oneText) ){
                        if( stack.isEmpty() ){
                            stack.push(oneText);
                        } else {
                            while( !stack.isEmpty()  && operatorSet[stack.peak()] >= operatorSet[oneText]){
                                temp.push(stack.pop());
                            }
                            stack.push(oneText);
                        }
                    } else {
                        temp.push(oneText);
                    }
                }
                
                while( !stack.isEmpty() ){
                    temp.push(stack.pop());
                }
    
                result = temp;
            }
    
            return result;
        }

        static cal( inputString ){
        const postfixData = Calculator.postfix( inputString );
        return Calculator.calPost( postfixData );
    }
    
    static calPost( postfixData ){
        let result = postfixData[0];
    
        if( postfixData && postfixData.length ){
            const stack = new Stack();
            const operatorSet = {
                '*' : function (x, y) { return parseInt(x) * parseInt(y) },
                '%' : function (x, y) { return parseInt(x) % parseInt(y) },
                '/' : function (x, y) { return parseInt(x) / parseInt(y) },
                '+' : function (x, y) { return parseInt(x) + parseInt(y) },
                '-' : function (x, y) { return parseInt(x) - parseInt(y) },
                '&&' : function (x, y) { return x && y },
                '||' : function (x, y) { return x || y },
                '==' : function (x, y) { return x == y },
                '<=' : function (x, y) { return parseInt(y) <= arseInt(x) },
                '>=' : function (x, y) { return parseInt(y) >= parseInt(x) },
                '>' : function (x, y) { return parseInt(y) > parseInt(x) },
                '<' : function (x, y) { return parseInt(y) < parseInt(x) }
            };
            
            for( const item of postfixData ){
                if( operatorSet.hasOwnProperty(item) ){
                    const first = stack.pop();
                    const second = stack.pop();
                    stack.push( operatorSet[item](first,second) )
                } else {
                    stack.push(item);
                }
            }
    
            result = stack.pop();
    
        }
    
        return result;
    }

    static splitText ( inputString ){
        let resut = [];
        if( inputString ){
            
            const lowData = inputString.replace(/ /g,'').replace( /([*%\/+\-()]|==|<=|>=|>|<|&&|\|\|)/g, ( matchString, innerText , offset, fullText )=>{
                if( innerText ){
                    return ' '+innerText+' ';
                } else {
                    return innerText;
                }
            }).replace(/  /g,' ').trim();
    
            resut = lowData.split(' ');
    
        }
    
        return resut;
    }
}

class JTemplate {
    static sharedObj = {
        'COMPONENT_CLASS' : 'jtemplates',
        'COMPONENT_NAME' : 'data-jly-componentName',
        'COMPONENT_TEMPLATE' : 'data-jly-template',
        'COMPONENT_TEST' : 'data-jly-test',
        'COMPONENT_ATTRIBUTE' : 'data-jly-attribute',
        'COMPONENT_TEXT' : 'data-jly-text',
        'COMPONENT_LIST' : 'data-jly-list',
        'COMPONENT_REAPEAT' : 'data-jly-reapeat',
        'COMPONENT_VAR' : 'data-jly-var',
        'COMPONENT_INJECTION' : 'data-jly-injection',
        'component' : {}
    }
    
    constructor( componentName ){
        this.componentName = componentName;
        this.templates = JTemplate.sharedObj.component[componentName] || {};
    }

    injectModel( targetDom, templateName , drawObj ){
        const childrenDom = parsingChildrenDom( this, templateName , drawObj );
        if(  ArrayUtils.isNotEmpty( targetDom )){
            for( const dom of targetDom ){
                const cloneChildrenDom = childrenDom.cloneNode(true);
                dom.parentNode.replaceChild( cloneChildrenDom.childNodes[0] ,dom );
            }
        } else {
            throw new Error(`injectModel을 하기 위한 targetDom이 없습니다. injectModel 파라메터를 확인하세요`);
        }

    }

    static HTMLWrapperparsing( componentName ){
        const templates = document.getElementsByClassName(JTemplate.sharedObj.COMPONENT_CLASS);
        const sharedObj = JTemplate.sharedObj;

        while ( templates.length > 0 ){
            const templateSection  = templates[0];
            const parentNode = templateSection.parentElement;
            let htmlComponentName = StringUtils.defaultIfBlank(templateSection.getAttribute(sharedObj.COMPONENT_NAME), '').trim();
            
            errCheck( htmlComponentName, sharedObj.component, sharedObj.COMPONENT_NAME );
            
            const  targetComponent = sharedObj.component[htmlComponentName] = {};
            const children = templateSection.children;
            
            for( const child of children ){
                const templatePatternName = StringUtils.defaultIfBlank(child.getAttribute( sharedObj.COMPONENT_TEMPLATE )).trim();
                const patternData  = getPatternData( templatePatternName );
                const templateName = patternData[0];

                errCheck( templateName, targetComponent, sharedObj.COMPONENT_TEMPLATE );

                targetComponent[templateName] = {
                    'HTML' : child
                }
            }
            parentNode.removeChild( templateSection )
        }

        return new JTemplate( componentName );
    }
}

function settingVar( currentNode, drawObj, variable, indexList, currentAttrNames ){
    if( indexList !== -1 ){
        for( const index of indexList ){
            const attrDotName = currentAttrNames[index];
            const dotSplitName = dotSplit( attrDotName );
            const attrName = dotSplitName[0];
            const attrValue = currentNode.getAttribute(attrDotName);

            if( attrValue ){
                const patternData = getPatternData( attrValue, variable );
                if(!dotSplitName[1]){
                    throw new Error(`${sharedObj.COMPONENT_VAR}.{변수이름} 형태가 되어야 합니다.`)
                }
                variable[dotSplitName[1]] = patternData[0];
            }

            currentNode.removeAttribute(attrDotName);
        }
    }
}

function settingAttr( currentNode, drawObj, variable, index, currentAttrNames ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);

        if( attrValue ){
            const patternData = getPatternData( attrValue, variable )[0];
            for( const key in patternData ){
                currentNode.setAttribute( key, patternData[key] );
            }
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function parsingChildrenDom( classObj, templateName , drawObj ){

    const template = classObj.templates[templateName];
    if( templateName && template ){
        const parseDom = template.HTML;
        const parentDom = document.createElement('div');
        parentDom.appendChild( parseDom.cloneNode(true) );
        recursionChild( parentDom, drawObj, {}, classObj );

        return parentDom;

    } else {
        throw new Error(`templateName이 잘못됐습니다. ${templateName}을 확인하세요`);
    }
};

function recursionChild( currentNode, drawObj, variable, classObj ){
    changeCurrentNodeToTemplateData( currentNode, drawObj, variable, classObj );
    const childNodes = currentNode.childNodes;
    if( childNodes && childNodes.length > 0  ){
        for( const child of childNodes ){
            const variClone = {...variable};
            recursionChild( child, drawObj, variClone, classObj );
        }
    }
    
    if( currentNode.nodeName.indexOf("JLY") >-1 ){
        NodeUtils.removeOnlyCurrentNode(currentNode);
    }
    
}

function changeCurrentNodeToTemplateData ( currentNode, drawObj, variable, classObj ){
    if( currentNode.nodeType === 1 ){
        const sharedObj = JTemplate.sharedObj;
        const currentAttrNames = currentNode.getAttributeNames();
        const checkingAttr = [];
        const compNameIndex = {
            [sharedObj.COMPONENT_TEMPLATE] : -1,
            [sharedObj.COMPONENT_VAR] : -1,
            [sharedObj.COMPONENT_TEST] : -1,
            [sharedObj.COMPONENT_ATTRIBUTE] : -1,
            [sharedObj.COMPONENT_TEXT] : -1,
            [sharedObj.COMPONENT_LIST] : -1,
            [sharedObj.COMPONENT_REAPEAT] : -1,
            [sharedObj.COMPONENT_INJECTION] : -1
        }
        
        checkingCurrentAttr ( checkingAttr, compNameIndex, currentAttrNames, currentNode );
        settingTemplate( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_TEMPLATE], currentAttrNames );

        let goNext = settingTest( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_TEST], currentAttrNames );

        if( goNext ){
            settingVar( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_VAR], currentAttrNames );
            settingAttr( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_ATTRIBUTE], currentAttrNames );
            settingList( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_LIST], currentAttrNames, classObj );
            settingReapeat( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_REAPEAT], currentAttrNames, classObj);
            settingText( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_TEXT], currentAttrNames );
            settingInjection( currentNode, drawObj, variable, compNameIndex[sharedObj.COMPONENT_INJECTION], currentAttrNames, classObj );
        }
        settingRest( checkingAttr, currentNode, variable);
    } else if(currentNode.nodeType === 3){
        const textContent = currentNode.textContent.trim();
        let isHTML = false;
        if( textContent.indexOf('}}') > -1){
            const innerTextSplit = textContent.replace(/{{([^{}]*)}}/g, function( matchString, innerText , offset, fullText ){
                if( innerText ){
                    const temp = getPatternData( matchString, variable );
                    if( temp.length > 1){
                        const contextText = temp[1].toLowerCase();
                        if( contextText.indexOf('context') > -1 && contextText.indexOf('html') > -1 ){
                            isHTML = true;
                        }
                    }
                    return temp[0];
                } else {
                    return innerText;
                }
            });
            if( isHTML ){
                currentNode.parentNode.innerHTML = innerTextSplit;
            } else {
                currentNode.textContent = innerTextSplit;
            }
        }
    }
    
}

function settingInjection( currentNode, drawObj, variable, index, currentAttrNames, classObj ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        if( attrValue ){
            const injectionData = getPatternData( attrValue, variable );
            const templateName = injectionData[0];
            const templateData = parsingChildrenDom( classObj, templateName , variable );
            NodeUtils.AtoBMoveChilden(currentNode, templateData );
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function settingText( currentNode, drawObj, variable, index, currentAttrNames ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);

        if( attrValue ){
            const textData = getPatternData( attrValue, variable );
            if( textData.length > 1 ){
                const nextText = textData[1].toLowerCase();
                if( nextText.indexOf('context') > -1 && nextText.indexOf('html') > -1 ){
                    currentNode.innerHTML = textData[0];
                } else {
                    currentNode.textContent = textData[0];
                }
            }
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function settingReapeat( currentNode, drawObj, variable, index, currentAttrNames, classObj ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        currentNode.removeAttribute(attrDotName);
        
        if( attrValue ){
            const listData = getPatternData( attrValue, variable )[0];

            for( const listIndex in listData ){
                const item = listData[listIndex];
                const variClone = {...variable};
                const parentDom = document.createElement('div');
                const currentNodeClone = currentNode.cloneNode(true);

                parentDom.appendChild(currentNodeClone);

                const children = parentDom.childNodes;
                variClone[dotSplitName[1]] = item;
                variClone[dotSplitName[1]+'List'] = {
                    'index' : parseInt(listIndex),
                    'count' : parseInt(listIndex)+1
                };
                recursionChild( children[0], drawObj, variClone, classObj );
                currentNode.parentNode.insertBefore(children[0],currentNode);
            }

            currentNode.parentNode.removeChild(currentNode);
            while(currentNode.attributes.length > 0) {
                currentNode.removeAttribute(currentNode.attributes[0].name);
            }   
        }

        
    }
}

function settingList( currentNode, drawObj, variable, index, currentAttrNames, classObj ){
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        if( attrValue ){
            const listData = getPatternData( attrValue, variable )[0];
            const currentNodeClone = currentNode.cloneNode(true);
            
            NodeUtils.removeAllChilden(currentNode);

            for( const listIndex in listData ){
                const item = listData[listIndex];
                const variClone = {...variable};
                const childNode = currentNodeClone.childNodes;
                variClone[dotSplitName[1]] = item;
                variClone[dotSplitName[1]+'List'] = {
                    'index' : parseInt(listIndex),
                    'count' : parseInt(listIndex)+1
                };
                for( const child of childNode ){
                    const cloneChild = child.cloneNode(true);
                    const parentDom = document.createElement('div');
                    parentDom.appendChild(cloneChild);
                    recursionChild( parentDom, drawObj, variClone, classObj );
                    NodeUtils.AtoBMoveChilden(currentNode, parentDom);
                    
                }
            }
        }

        currentNode.removeAttribute(attrDotName);
    }
}

function settingRest( checkingAttr, currentNode,variable ){
    for( const attr of checkingAttr ){
        const chanedValue = getPatternData( currentNode.getAttribute(attr), variable );
        currentNode.setAttribute( attr, chanedValue );
        }
}

function checkingCurrentAttr ( checkingAttr, compNameIndex, currentAttrNames, currentNode ){
    const sharedObj = JTemplate.sharedObj;

    for ( const index in currentAttrNames ){
        const attrName = currentAttrNames[index];
        const attrValue = currentNode.getAttribute(attrName);

        if( attrName.indexOf( sharedObj.COMPONENT_TEMPLATE ) > -1 ){
            compNameIndex[sharedObj.COMPONENT_TEMPLATE ] = parseInt(index);
        } else if( attrName.indexOf( sharedObj.COMPONENT_VAR ) > -1 ){
            compNameIndex[sharedObj.COMPONENT_VAR] == -1 ? compNameIndex[sharedObj.COMPONENT_VAR]=[ parseInt(index) ] : compNameIndex[sharedObj.COMPONENT_VAR].push(parseInt(index));
        } else if( attrName.indexOf( sharedObj.COMPONENT_TEST ) > -1) {
            compNameIndex[sharedObj.COMPONENT_TEST] = parseInt(index);
        } else if( attrName.indexOf( sharedObj.COMPONENT_ATTRIBUTE ) > -1 ){
            compNameIndex[sharedObj.COMPONENT_ATTRIBUTE] = parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_TEXT) > -1) {
            compNameIndex[sharedObj.COMPONENT_TEXT]= parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_LIST) > -1 ){
            compNameIndex[sharedObj.COMPONENT_LIST] = parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_REAPEAT) > -1 ){
            compNameIndex[sharedObj.COMPONENT_REAPEAT] = parseInt(index);
        } else if( attrName.indexOf(sharedObj.COMPONENT_INJECTION) > -1 ){
            compNameIndex[sharedObj.COMPONENT_INJECTION] = parseInt(index);
        } else if( attrValue.indexOf('}}') > -1 ){
            checkingAttr.push( attrName );
        }
    }
}

function settingTest( currentNode, drawObj, variable, index, currentAttrNames ){
    let result = true;
    if( index !== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);
        if( attrValue ){
            const patternData = getPatternData( attrValue, variable );
            result = patternData[0];
            if(dotSplitName.length > 1){
                variable[dotSplitName[1]] = result;
            }

            if( !result && currentNode.parentElement ){
                currentNode.parentElement.removeChild(currentNode);
            }
        }
        currentNode.removeAttribute(attrDotName);
    }
    return result;
}

function settingTemplate( currentNode, drawObj, variable, index, currentAttrNames ){
    if( index!== -1 ){
        const attrDotName = currentAttrNames[index];
        const dotSplitName = dotSplit( attrDotName );
        const attrName = dotSplitName[0];
        const attrValue = currentNode.getAttribute(attrDotName);

        if( attrValue ){
            const patternData = getPatternData( attrValue, variable );
            if( patternData.length > 1 ){
                variable[patternData[1]] = drawObj;
            } else {
                throw new Error(`${sharedObj.COMPONENT_TEMPLATE} 뒤 @ 를 통해 대표 변수를 설정하세요`)
            }
        }
    currentNode.removeAttribute(attrDotName);
    
    }
}

function dotSplit( string ){
    return StringUtils.defaultIfBlank(string , '').split('.');
}

function getPatternData( inputString, matchObj = {} ){
    const result = [];
    if( inputString && inputString.search(/([*%\/+\-()]|==|<=|>=|>|<|&&|\|\|)/) > -1 ){
        inputString = inputString.replace(/([^*%\/+\-()=<>\|& {}]*)/g, function( matchString, innerText , offset, fullText ){
            if( innerText ){
                return getPatternData( `{{${innerText}}}`, matchObj );
            } else {
                return innerText;
            }
        })
    }

    if( inputString ){
        const arrPattern  = inputString.match(/{{([^{{}}]*)}}/);
        
        if( arrPattern && arrPattern.length > 0){
            const replaceText = arrPattern[1].trim();
            const atSplit = replaceText.split('@');
            const leftText = atSplit[0].trim();
            
            if( leftText.indexOf('\'') > -1 ){
                result.push( Calculator.cal (leftText.replace(/\'/g , '')) );
            } else {
                const dotSplitLeft = dotSplit( leftText );
                let matchText = '';
                if( dotSplitLeft.length > 1 ){
                    let getData = matchObj;
                    
                    for( const dotText of dotSplitLeft ){
                        if( getData ){
                            getData = getData[dotText];
                        }
                    }

                    if( getData === null || getData === undefined ){
                        throw new Error(`${leftText} 변수에 대한 내용이 없습니다`);
                    } else {
                        matchText = getData;
                    }
                } else {
                    matchText = matchObj[leftText];
                }

                if( matchText !== null && matchText !== undefined){
                    result.push( matchText )
                } else {
                    result.push( Calculator.cal (leftText) )
                }
            }

            if( atSplit.length > 1 ){
                const rightText = atSplit[1].trim();
                result.push( rightText )
            }
        } else {
            throw new Error(`${inputString}을 확인하세요 {{}} 형식이 아닙니다. `);
        }
    }

    return result;
}

function errCheck( componentName, checkObj, debugText ){
    if( !componentName ){
        throw new Error( `${debugText}이 존재하지 않습니다. ${debugText}을 작성하세요` );
    }

    if( checkObj[componentName] ){
        throw new Error( `${debugText}에  ${componentName}이 중복됩니다. 중복된 ${debugText}을 제거하세요` );
    }
}


export { StringUtils, ArrayUtils, NodeUtils, ObjectUtils, Stack, Calculator, JTemplate };





