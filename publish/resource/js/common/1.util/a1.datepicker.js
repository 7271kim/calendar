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
        settingView( picker );
        picker.opts.minDate = changeMoment( picker.opts.minDate );
        picker.opts.maxDate = changeMoment( picker.opts.maxDate );
        drawDayOfTheWeek( picker );
        drawMonths( picker );
        drawHours( picker );
        drawMinutes( picker );
        drawSeconds( picker );
        updateDate( picker );
        
        function updateDate ( picker, newDate ){
            let initDate = picker.opts.defalutDate;
            if( newDate ){
                initDate = newDate;
            }
            initDate = changeMoment( picker, newDate);
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

        function settingView( picker ){
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
                </td>' : ''
            ` : '';

            const use24hoursTemplate = !picker.use24hours ? `
                <td class="separator"></td>
            ` : '';

            const minuteTemplate =  picker.opts.showMinutes? `
                <span data-action="showMinutes" data-time-component="minutes" class="timepicker-minute"></span>
            ` : `<span class="timepicker-minute">00</span>`;
            
            const secondsTemplate = picker.opts.showSeconds ? `
                <td class="separator">:</td>
                <td>
                    <span data-action="showSeconds"  data-time-component="seconds" class="timepicker-second"></span>
                </td>
            ` :''

            const use24hoursTemplate2 = !picker.use24hours ? `
               ${use24hoursTemplate} 
                <td>
                    <button type="button" class="btn btn-primary" data-action="togglePeriod"></button>
                </td>
            ` : '';

            const secondsTemplate2 = picker.opts.showSeconds ? `
                <td class="separator"></td>
                <td>
                    <a href="#" class="btn" data-action="decrementSeconds">
                        <span class="${picker.opts.icons.down}"></span>
                    </a>
                </td>
                ${use24hoursTemplate}
            ` :'';

            const secondsTemplate3 = picker.opts.showSeconds ? `
                <div class="timepicker-seconds" data-action="selectSecond">
                    <table class="table-condensed"></table>
                </div>
            ` :'';

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
                    <div class="dropdown-menu datetimepicker-widget hidden ${picker.use24hours ? 'usetwentyfour' : ''}">
                        <ul>
                            <li class="collapse in" >
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
            
            picker.date = moment();
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