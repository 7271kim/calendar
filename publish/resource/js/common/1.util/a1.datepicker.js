class DatePicker {
    static idx = 0;
    static mapPickers = {};

    static datetimepicker( targetDom, inputOpts ){
        if ( typeof moment === 'undefined' || !moment ) {
            throw new Error('moment.js 가 필요합니다.');
        }
        if( targetDom ){
            const id = targetDom.getAttribute("id");
            const newDatePicker = new DatePicker( targetDom, inputOpts );

            if(DatePicker.mapPickers[id]){
                DatePicker.mapPickers[id].widget.remove()
            } 

            DatePicker.mapPickers[id] = newDatePicker;
            return newDatePicker;
        } else {
            throw new Error('target이 잘못되었습니다.');
        }
    }

    constructor( targetDom, inputOpts ){
        const defaults = this.#getDefaults();

        this.targetDom = targetDom;
        this.calanderIcon = targetDom.querySelector('#title-calendar-icon i');
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
        this.#init();
    }

    show( evnet ){
        const picker = this;
        if( picker.widget.classList.contains('hidden') ) {
            picker.widget.classList.remove('hidden');
        } else {
            picker.widget.classList.add('hidden');
        }
        picker.widget.style.display = 'block';
        picker.widget.style.padding = '5px';
        picker.place();
        picker.#attachDatePickerGlobalEvents( picker );

    }

    hide(){
        const picker = this;
        picker.widget.classList.add('hidden');
        picker.viewMode = picker.startViewMode;
        picker.#showMode(picker);
    }

    updateDate ( newDate, closePick ){
        const picker = this;
        let initDate = picker.date;
        if( newDate ){
            initDate = newDate;
        }
        initDate = picker.#changeMoment( picker, initDate);
        picker.date = initDate;
        picker.viewDate = moment(initDate).startOf('month'); // 선택 했을 때를 위한 요일.

        picker.#drawDate( picker );
        picker.#drawTime( picker );
        picker.#setIntputData( picker , closePick );
    }

    place() {
        const picker = this;
        const position = 'absolute';
        const offset = {
            top : picker.calanderIcon.getBoundingClientRect().top,
            left : picker.calanderIcon.getBoundingClientRect().left
        }
        

        const windHeight = window.innerHeight;
        const windWidth = window.innerWidth;
        const targetOutterHeight = picker.#getHeight(picker.calanderIcon,'outer');
        const targetOutterWidth = picker.#getWidth(picker.calanderIcon,'outer');

        let placePosition;

        picker.heigh = targetOutterHeight;
        picker.width = targetOutterWidth;
        
        if ( picker.opts.width ) {
            picker.widget.style.width = picker.opts.width + 'px';
        }

        if ( picker.opts.height ) {
            picker.widget.style.height = picker.opts.height + 'px';
        }

        const widgetHeight = picker.#getHeight(picker.widget,'height');
        const widgetOuterWidth = picker.#getWidth(picker.widget,'width');

        offset.top = offset.top + targetOutterHeight;

        if ( picker.opts.direction === 'up') {
            placePosition = 'top';
        } else if (picker.opts.direction === 'bottom') {
            placePosition = 'bottom';
        } else if (picker.opts.direction === 'auto') {
            if (offset.top + widgetHeight > windHeight + window.scrollY && widgetHeight + targetOutterHeight < offset.top) {
                placePosition = 'top';
            } else {
                placePosition = 'bottom';
            }
        }
        if (placePosition === 'top') {
            offset.bottom = (windHeight - offset.top + targetOutterHeight + 3) + 'px';
            picker.widget.classList.add('top');
            picker.widget.classList.remove('bottom');
        } else {
            offset.top += 1;
            offset.top +='px';
            picker.widget.classList.add('bottom');
            picker.widget.classList.remove('top');
        }

        if (windWidth< offset.left + widgetOuterWidth ) {
            offset.right =   ( windWidth - offset.left - targetOutterWidth ) + 'px';
            offset.left = 'auto';
            picker.widget.classList.add('pull-right');
        } else {
            offset.left += 'px';
            offset.right = 'auto';
            picker.widget.classList.remove('pull-right');
        }
        
        picker.widget.style.position = position;

        if (placePosition === 'top') {
            picker.widget.style.inset = `auto ${offset.right} ${offset.bottom} ${offset.left}`;
        } else {
            picker.widget.style.inset = `${offset.top} ${offset.right} auto ${offset.left}`;
        }
    }
    
	#init(){

        const picker = this;

        if (!( picker.opts.showTimeOption || picker.opts.showDateOption ) ) {
            throw new Error( 'showTimeOption 옵션, showDateOption 옵션 둘 중에 하나는 true 여야 합니다.' );
        }

        picker.#settingMomentData( picker );
        picker.#settingTemplate(picker);
        picker.#settingDisabledDates( picker );
        picker.#settingViewMode( picker );
        picker.opts.minDate = picker.#changeMoment( picker, picker.opts.minDate );
        picker.opts.maxDate = picker.#changeMoment( picker, picker.opts.maxDate );
        picker.#drawDayOfTheWeek( picker );
        picker.#drawMonths( picker );
        picker.#drawHours( picker );
        picker.#drawMinutes( picker );
        picker.#drawSeconds( picker );
        picker.updateDate();
        picker.#showMode(picker);
        picker.#attachEvents( picker );
    }

    #getDefaults(){
        moment.locale('ko');
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
            minViewMode : '', // months, years
            viewMode : '',
            disabledDates : [],
            minDate : moment().add(-100,'year').startOf('year'),
            maxDate : moment().add(100,'year').endOf('year'),
            format : '',
            stepInterval : 5,
            width : null,
            height : null,
            icons : {
                time: 'fa-clock-o fa',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-caret-left',
                next: 'fa fa-caret-right',
                today: 'fa fa-certificate',
                close: 'fa fa-close'
            },
            callBackFun : null
        }
    }

    #actions = {
        incrementHours() {
            this.#checkDate('add', 'hours', 1);
        },

        incrementMinutes () {
            this.#checkDate('add', 'minutes', this.opts.stepInterval);
        },

        incrementSeconds () {
            this.#checkDate('add', 'seconds', this.opts.stepInterval);
        },

        decrementHours () {
            this.#checkDate('subtract', 'hours', 1);
        },

        decrementMinutes () {
            this.#checkDate('subtract', 'minutes', this.opts.stepInterval);
        },

        decrementSeconds () {
            this.#checkDate('subtract', 'seconds', this.opts.stepInterval);
        },

        togglePeriod () {
            let hour = this.date.hours();
            if (hour >= 12) {
                hour -= 12;
            } else {
                hour += 12;
            }
            this.date.hours(hour);
        },

        showPicker() {
            this.#addClass( this.widget.querySelector('.timepicker > div:not(.timepicker-picker)') , 'hidden' );
            this.#removeClass( this.widget.querySelector('.timepicker .timepicker-picker') , 'hidden' );
        },

        hidePicker() {
            this.#addClass( this.widget.querySelector('.timepicker .timepicker-picker') , 'hidden' );
        },

        showHours() {
            this.#toggleClassOne( this.widget.querySelector('.timepicker .timepicker-picker'),'hidden' );
            this.#toggleClassOne( this.widget.querySelector('.timepicker .timepicker-hours'),'hidden' );
        },

        showMinutes() {
            this.#toggleClassOne( this.widget.querySelector('.timepicker .timepicker-picker') , 'hidden' );
            this.#toggleClassOne( this.widget.querySelector('.timepicker .timepicker-minutes') , 'hidden' );
        },

        showSeconds() {
            this.#toggleClassOne( this.widget.querySelector('.timepicker .timepicker-picker') , 'hidden' );
            this.#toggleClassOne( this.widget.querySelector('.timepicker .timepicker-seconds') , 'hidden' );
        },

        selectHour(args) {
            const evnet = args[0];
            let hour = parseInt(evnet.target.textContent);
            if (!this.use24hours) {
                if (this.date.hours() >= 12) {
                    if (hour !== 12) {
                        hour += 12;
                    }
                } else {
                    if (hour === 12) {
                        hour = 0;
                    }
                }
            }
            this.date.hours(hour);
            this.#actions.showPicker.call(this);
            this.#addClass( this.widget.querySelector('.timepicker .timepicker-hours'),'hidden' );
        },

        selectMinute( args ) {
            const evnet = args[0];
            this.date.minutes(parseInt(evnet.target.textContent));
            this.#actions.showPicker.call(this);
            this.#addClass( this.widget.querySelector('.timepicker .timepicker-minutes'),'hidden' );
        },

        selectSecond( args ) {
            const evnet = args[0];
            this.date.seconds(parseInt(evnet.target.textContent));
            this.#actions.showPicker.call(this);
            this.#addClass( this.widget.querySelector('.timepicker .timepicker-seconds'),'hidden' );
        }
    }

    #checkDate( direction, unit, amount ){
        const picker = this;
        let newDate;

        if ( direction === 'add' ) {
            newDate = moment(picker.date);
            if ( newDate.hours() === 23 ) {
                newDate.add(amount, unit);
            }
            newDate.add(amount, unit);
        } else {
            newDate = moment(picker.date).subtract(amount, unit);
        }

        if ( picker.#isInDisableDates( picker, moment(newDate.subtract(amount, unit))) || picker.#isInDisableDates( picker,newDate )) {
            return;
        }

        if (direction === 'add') {
            picker.date.add(amount, unit);
        }
        else {
            picker.date.subtract(amount, unit);
        }
    }

    #isInDisableDates( picker, inputDate ){
        const minDate = picker.#changeMoment( picker, picker.opts.minDate ).startOf('day'); // 그날의 시작 시로 변경.
        const maxDate = picker.#changeMoment( picker, picker.opts.maxDate).endOf('day'); // 그날의 마지막 시간으로 변경

        if (inputDate.isAfter(maxDate) || inputDate.isBefore(minDate)) {
            return true;
        }

        return  picker.opts.disabledDates && picker.opts.disabledDates[ picker.#changeMoment(picker, inputDate) ] === true;

    }

    #addClass( node, className ){
        if( node && node.length != 0 ){
            if( node.length > 0 ){
                for ( const childNode of node ){
                    if( !childNode.classList.contains(className) ){
                        childNode.classList.add(className);
                    }
                    
                }
            } else {
                if( !node.classList.contains(className) ){
                    node.classList.add(className);
                }
            }
            
        }
    }

    #removeClass( node, className ){
        if( node && node.length != 0 ){
            if( node.length > 0 ){
                for ( const childNode of node ){
                    childNode.classList.remove(className);
                }
            } else {
                node.classList.remove(className);
            }
            
        }
    }

    #changeMoment( picker, date ){
        if (date === undefined) {
            return;
        }
        if (moment.isMoment(date) || date instanceof Date) {
            return moment(date);
        } else {
            return moment(date, picker.format );
        }
    }

    #attachDatePickerGlobalEvents( picker ) {
        window.addEventListener('resize', picker.place.bind(picker));
        document.addEventListener('mousedown',picker.hide.bind(picker))
    }

    #getWidth(element, type) {
        if (type === 'inner')  // .innerWidth()
          return element.clientWidth;
        else if (type === 'outer')  // .outerWidth()
          return element.offsetWidth;
        let s = window.getComputedStyle(element, null);
        if (type === 'width')  // .width()
          return element.clientWidth - parseInt(s.getPropertyValue('padding-left')) - parseInt(s.getPropertyValue('padding-right'));
        else if (type === 'full')  // .outerWidth(includeMargins = true)
          return element.offsetWidth + parseInt(s.getPropertyValue('margin-left')) + parseInt(s.getPropertyValue('margin-right'));
        return null;
      }

    #getHeight(element, type) {
        if (type === 'inner')  // .innerWidth()
            return element.clientHeight ;
        else if (type === 'outer')  // .outerWidth()
            return element.offsetHeight;
        let s = window.getComputedStyle(element, null);
        if (type === 'height')  // .width()
            return element.clientHeight - parseInt(s.getPropertyValue('padding-top')) - parseInt(s.getPropertyValue('padding-bottom'));
        else if (type === 'full')  // .outerWidth(includeMargins = true)
            return element.clientHeight  + parseInt(s.getPropertyValue('margin-top')) + parseInt(s.getPropertyValue('margin-bottom'));
        return null;
    }

    #settingMomentData( picker ){
        moment.locale(picker.opts.language);
        picker.opts.defaultDate = picker.#changeMoment ( picker, picker.opts.defaultDate ); // 초기화 버튼을 위한 값.
        picker.date = picker.#changeMoment ( picker, picker.opts.defaultDate ); // 현재 선택된 날짜.
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
    
    #getTemplate( picker ){
        const tempParent = document.createElement('div');
        const headTemplate = `
            <thead>
                <tr>
                    <th class="prev">
                        <i class="${picker.opts.icons.previous}"></i>
                    </th>
                    <th colspan="5" class="picker-switch"></th>
                    <th class="next"><i class="${picker.opts.icons.next}"></i></th>
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

        const todayButton = picker.opts.useTodayButton ? `<a class="${picker.opts.icons.today}"></a>` : '';

        const timeTemplate = picker.#getTimeTemplate( picker );
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
                <div class="dropdown-menu datetimepicker-widget ${picker.use24hours ? 'usetwentyfour' : ''} hidden">
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
                            <div id="today-button" class="picker-switch">
                            ${todayButton}
                            </div>
                        </li>
                        ${ picker.opts.showTimeOption ? `
                            <li class="picker-switch accordion-toggle">
                                <a class="btn ${picker.opts.icons.time}"></a>
                            </li>
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
    
     #getTimeTemplate( picker ){
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
            <div class="timepicker-picker hidden">
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
    }

    #attachEvents ( picker ){
        picker.widget.querySelectorAll('.datepicker *').forEach((target)=>{
            target.addEventListener('click' , picker.#clickEvent.bind(picker) );
        });

        picker.widget.querySelectorAll('[data-action]').forEach((target)=>{
            target.addEventListener('click' , picker.#doActionEvent.bind(picker) );
        });
        if( picker.opts.showDateOption ){
            picker.widget.querySelector('#today-button').addEventListener('click' , function (event){
                const picker = this;
                picker.updateDate ( moment(), false );
                
            }.bind(picker));
        }

        picker.widget.addEventListener('mousedown', picker.#stopEvent);

        if (picker.opts.showDateOption && picker.opts.showTimeOption) {
            picker.widget.querySelectorAll('.accordion-toggle').forEach((target)=>{
                target.addEventListener('click' , picker.#toggleItem.bind(picker) );
            });
        }
        
        picker.calanderIcon.addEventListener('click', picker.show.bind(picker));
    }


    #toggleItem( event ){
        event.stopPropagation();
        const currentTarget = event.currentTarget;
        const parent = currentTarget.closest('ul');
        const expanded = parent.querySelector('.in');
        const closed = parent.querySelector('.collapse:not(.in)');
        const picker = this;

        if ( expanded ) {
            expanded.classList.remove('in');
            closed.classList.add('in');

            const icon = currentTarget.querySelector('a');
            let iconClass = '';
            if( icon ){
                iconClass = picker.#toggleClass( icon, picker.opts.icons.time, picker.opts.icons.date );
            }
            if( iconClass.indexOf( picker.opts.icons.date ) > -1 ){
                this.#actions.showPicker.call(this);
            } else {
                this.#actions.hidePicker.call(this);
            }
            
        }
    }

    #toggleClassOne( element, first ){
        if( element.className.indexOf( first )> -1 ) {
            element.className = element.className.replace(first,'');
        } else {
            element.className += ' '+ first;
        }
        return element.className;
    } 

    #toggleClass( element, first, second ){
        if( element.className.indexOf( first )> -1 ) {
            element.className = element.className.replace(first,'');
            element.className += second;
        } else{
            element.className = element.className.replace(second,'');
            element.className += first;
        }
        return element.className;
    } 

    #doActionEvent( event ){
        const oldDate = moment(this.date);
        const action = event.currentTarget.dataset['action'];
        const picker = this;
        
        this.#actions[action].call(this, arguments);
        picker.#stopEvent(event);
        if (!this.date) {
            this.date = moment({y: 1970});
        }
        picker.#setIntputData( this );
        picker.#drawTime( this );
    }

    #stopEvent( event ) {
        event.stopPropagation();
        event.preventDefault();
    }

    #clickEvent( event ){
        event.stopPropagation();
        event.preventDefault();
        
        const picker = this;
        const target = event.target.closest('span, td, th');

        if( target && !target.classList.contains('disabled') ){
            switch (target.nodeName.toLowerCase()) {
                case 'th':
                    switch (target.className) {
                        case 'picker-switch':
                            picker.#showMode(picker, 1);
                            break;
                        case 'prev':
                        case 'next':
                            let step = picker.constant.modes[picker.viewMode].navStep;
                            if (target.className === 'prev') {
                                step = step * -1;
                            }
                            picker.viewDate.add(step, picker.constant.modes[picker.viewMode].navFnc);
                            picker.#drawDate(picker);
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
                        picker.#setIntputData( picker );
                    }
                    picker.#showMode(picker,-1);
                    picker.#drawDate(picker);
                    break;
                case 'td':
                        // 일 클릭 시 
                        if ( target.classList.contains('day') ) {
                            const day = parseInt(target.textContent) || 1;
                            let month = picker.viewDate.month();
                            let year = picker.viewDate.year();
                            if ( target.classList.contains('old') ) {
                                if ( month === 0 ) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if ( target.classList.contains('new') ) {
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
                            picker.#drawDate(picker);
                            picker.#setIntputData( picker );
                        }
                        break;
            }
        }
        
    }

    #setIntputData( picker, closePick ){
        const formatDate = moment(picker.date).format("YYYY-MM-DD hh:mm:ss");
        const input = picker.targetDom.querySelector('input');
        input.value = formatDate;
        if( picker.opts.callBackFun ){
            picker.opts.callBackFun();
        }
        if( !picker.opts.showTimeOption && !( closePick!==undefined && !closePick ) ){
            // 시간 클릭 할 필요 없을 시 클릭 시 picker 닫기 위해 
            picker.widget.classList.add('hidden');

        }

    }
    
    #showMode( picker, input=0 ){
        if (input) {
            picker.viewMode = Math.max(picker.minViewMode, Math.min(2, picker.viewMode + input));
        }
        if( picker.opts.showDateOption ){
            const target  = picker.widget.querySelectorAll(`.datepicker > div`);
            const showTarget  = picker.widget.querySelector(`.datepicker-${picker.constant.modes[picker.viewMode].className}`);

            for( const item of target ){
                const classList = item.classList;

                if( !classList.contains('hidden') ){
                    classList.add('hidden');
                    showTarget.style = '';
                    
                }
            }
            showTarget.classList.remove('hidden');
            showTarget.style.display = 'block';
        } else if( picker.opts.showTimeOption ) {
            picker.widget.querySelector(`.timepicker-picker`).classList.remove('hidden');
        }
        
    }

    #drawTime( picker ){
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
                textInner = picker.#padLeft(hour);
            } else if ( item.dataset['timeComponent'] === 'minutes' ){
                textInner = picker.#padLeft(picker.date.minutes());
            } else if ( item.dataset['timeComponent'] === 'seconds' ){
                textInner = picker.#padLeft(picker.date.second());
            }

            item.textContent = textInner;
        }
    }

    #drawDate( picker ){
        picker.#removeClass( picker.widget.querySelectorAll('.datepicker-days .disabled'), 'disabled' );
        picker.#removeClass( picker.widget.querySelectorAll('.datepicker-months .disabled'), 'disabled' );
        picker.#removeClass( picker.widget.querySelectorAll('.datepicker-years .disabled'), 'disabled' );

        picker.#drawDateInMode( picker );
        picker.#drawMonthsInMode(picker);
        picker.#drawYearsInMode(picker);
    }

    #drawYearsInMode(picker){
        const currentYear = picker.date.year();
        const startYear = picker.opts.minDate.year();
        const endYear = picker.opts.maxDate.year();
        const targetYearTh = picker.widget.querySelectorAll('.datepicker-years th');
        const yearText = picker.widget.querySelector('.datepicker-years table td');

        if( targetYearTh.length ===0 ) return;

        yearText.innerHTML='';
        let year = parseInt(picker.viewDate.year()/10)*10;
        
        targetYearTh[1].textContent = `${year} - ${year+9}`;

        if (startYear > year) {
            picker.#addClass( targetYearTh[0], 'disabled' ); // 화살표 회색부분 diabled
        }
        if (endYear < year + 9) {
            picker.#addClass( targetYearTh[2], 'disabled' ); // 화살표 회색부분 diabled
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

    #drawMonthsInMode(picker){
        const year = picker.viewDate.year();
        const month = picker.viewDate.month();
        const startYear = picker.opts.minDate.year();
        const startMonth = picker.opts.minDate.month();
        const endYear = picker.opts.maxDate.year();
        const endMonth = picker.opts.maxDate.month();
        const months = moment.months();
        const targetMonthTh = picker.widget.querySelectorAll('.datepicker-months th');
        const monthText = picker.widget.querySelectorAll('.datepicker-months span');

        if( targetMonthTh.length === 0 ) return;

        targetMonthTh[1].textContent = `${year}`;
        picker.#removeClass( monthText, 'active' );

        if (year - 1 < startYear) {
            picker.#addClass( targetMonthTh[0], 'disabled' ); // 화살표 회색부분 diabled
        }
        if (year + 1 > endYear) {
            picker.#addClass( targetMonthTh[2], 'disabled' ); // 화살표 회색부분 diabled
        }

        for (let i = 0; i < 12; i++) {
            if ( month === i ) {
                picker.#addClass( monthText[i], 'active' );
            }
            if ((year === startYear && startMonth > i) || (year < startYear)) {
                picker.#addClass( monthText[i], 'disabled' );
            } else if ((year === endYear && endMonth < i) || (year > endYear)) {
                picker.#addClass( monthText[i], 'disabled' );
            }
        }
    }

   

    #drawDateInMode( picker ){
        if( picker.opts.showDateOption ){
            moment.locale(picker.opts.language);

            const year = picker.viewDate.year();
            const month = picker.viewDate.month();
            const startYear = picker.opts.minDate.year();
            const startMonth = picker.opts.minDate.month();
            const endYear = picker.opts.maxDate.year();
            const endMonth = picker.opts.maxDate.month();
            const months = moment.months();
            const targetDaysTh = picker.widget.querySelectorAll('.datepicker-days th');
            targetDaysTh[1].textContent = `${year} ${months[month]}`;

            const prevMonth = picker.#changeMoment( picker, picker.viewDate).subtract(1,'months');
            prevMonth.date(prevMonth.daysInMonth()).startOf('week'); // 그 달의 마지막 주의 첫째 요일로 세팅

            if ((year === startYear && month <= startMonth) || year < startYear) {
                // 날에 나오는 왼쪽 화살표가 회식이 되어야 하는 로직
                // 현재 달이 제한 달보다 작거나 같을 경우 단
                // 년이 넘어가는 경우도 있어서 현재 년이 제한 년도보다 작을 경우
                picker.#addClass( targetDaysTh[0], 'disabled' ); // 화살표 회색부분 diabled
            }
            if ((year === endYear && month >= endMonth) || year > endYear) {
                picker.#addClass( targetDaysTh[2], 'disabled' ); // 화살표 회색부분 diabled
            }


            const nextMonth = picker.#changeMoment( picker, prevMonth).add(42, 'd'); // 달력상 42일 추가한 요일로 nextMonth 세팅.
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
                if ( picker.#isInDisableDates(picker, prevMonth) ) {
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
            picker.#atoBMoveChilden( targetDayTextDom, tempDayDom );
        }
    }

    #drawSeconds( picker ){
        const table = picker.widget.querySelector('.timepicker .timepicker-seconds table');
        const step = picker.opts.stepInterval;
        let current = 0;

        if(table){
            table.parentElement.classList.add('hidden');

            for (let i = 0; i < Math.ceil(60 / step / 4) ; i++) {
                const tempTr = document.createElement('tr');
                for (let j = 0; j < 4; j++ ) {
                    const tempTd = document.createElement('td');
                    tempTd.setAttribute('class','second');
                    tempTd.textContent = picker.#padLeft(current.toString());
                    tempTr.appendChild(tempTd);
                    current += step;
                }
                table.appendChild(tempTr);
            }
        }
    }

    #drawMinutes ( picker ){
        const table = picker.widget.querySelector('.timepicker .timepicker-minutes table');
        const step = picker.opts.stepInterval;
        let current = 0;

        if(table ){
            table.parentElement.classList.add('hidden');

            for (let i = 0; i < Math.ceil(60 / step / 4) ; i++) {
                const tempTr = document.createElement('tr');

                for (let j = 0; j < 4; j++) {
                    if ( current < 60 ) {
                        const tempTd = document.createElement('td');
                        tempTd.setAttribute('class','minute');
                        tempTd.textContent = picker.#padLeft(current.toString());
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

    #drawHours( picker ){
        moment.locale(picker.opts.language);
        const monthsShort = moment.monthsShort();
        const table = picker.widget.querySelector('.timepicker .timepicker-hours table');
        let current;

        if( table ){
            table.parentElement.classList.add('hidden');

            if ( picker.use24hours ) {
                current = 0;
                for (let i = 0; i < 6; i ++ ) {
                    const tempTr = document.createElement('tr');
                    for (j = 0; j < 4; j++ ) {
                        const tempTd = document.createElement('td');
                        tempTd.setAttribute('class','hour');
                        tempTd.textContent = picker.#padLeft(current.toString());
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
                        tempTd.textContent = picker.#padLeft(current.toString());
                        current++;
                        tempTr.appendChild(tempTd);
                    }
                    table.appendChild(tempTr);
                }
            }
        }
    }

    #padLeft (string) {
        string = string.toString();
        if (string.length >= 2) {
            return string;
        }
        return '0' + string;
    }

    #drawMonths( picker ){
        moment.locale(picker.opts.language);
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
            picker.#atoBMoveChilden( widgetTarget, tempDom );
        }
    }

    #atoBMoveChilden( targetNode, removeNode ){
        if( removeNode ){
            while( removeNode.childNodes.length > 0 ){
                targetNode.appendChild(removeNode.childNodes[0]);
            }
        }
    }

    #drawDayOfTheWeek( picker ){
        moment.locale(picker.opts.language);

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

    #settingViewMode( picker ){
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

    #settingDisabledDates( picker ){
         moment.locale(picker.opts.language);

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

    #settingTemplate( picker ){
        picker.opts.widgetParent =  document.getElementsByTagName('body')[0];
        picker.widget = picker.#getTemplate(picker);

        picker.opts.widgetParent.appendChild(picker.widget);
    };
    
}



export {DatePicker};