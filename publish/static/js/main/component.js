import { JTemplate, DatePicker } from "/js/common/component.js";

(()=>{
    let calendarIcon, calendarIconPop, monthTitleIcon, monthTitle, 
        datePickerTitle, dayData, preNextTitle, monthDimLayer,resetToday

    moment.locale('ko');
    const templateData  = JTemplate.HTMLWrapperparsing( 'calendar-month' );
    const sectionTarget = document.getElementsByClassName('main-section')[0];
    const opts = {
        showMode : 'month', // day - 일 , week- 주 , month- 월, year- 년
        defaultDate : moment(), // 오늘이 날짜.
        format : 'YYYY MM월',
        pickerMinViewMode : 'months',
        pickerViewMode : 'months',
        callBackFun : updateMonthDate
    }

    const sharedObj = {
        pickDate : moment(),
        startDate : '',
        endDate : '',
        dbTotalData : {},
        drawObj :{
            'month' : {
                'mainTitle' : '',
                'weekList' : [],
                'daysData' : [
                    [
                        {   
                            'wrapperClass' : '',
                            'count' : '',
                            'scheduleList' : [
                                {
                                    'class' : 'important',
                                    'title' : '집밥',
                                    'totalIndex' : '0'
                                },
                                {
                                    'class' : 'post',
                                    'title' : 'post',
                                    'totalIndex' : '1'
                                },
                                {
                                    'class' : 'schedule',
                                    'title' : 'schedule',
                                    'totalIndex' : '2'
                                }
                            ]
                        }
                    ]
                ],
                'clickItem' : {
                    'today' : '',
                    'clickList' : [
                        {
                            'className':'',
                            'title' : ''
                        }
                    ]
                }
            },
            'year' : {
                'mainTitle' : '',
                'totalList' : [
                    [
                        {
                            'monthDate' : '',
                            'monthFormat' : '',
                            'dayList' : [
                                [
                                    {
                                        'class' : '',
                                        'date' : ''
                                    }
                                ]
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

        templateWeekUpdate();
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
            const dbData = sharedObj.dbTotalData[startDate.format('YYYY-MM-DD')]
            let dayList = [];
            if ( dbData ){
                for( const item of dbData ){
                    let classCheck = '';
                    if( item.important == 0 ){
                        classCheck = 'schedule';
                        
                    } else if( item.important == 1 ){
                        classCheck = 'important';
                    }
                    dayList.push( {
                        'class' : classCheck,
                        'title' : item.title
                    })
                }
            }
          
            const oneday = {
                'wrapperClass' : `${className.join(' ')}`,
                'count' : `${startDate.date()}`,
                'date' : startDate.format('YYYY-MM-DD'),
                'scheduleList' :  dayList || []
            }

            oneWeekData.push(oneday);
            if( startDate.weekday() === endWeekday){
                drawObj.daysData.push(oneWeekData)
                oneWeekData = [];
            }

            startDate.add(1,'day');
        }

        opts.pickerViewMode = 'months';
        opts.pickerMinViewMode = 'months';
        
        opts.callBackFun = updateMonthDate;
    }

    function templateMonthTitleUpdate(){
        templateData.injectModel( sectionTarget.querySelectorAll('.title-wrapper'), 'monthTitle' , sharedObj.drawObj.month);
        titleUpdate();
    }
    function titleUpdate(){
        calendarIcon = document.getElementById('icon-popup');
        calendarIconPop = document.getElementById('icon-popup-target');
        monthTitleIcon = document.getElementById('title-calendar-icon');
        monthTitle = document.getElementsByClassName('month-title')[0];
        dayData = document.getElementsByClassName('day-data')[0];
        preNextTitle = document.querySelectorAll('.month-arrow');
        resetToday = document.querySelector('#reset-today');

        if( opts.showMode === 'month' ){
            document.querySelector('.title-wrapper div[data-show-mode=month]').classList.add('current');
        } else if( opts.showMode === 'year' ){
            document.querySelector('.title-wrapper div[data-show-mode=year]').classList.add('current');
        } else if( opts.showMode === 'week' ){
            document.querySelector('.title-wrapper div[data-show-mode=week]').classList.add('current');
        } else {
            document.querySelector('.title-wrapper div[data-show-mode=day]').classList.add('current');
        }

        settingTitleEvent();
    }

    function settingTitleEvent(){
        calendarIcon.addEventListener('click' , (e)=>{
            const classList = calendarIconPop.classList;
            if( classList.contains('hidden') ){
                classList.remove('hidden');
            } else {
                classList.add('hidden');
            }
            calendarIconPop.focus();
        })
        
        calendarIconPop.addEventListener('click' , clickChangeShowMode );
        monthTitle.addEventListener('click' , openDatePicker );
        
         for( const item of preNextTitle ){
            item.addEventListener('click', updatePreNextMonth );
        }

        datePickerTitle = settingDatePickerTitle();

        resetToday.addEventListener('click', clickReset);

    }
    
    function clickReset(e){
        opts.defaultDate = moment();
        drawTotal();
    }

    function templateWeekUpdate(){
        templateData.injectModel( sectionTarget.querySelectorAll('.week-wrapper'), 'monthWeek' , sharedObj.drawObj.month);
    }

    function settingYears(){
        let startDate = sharedObj.startDate;
        const drawObj = sharedObj.drawObj.year;
        const endWeekday = moment().endOf('week').weekday();
        const today= moment();

        let count = 0;


        drawObj.totalList=[];
        drawObj.mainTitle = sharedObj.pickDate.format('YYYY');
        
        let tempMonth =  startDate.year();

        for( let column = 1; column <= 3; column++ ){
            let fourMonthList = [];

            for( let row = 1; row <=4; row++ ){
                const prevMonth = getMoment(startDate).subtract(1,'months');
                prevMonth.date(prevMonth.daysInMonth()).startOf('week');
                
                const tempStartDate = prevMonth;
                const tempEndDate = getMoment(prevMonth).add(41, 'days').endOf('day');	
                const year = startDate.year();
                const month = startDate.month();

                startDate = getMoment(tempStartDate);

                let oneWeekData =[];
                let dayList = [];

                while( tempStartDate.isBefore(tempEndDate) ){
                    const className = [];
                    if (tempStartDate.year() < year || (tempStartDate.year() === year && tempStartDate.month() < month)) {
                        className.push('old');
                    } 
                    
                    if (tempStartDate.year() > year || (tempStartDate.year() === year && tempStartDate.month() > month)) {
                        className.push('new');
                    }
                    
                    if (tempStartDate.isSame(moment({y: today.year(), M: today.month(), d: today.date()}))) {
                        className.push('today');
                    }
                    const dbData = sharedObj.dbTotalData[tempStartDate.format('YYYY-MM-DD')]
                    if ( dbData ){
                        className.push('check');
                    }
                
                    const oneday = {
                        'class' : `${className.join(' ')}`,
                        'date' : tempStartDate.date(),
                    }

                    oneWeekData.push(oneday);
                    if( tempStartDate.weekday() === endWeekday){
                        dayList.push(oneWeekData)
                        oneWeekData = [];
                    }
                    tempStartDate.add(1,'day');
                    startDate.add(1,'day');
                }

                const beforeMonth = getMoment(startDate).subtract(1,'month');

                fourMonthList.push({
                    monthDate : beforeMonth.format('YYYY-MM-01'),
                    monthFormat : beforeMonth.format('YYYY년 MM월'),
                    dayList : dayList
                })
            }
            drawObj.totalList.push( fourMonthList );
        }

        opts.pickerMinViewMode = 'years';
        opts.pickerViewMode = 'years';
        opts.callBackFun = updateYearDate;
    }

    function templateYearUpdate(){
        templateData.injectModel( sectionTarget.querySelectorAll('.year-wrapper'), 'yearData' , sharedObj.drawObj.year);
        const calendarMonth = document.querySelectorAll('.calendar-month');

        if( calendarMonth.length > 0 ){
            for( const item of calendarMonth ){
                item.addEventListener('click', clickYear );
            }
        }
        
    }

    function clickYear ( event ) {
        const currentTarget = event.currentTarget;
        const date = currentTarget.dataset['index'];
        opts.defaultDate = getMoment(date);
        opts.pickerViewMode = 'months';
        opts.pickerMinViewMode = 'months';
        updateShowMode('month');
    }

    function templateTitleUpdate(){
        templateData.injectModel( sectionTarget.querySelectorAll('.view-year .title-wrapper'), 'yearTitle' , sharedObj.drawObj.year);
        titleUpdate();
    }
    function resetDom(){
        document.querySelector('.view-month .title-wrapper').textContent = '';
        document.querySelector('.view-month .week-wrapper').textContent = '';
        document.querySelector('.view-month .day-wrapper').textContent = '';
        document.querySelector('.view-year .title-wrapper').textContent = '';
        document.querySelector('.view-year .year-wrapper').textContent = '';
        document.querySelector('.view-week .title-wrapper').textContent = '';
        document.querySelector('.view-week .week-wrapper').textContent = '';
        document.querySelector('.view-week .day-wrapper').textContent = '';
        document.querySelector('.view-day .title-wrapper').textContent = '';
        document.querySelector('.view-day .week-wrapper').textContent = '';
        document.querySelector('.view-day .day-wrapper').textContent = '';
    }

    function drawTotal(){
        resetDom()
        themeChange();
        if( opts.showMode === 'day' ){
            settingWeek();
        } else if( opts.showMode === 'week' ){
            settingWeek();
        } else if( opts.showMode === 'month' ){
            settingWeek();
            settingMonth();
            templateMonthUpdate();
            templateMonthTitleUpdate();
        } else if( opts.showMode === 'year' ){
            settingYears();
            templateYearUpdate();
            templateTitleUpdate();
        }
    }
    function getDateData( date ){
        let startDate,endDate;
        let selectedDate = opts.defaultDate;
        sharedObj.dbTotalData={};
        
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
        sharedObj.endDate = endDate;
        const dbTotalData = [
            {
                'title' : '집밥먹기',
                'seq' : '1',
                'content' : '집에서 밥먹기',
                'important' : '1',
                'startDate' : '2020-12-27',
                'endDate' :  '2020-12-27',
                'latitude' : '',
                'longitude'  :''
            },
            {
                'title' : '집밥먹기',
                'seq' : '1',
                'content' : '집에서 밥먹기',
                'important' :  '1',
                'startDate' : '2021-01-17',
                'endDate' :  '2021-01-20',
                'latitude' : '',
                'longitude'  :''
            },
            {
                'title' : '공부하기',
                'seq' : '2',
                'content' : '집에서 밥먹기sssss',
                'important' :  '1',
                'startDate' : '2021-01-17',
                'endDate' :  '2021-01-20',
                'latitude' : '',
                'longitude'  :''
            },
            {
                'title' : 'ssssssss',
                'seq' : '3',
                'content' : 'sssssssssssss ssssssss sssssssssssssssssssss',
                'important' :  '0',
                'startDate' : '2021-01-17',
                'endDate' :  '2021-01-20',
                'latitude' : '',
                'longitude'  :''
            },
            {
                'title' : 'ssssssss',
                'seq' : '1',
                'content' : 'ssssssss',
                'important' :  '1',
                'startDate' : '2021-01-11',
                'endDate' :  '2021-01-13',
                'latitude' : '',
                'longitude'  :''
            },
            {
                'title' : '공부하기',
                'seq' : '2',
                'content' : '집에서 밥먹기sssss',
                'important' :  '1',
                'startDate' : '2021-01-19',
                'endDate' :  '2021-01-20',
                'latitude' : '',
                'longitude'  :''
            },
            {
                'title' : 'ssssssss',
                'seq' : '3',
                'content' : 'sssssssssssss ssssssss sssssssssssssssssssss',
                'important' : '0',
                'startDate' : '2021-01-27',
                'endDate' :  '2021-01-27',
                'latitude' : '',
                'longitude'  :''
            },
            {
                'title' : 'ssssssss',
                'seq' : '1',
                'content' : 'ssssssss',
                'important' : '1',
                'startDate' : '2021-01-28',
                'endDate' :  '2021-01-28',
                'latitude' : '',
                'longitude'  :''
            }
        ]

        for( const item of dbTotalData ) {
            const startDate =  getMoment(item.startDate);
            const endDate = getMoment(item.endDate).add(1,'day');
            if( startDate.isValid() && endDate.isValid() ){

                while( startDate.isBefore(endDate) ){
                    const date = startDate.format('YYYY-MM-DD');
                    if( !sharedObj.dbTotalData[date] ){
                        sharedObj.dbTotalData[date] = [item];
                    } else {
                        sharedObj.dbTotalData[date].push(item);
                    }
                     
                     startDate.add(1,'day');
                }
            }
        }

        for( const day in sharedObj.dbTotalData ){
            let dayList = sharedObj.dbTotalData[day]
            const important = [];
            const normal = [];
            for( const item of dayList ){
                if( item.important ==='1' ) {
                    important.push(item);
                } else {
                    normal.push(item);
                }
            }   
            sharedObj.dbTotalData[day] = [...important, ...normal];
        }
    }

    function getMoment( date ){
        if( date ){
            return moment(date);
        } else {
            new Error(`${date}를 확인하세요`);
        }
    }
   
    function settingEvent(){
        document.addEventListener('mousedown',addHiddenClass, true);
    }

    function updateYearDate( isForceUpdate ){
        const newDate = getMoment(dayData.value);
        
        // 강제로 업데이트 하거나, pick한 날짜가 오늘일 아닐때만 업데이트
        if( isForceUpdate || !newDate.isSame(moment({y: sharedObj.pickDate.year(), M: sharedObj.pickDate.month(), d: sharedObj.pickDate.date()})) ){
            monthTitle.textContent = newDate.format("YYYY");
            opts.defaultDate = newDate;
            getDateData(newDate);
            settingYears();
            templateYearUpdate()
        }
    }

    function updatePreNextMonth( event ){
        const target = event.currentTarget;
        const today =  getMoment(dayData.value);

        if(target.classList.contains('prev') ){
            if( opts.showMode ==='month' ){
                today.startOf('month').subtract(1,'day')
            } else if( opts.showMode ==='year'){
                today.startOf('year').subtract(1,'day')
            } else if ( opts.showMode === 'week' ){

            } else if( opts.showMode === 'day'){

            }
        } else if ( target.classList.contains('next') ){
            if( opts.showMode ==='month' ){
                today.endOf('month').add(1,'day')
            } else if( opts.showMode ==='year'){
                today.endOf('year').add(1,'day')
            } else if ( opts.showMode === 'week' ){

            } else if( opts.showMode === 'day'){

            }
        }

        dayData.value = today.format('YYYY-MM-DD');
        datePickerTitle.updateDate(today);

        if( opts.showMode ==='month' ){
            updateMonthDate( true );
        } else if( opts.showMode ==='year'){
            updateYearDate( true );
        } else if ( opts.showMode === 'week' ){

        } else if( opts.showMode === 'day'){

        }
        
    }

    function updateShowMode( showMode ){
        opts.showMode = showMode;

        getDateData( getMoment(sharedObj.pickDate) );
        drawTotal();
    }
    function templateMonthUpdate(){
        templateData.injectModel( sectionTarget.querySelectorAll('.day-wrapper'), 'monthDay' , sharedObj.drawObj.month);
        const eventTargets = document.querySelectorAll('.day-warpper');
        if( eventTargets ){
            for( const item of eventTargets ){
                item.addEventListener('click', clickMonthDay);
            }
        }
    }

    function clickMonthDay( event ){
        const target = event.currentTarget;
        const date = target.dataset.index;
        const daydata = sharedObj.dbTotalData[date];
        const clickItem = sharedObj.drawObj.month.clickItem;
        const clickList = clickItem.clickList = [];
        

        if( daydata ){
            daydata.map( item =>{
                const className = item.important ==='1' ? 'important': 'normal'
                clickList.push({
                    'className' : className,
                    'title' : item.title
                })
            })
        }
        
        clickItem.today = date;
        templateMonthPopup();
        
    }

    function templateMonthPopup(){
        templateData.injectModel( document.querySelectorAll('.schedule-container'), 'monthPopup' , sharedObj.drawObj.month);
        monthDimLayer = document.getElementsByClassName('month-dim-layer')[0];
        monthDimLayer.classList.remove('hidden');
        document.querySelector('.schedule-container .close').addEventListener('click' , (e)=>{
            monthDimLayer.classList.add('hidden');
        })
    }

    function updateMonthDate( isForceUpdate ){
        
        const newDate = getMoment(dayData.value);
        
        // 강제로 업데이트 하거나, pick한 날짜가 오늘일 아닐때만 업데이트
        if( isForceUpdate || !newDate.isSame(moment({y: sharedObj.pickDate.year(), M: sharedObj.pickDate.month(), d: sharedObj.pickDate.date()})) ){
            monthTitle.textContent = newDate.format(opts.format);
            opts.defaultDate = newDate;
            getDateData(newDate);
            settingMonth();
            templateMonthUpdate()
        }
    }

    function openDatePicker(){
        datePickerTitle.show();
    }

    function addHiddenClass(event){
        const target = event.target;
        const currentTarget = event.currentTarget.querySelector("#icon-popup-target");

        if( currentTarget && target.parentElement !==currentTarget ) {
            const classList = calendarIconPop.classList.add('hidden');
        }
        
    }

    function removeHiddenClass(e){
        const classList = calendarIconPop.classList.remove('hidden');
    }
    
    function clickChangeShowMode(e){
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

    function themeChange(){
        const viewTheme = document.querySelectorAll('.main-section .view-theme');
        const tartget = document.querySelector(`.main-section .view-${opts.showMode}`);
        for( const item of viewTheme ){
            item.classList.add('hidden')
        }

        if( tartget ){
            tartget.classList.remove('hidden');
        }
        
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
            defaultDate : opts.defaultDate,
            callBackFun : opts.callBackFun
         });

         return datePickerTitle;
    }
   
})();   

