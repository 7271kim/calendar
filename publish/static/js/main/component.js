import { JTemplate, DatePicker } from "/js/common/component.js";

(()=>{
    let calendarIcon, calendarIconPop, monthTitleIcon, monthTitle, datePickerTitle, dayData

    moment.locale('ko');
    const templateData  = JTemplate.HTMLWrapperparsing( 'calendar-month' );
    const sectionTarget = document.getElementsByClassName('main-section')[0];
    const opts = {
        showMode : 'month', // day - 일 , week- 주 , month- 월, year- 년
        defaultDate : moment(), // 오늘이 날짜.
        format : 'YYYY MM월',
        pickerMinViewMode : 'months',
        pickerViewMode : 'months'
        
    }

    const sharedObj = {
        pickDate : moment(),
        startDate : '',
        endDate : '',
        drawObj :{
            'month' : {
                'mainTitle' : 'test',
                'weekList' : [],
                'daysData' : [
                    [
                        {   
                            'wrapperClass' : '',
                            'count' : '',
                            'scheduleList' : [
                                {
                                    'class' : 'important',
                                    'title' : '집밥'
                                },
                                {
                                    'class' : 'post',
                                    'title' : 'post'
                                },
                                {
                                    'class' : 'schedule',
                                    'title' : 'schedule'
                                }
                            ]
                        }
                    ]
                ]
            }
        }
    }
    
    init();

    function init(){
        getDateData();
        drawTotal();
        settingEvent();
    }

    function settingWeek(){
        const drawObj = sharedObj.drawObj.month;
        const weekdaysMin = moment.weekdaysMin();

        drawObj.weekList=[];
        if (moment().localeData()._week.dow === 0) { // starts on Sunday
            for (let i = 0; i < 7; i++) {
                drawObj.weekList.push(weekdaysMin[i]);
            }
        } else {
            for ( let i = 1; i < 8; i++) {

                if (i === 7) {
                    drawObj.weekList.push(weekdaysMin[0]);
                } else {
                    drawObj.weekList.push(weekdaysMin[i]);
                }
            }
        }
    }
    function settingMonth(){
        const startDate = sharedObj.startDate;
        const endDate = sharedObj.endDate;
        const drawObj = sharedObj.drawObj.month;
        const year = sharedObj.pickDate.year();
        const month = sharedObj.pickDate.month();
        const date = sharedObj.pickDate.date();
        const today= moment();
        const endWeekday = moment().endOf('week').weekday();
        let oneWeekData =[];

        drawObj.daysData=[];
        drawObj.mainTitle = sharedObj.pickDate.format(opts.format);

        while( startDate.isBefore(endDate) ){
            const className = [];
            if (startDate.year() < year || (startDate.year() === year && startDate.month() < month)) {
                className.push('old');
            } 
            
            if (startDate.year() > year || (startDate.year() === year && startDate.month() > month)) {
                className.push('new');
            }
            
            if (startDate.isSame(moment({y: year, M: month, d: date}))) {
                className.push('active');
            }

            if (startDate.isSame(moment({y: today.year(), M: today.month(), d: today.date()}))) {
                className.push('today');
            }

            const oneday = {
                'wrapperClass' : `${className.join(' ')}`,
                'count' : `${startDate.date()}`,
                'scheduleList' : [
                    {
                        'class' : 'important',
                        'title' : '집밥'
                    },
                    {
                        'class' : 'post',
                        'title' : 'post'
                    },
                    {
                        'class' : 'schedule',
                        'title' : 'scheduleeeeeeeeeeeeeeeeee'
                    },
                    {
                        'class' : 'schedule',
                        'title' : 'scheduleeeeeeeeeeeeeeeeee'
                    },
                    {
                        'class' : 'schedule',
                        'title' : 'scheduleeeeeeeeeeeeeeeeee'
                    },
                    {
                        'class' : 'schedule',
                        'title' : 'scheduleeeeeeeeeeeeeeeeee'
                    },
                    {
                        'class' : 'schedule',
                        'title' : 'scheduleeeeeeeeeeeeeeeeee'
                    }
                    
                ]
            }
            oneWeekData.push(oneday);
            if( startDate.weekday() === endWeekday){
                drawObj.daysData.push(oneWeekData)
                oneWeekData = [];
            }

            startDate.add(1,'day');
        }
    }

    function drawTotal(){
        if( opts.showMode === 'day' ){
            settingWeek();
        } else if( opts.showMode === 'week' ){
            settingWeek();
        } else if( opts.showMode === 'month' ){
            settingWeek();
            settingMonth();
            templateData.injectModel( sectionTarget.querySelectorAll('.title-wrapper'), 'monthTitle' , sharedObj.drawObj.month);
            templateData.injectModel( sectionTarget.querySelectorAll('.week-wrapper'), 'monthWeek' , sharedObj.drawObj.month);
            templateData.injectModel( sectionTarget.querySelectorAll('.day-wrapper'), 'monthDay' , sharedObj.drawObj.month);
        } else if( opts.showMode === 'year' ){

        }

        calendarIcon = document.getElementById('icon-popup');
        calendarIconPop = document.getElementById('icon-popup-target');
        monthTitleIcon = document.getElementById('title-calendar-icon');
        monthTitle = document.getElementsByClassName('month-title')[0];
        dayData = document.getElementById('day-data');

        datePickerTitle = settingDatePickerTitle();
    }
    function getDateData( date ){
        let startDate,endDate;
        let selectedDate = opts.defaultDate;
        
        if( date ){
            selectedDate = getMoment(date);
        }
        
        switch (opts.showMode){
            case 'week' :
            case 'day' : 
                    startDate = getMoment(selectedDate).startOf('week');
                    endDate = getMoment(selectedDate).endOf('week');
                break;
            case 'month' :
                    const prevMonth = getMoment(selectedDate).subtract(1,'months');
                    prevMonth.date(prevMonth.daysInMonth()).startOf('week');
                    
                    startDate = prevMonth;
                    endDate = getMoment(prevMonth).add(41, 'days').endOf('day');
                break;
            
            case 'year':
                startDate = getMoment(selectedDate).startOf('year');
                endDate = getMoment(selectedDate).endOf('year');
            break;
        }

        sharedObj.pickDate =selectedDate;
        sharedObj.startDate =startDate;
        sharedObj.endDate =endDate;
    }

    function getMoment( date ){
        if( date ){
            return moment(date);
        } else {
            new Error(`${date}를 확인하세요`);
        }
    }
   
    function settingEvent(){
        calendarIcon.addEventListener('click' , (e)=>{
            const classList = calendarIconPop.classList;
            if( classList.contains('hidden') ){
                classList.remove('hidden');
            } else {
                classList.add('hidden');
            }
            calendarIconPop.focus();
        })

        calendarIconPop.addEventListener('click' , ionPopupClick);
        monthTitle.addEventListener('click' , openDatePicker);
        document.addEventListener('mousedown',addHiddenClass, true);
    }

    function updateShowMode( showMode ){
        opts.showMode = showMode;
        if( showMode ==='month' ){
            updateMonthDate( true );
        } else {
            templateData.injectModel( sectionTarget.querySelectorAll('.day-wrapper'), 'monthDay' , {
                'mainTitle' : 'test',
                'weekList' : [],
                'daysData' : [
                    [
                        {   
                            'wrapperClass' : '',
                            'count' : '',
                            'scheduleList' : [
                                {
                                    'class' : 'important',
                                    'title' : '집밥'
                                },
                                {
                                    'class' : 'post',
                                    'title' : 'post'
                                },
                                {
                                    'class' : 'schedule',
                                    'title' : 'schedule'
                                }
                            ]
                        }
                    ]
                ]
            });
        }
        
    }

    function updateMonthDate( isForceUpdate ){
        
        const newDate = getMoment(dayData.value);
        
        // 강제로 업데이트 하거나, pick한 날짜가 오늘일 아닐때만 업데이트
        if( isForceUpdate || !newDate.isSame(moment({y: sharedObj.pickDate.year(), M: sharedObj.pickDate.month(), d: sharedObj.pickDate.date()})) ){
            monthTitle.textContent = newDate.format(opts.format);
            getDateData(newDate);
            settingMonth();
            templateData.injectModel( sectionTarget.querySelectorAll('.day-wrapper'), 'monthDay' , sharedObj.drawObj.month);
        }
    }

    function openDatePicker(){
        datePickerTitle.show();
    }

    function addHiddenClass(event){
        var target = event.target;
        if( target.parentElement !== event.currentTarget.querySelector("#icon-popup-target") ) {
            const classList = calendarIconPop.classList.add('hidden');
        }
        
    }

    function removeHiddenClass(e){
        const classList = calendarIconPop.classList.remove('hidden');
    }
    
    function ionPopupClick(e){
        const classList = calendarIconPop.classList;
        if( classList.contains('hidden') ){
            classList.remove('hidden');
        } else {
            classList.add('hidden');
        }

        const innderDiv =  [...calendarIconPop.getElementsByTagName('div')];
        for( const div of innderDiv ){
            const classList = div.classList;
            if( classList.contains('current') ){
                classList.remove('current');
                break;
            }
        }

        e.target.classList.add('current');
        updateShowMode(e.target.dataset['showMode']);
}

    function settingDatePickerTitle(){
        const target = document.getElementById("datetimepicker-notime");
        const datePickerTitle = DatePicker.datetimepicker( target  ,{ 
            showTimeOption : false,
            showDateOption : true,
            showMinutes : true,
            showSeconds : false,
            useToday : true,
            useTodayButton : true,
            language : 'ko',
            direction : 'auto',
            minViewMode : opts.pickerMinViewMode,
            viewMode : opts.pickerViewMode,
            stepInterval : 5,
            defaultDate : sharedObj.pickDate,
            callBackFun : updateMonthDate
         });

         return datePickerTitle;
    }
   
})();   

