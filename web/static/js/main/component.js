import { JTemplate, DatePicker } from "/js/common/component.js";

let count = 0;

(()=>{
    let calendarIcon, calendarIconPop, monthWarapper , monthTitleIcon, monthTitle, 
        datePickerTitle, dayData, preNextTitle, monthDimLayer,resetToday

    moment.locale('ko');
    const templateData  = JTemplate.HTMLWrapperparsing( 'calendar-month' );
    const sectionTarget = document.getElementsByClassName('main-section')[0];
    const apiServer = "http://localhost:3003";
    let dbTotalData = []

    const opts = {
        showMode : 'month', // day - 일 , week- 주 , month- 월, year- 년
        defaultDate : moment(), // 오늘이 날짜.
        format : 'YYYY MM월',
        pickerMinViewMode : 'months',
        pickerViewMode : 'months',
        callBackFun : updateMonthDate,
        showTimeOption : false,
        showSeconds : true
    }

    const sharedObj = {
        pickDate : moment(),
        startDate : '',
        endDate : '',
        dbTotalData : {},
        dbTotalDataSeq : {},
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
                                    'seq' : '0'
                                },
                                {
                                    'class' : 'post',
                                    'title' : 'post',
                                    'seq' : '1'
                                },
                                {
                                    'class' : 'schedule',
                                    'title' : 'schedule',
                                    'seq' : '2'
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
            },
            'detailPop' : {
                'today' : '',
                'title' : '',
                'seq' : '',
                'content' : '',
                'important' : '',
                'startDate' : '',
                'endDate' :  '',
                'latitude' : '',
                'longitude'  :''
            }
        }
    }
    getAPIData();

    async function getAPIData(){
        const response = await fetch(`${apiServer}/api/callist`,{ method: 'GET' })

        if (response.ok) {
            let json = await response.json();
            if( json.code !== 500 ){
                dbTotalData = json.list;
                console.log(json);
            }
            init();
            
        } else {
            new Error('DB에러');
        }
        
    }
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

        templateWeekGlobalUpdate();
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
        document.querySelector('.view-month .cross img').addEventListener('click',writeDetail);
        
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

    function toggleHide(){
        const classList = calendarIconPop.classList;
        if( classList.contains('hidden') ){
            classList.remove('hidden');
        } else {
            classList.add('hidden');
        }
        calendarIconPop.focus();
    }

    function settingTitleEvent(){
        calendarIcon.addEventListener('click' , toggleHide );
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

    function templateWeekGlobalUpdate(){
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
        document.querySelector('.view-year .cross img').addEventListener('click',writeDetail);

        titleUpdate();
    }
    function resetDom(){
        document.querySelector('.view-month .title-wrapper').textContent = '';
        document.querySelector('.view-month .week-wrapper').textContent = '';
        document.querySelector('.view-month .day-wrapper').textContent = '';
        document.querySelector('.view-year .title-wrapper').textContent = '';
        document.querySelector('.view-year .year-wrapper').textContent = '';
        document.querySelector('.view-week .title-wrapper').textContent = '';
        document.querySelector('.view-week .day-wrapper').textContent = '';
        document.querySelector('.view-day .title-wrapper').textContent = '';
        document.querySelector('.view-day .day-wrapper').textContent = '';
    }

    function drawTotal(){
        resetDom()
        themeChange();
        if( opts.showMode === 'day' ){
            settingTodayData();
            templateDayTitleUpdate()
        } else if( opts.showMode === 'week' ){
            settingWeekData();
            templateWeekUpdate();
            templateWeekTitleUpdate();
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
    function templateDayTitleUpdate(){
        const startDate = sharedObj.startDate;
        const text = startDate.format("YYYY-MM-DD");

        templateData.injectModel( sectionTarget.querySelectorAll('.view-day .title-wrapper'), 'todayTitle' , { 'today' : text});
        document.querySelector('.view-day .cross img').addEventListener('click',writeDetail);

        titleUpdate();
    }

    function settingTodayData(){
        templateData.injectModel( sectionTarget.querySelectorAll('.view-day .day-wrapper'), 'todayData' , {});
        const startDate = moment({y: sharedObj.startDate.year(), M: sharedObj.startDate.month(), d: sharedObj.startDate.date()});
        const endDate = getMoment(sharedObj.endDate);
        const targetTdAll = document.querySelectorAll('.view-day .day-wrapper tbody td');
        const mapObj = new Map();

        for( const item of targetTdAll ){
            if( !item.classList.contains('time') ) {
                item.textContent = '';
            }
        }

        const dbData = sharedObj.dbTotalData[startDate.format('YYYY-MM-DD')];
        if( dbData ){
            for( let itemIndex = dbData.length-1; itemIndex >= 0; itemIndex-- ){
                const item = dbData[itemIndex];
                const itemStartDate = moment(item.startDate,'YYYY-MM-DD HH:mm').startOf("hours");
                const itemEndDate = moment(item.endDate,'YYYY-MM-DD HH:mm:ss');
                const tempDay = getMoment(startDate);
                for( let hour = 0; hour < 25; hour++ ){
                    const isBetween = tempDay.isSame(itemStartDate) || tempDay.isAfter(itemStartDate) && tempDay.isBefore(itemEndDate);
                    if( isBetween ){
                        const tartgetTd = targetTdAll[hour*2+1];
                        if( mapObj.get(tartgetTd) ){
                            const before = mapObj.get(tartgetTd).push(item);
                        } else{
                            const before = mapObj.set(tartgetTd,[item]);
                        }
                    }
                    tempDay.add(1,'hours');
                }
            }
        }

        for( const [targetTd, value] of mapObj ){
            const lengthItem = value.length;
            const parentEl = targetTd.parentElement;
            const wrapWidh = (parentEl.clientWidth-50);
            const wrapHeight = targetTd.parentElement.clientHeight;
            let leftIndex = 0;
            for( const item of value  ){
                const tempDiv = document.createElement('div');
                tempDiv.textContent = item.title;
                tempDiv.setAttribute('data-index',getMoment(item.startDate).format('YYYY-MM-DD'));
                tempDiv.setAttribute('data-seq',item.seq);
                tempDiv.style.width = `${wrapWidh/lengthItem}px`
                tempDiv.style.float = 'left';
                tempDiv.style.overflow = 'hidden';
                tempDiv.style['text-overflow'] = 'ellipsis';
                tempDiv.style['white-space'] = 'nowrap';
                tempDiv.style['line-height'] = `${wrapHeight}px`;
                tempDiv.style['cursor'] = `pointer`;
                tempDiv.style['background'] = `${item.bgColor}`;
                tempDiv.style['text-align'] = `center`;
                tempDiv.style['position'] = `absolute`;
                tempDiv.style['top'] = `0`;
                tempDiv.style['left'] = `${leftIndex}px`;
                targetTd.appendChild(tempDiv);
                leftIndex += wrapWidh/lengthItem;

                tempDiv.addEventListener('click',openDetail);
            }
        }

        opts.pickerMinViewMode = '';
        opts.pickerViewMode = '';
        opts.callBackFun = updateTodaydate;

        const weekTarget = document.querySelectorAll('.view-day .day-wrapper thead th');
        const localWeekdate = moment().localeData()._weekdaysMin;
        const day = localWeekdate[startDate.day()];
        const title = `${startDate.format('YYYY-MM-DD')} (${day})`;
        weekTarget[1].textContent = title;
    }

    function templateWeekUpdate(){
        const startDate = getMoment(sharedObj.startDate);
        const endDate = getMoment(sharedObj.endDate);
        const endWeekday = moment().endOf('week').weekday();
        const weekTarget = document.querySelectorAll('.view-week .day-wrapper thead th');
        const localWeekdate = moment().localeData()._weekdaysMin;
        for( let index=1; index < 8; index++ ){
            const day = localWeekdate[startDate.day()];
            const title = `${startDate.format('YYYY-MM-DD')} (${day})`;
            weekTarget[index].textContent = title;
            startDate.add(1,'day')
        }
    }

    function settingWeekData(){
        templateData.injectModel( sectionTarget.querySelectorAll('.view-week .day-wrapper'), 'weekDayData' , {});
        const startDate = moment({y: sharedObj.startDate.year(), M: sharedObj.startDate.month(), d: sharedObj.startDate.date()});
        const targetTdAll = document.querySelectorAll('.view-week .day-wrapper tbody td');
        const mapObj = new Map();

        for( const item of targetTdAll ){
            if( !item.classList.contains('time') ) {
                item.textContent = '';
            }
        }

        for( let index=1; index < 8; index++ ){
            const dbData = sharedObj.dbTotalData[startDate.format('YYYY-MM-DD')];
            if( dbData ){
                for( let itemIndex = dbData.length-1; itemIndex >= 0; itemIndex-- ){
                    const item = dbData[itemIndex];
                    const itemStartDate = moment(item.startDate,'YYYY-MM-DD HH:mm').startOf("hours");
                    const itemEndDate = moment(item.endDate,'YYYY-MM-DD HH:mm:ss');
                    const tempDay = getMoment(startDate);
                    for( let hour = 0; hour < 25; hour++ ){
                        const isBetween = tempDay.isSame(itemStartDate) || tempDay.isAfter(itemStartDate) && tempDay.isBefore(itemEndDate);
                        if( isBetween ){
                            const tartgetTd = targetTdAll[hour*8 + index];
                            if( mapObj.get(tartgetTd) ){
                                const before = mapObj.get(tartgetTd).push(item);
                            } else{
                                const before = mapObj.set(tartgetTd,[item]);
                            }
                        }
                        tempDay.add(1,'hours');
                    }
                }
            }
            
            startDate.add(1,'day')
        }

        for( const [targetTd, value] of mapObj ){
            const lengthItem = value.length;
            const parentEl = targetTd.parentElement;
            const wrapWidh = (parentEl.clientWidth-50)/7;
            const wrapHeight = targetTd.parentElement.clientHeight;
            let leftIndex = 0;
            for( const item of value  ){
                const tempDiv = document.createElement('div');
                tempDiv.textContent = item.title;
                tempDiv.setAttribute('data-index',getMoment(item.startDate).format('YYYY-MM-DD'));
                tempDiv.setAttribute('data-seq',item.seq);
                tempDiv.style.width = `${wrapWidh/lengthItem}px`;
                tempDiv.style.float = 'left';
                tempDiv.style.overflow = 'hidden';
                tempDiv.style['text-overflow'] = 'ellipsis';
                tempDiv.style['white-space'] = 'nowrap';
                tempDiv.style['line-height'] = `${wrapHeight}px`;
                tempDiv.style['cursor'] = `pointer`;
                tempDiv.style['background'] = `${item.bgColor}`;
                tempDiv.style['text-align'] = `center`;
                tempDiv.style['position'] = `absolute`;
                tempDiv.style['top'] = `0`;
                tempDiv.style['left'] = `${leftIndex}px`;
                targetTd.appendChild(tempDiv);
                leftIndex += wrapWidh/lengthItem;

                tempDiv.addEventListener('click',openDetail);
            }
        }

        opts.pickerMinViewMode = '';
        opts.pickerViewMode = '';
        opts.callBackFun = updateWeekDate;
    }

    function updateWeekStyle(){
        const targetTdAll = document.querySelectorAll('.view-week .day-wrapper tbody td');
        const targetTdDayAll = document.querySelectorAll('.view-day .day-wrapper tbody td');
        
        for( const item of targetTdAll ){
            const wrapWidh = (item.parentElement.clientWidth -50)/7;
            const innderDiv = item.querySelectorAll('div');
            if( innderDiv.length > 0 ){
                let leftIndex = 0;
                for( const div of innderDiv ){
                    const widh = wrapWidh/innderDiv.length;
                    div.style.width = `${widh}px`
                    div.style['left'] = `${leftIndex}px`;
                    leftIndex += widh;
                }
            }
        }

        for( const item of targetTdDayAll ){
            const wrapWidh = (item.parentElement.clientWidth -50);
            const innderDiv = item.querySelectorAll('div');
            if( innderDiv.length > 0 ){
                let leftIndex = 0;
                for( const div of innderDiv ){
                    const widh = wrapWidh/innderDiv.length;
                    div.style.width = `${widh}px`
                    div.style['left'] = `${leftIndex}px`;
                    leftIndex += widh;
                }
            }
        }
    }

    function templateWeekTitleUpdate(){
        templateData.injectModel( sectionTarget.querySelectorAll('.view-week .title-wrapper'), 'weekTitleData' , {});
        const startDate = sharedObj.startDate;
        const titleTarget = document.querySelector('.view-week .title-wrapper .month-title');
        titleTarget.textContent = startDate.format("YYYY-MM-DD");

        document.querySelector('.view-week .cross img').addEventListener('click',writeDetail);
        titleUpdate();
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
                startDate = getMoment(selectedDate).startOf('week');
                endDate = getMoment(selectedDate).endOf('week');
                break;
            case 'day' : 
                    startDate = getMoment(selectedDate);
                    endDate = getMoment(selectedDate);
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
        
        const colorSet = ['#F3FBFF','#DFF3FF','#C9EBFF','#FAFBE9','#AAA9A2'];
        let colorIndex = 0;

        for( const item of dbTotalData ) {
            const startDate = moment(item['startDate'],'YYYY-MM-DD HH:mm:ss');
            const endDate = moment(item['endDate'],'YYYY-MM-DD HH:mm:ss');
            const seq = item.seq;
            
            if( colorIndex == colorSet.length ){
                colorIndex = 0;
            }
            item.bgColor = colorSet[colorIndex++];

            if( startDate.isValid() && endDate.isValid() ){
                startDate.startOf('day');
                while( startDate.isBefore(endDate) ){
                    const date = startDate.format('YYYY-MM-DD');
                    if( !sharedObj.dbTotalData[date] ){
                        sharedObj.dbTotalData[date] = [item];
                    } else {
                        sharedObj.dbTotalData[date].push(item);
                    }

                    if( !sharedObj.dbTotalDataSeq[date] ){
                        sharedObj.dbTotalDataSeq[date] ={};
                    }
                    sharedObj.dbTotalDataSeq[date][seq] = item;
                     
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
        const write = document.querySelector('.write-dim-layer');
        const closeDom = write.querySelector('.close');

        document.addEventListener('mousedown',addHiddenClass, true);
        window.addEventListener('resize', updateWeekStyle);
        closeDom.removeEventListener('click',htmlRemoveHiden);
        closeDom.addEventListener('click',htmlRemoveHiden);
    }

    function htmlRemoveHiden(){
        document.querySelector('.write-dim-layer').classList.add('hidden');
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
                today.startOf('week').subtract(1,'day')
            } else if( opts.showMode === 'day'){
                today.subtract(1,'day')
            }
        } else if ( target.classList.contains('next') ){
            if( opts.showMode ==='month' ){
                today.endOf('month').add(1,'day')
            } else if( opts.showMode ==='year'){
                today.endOf('year').add(1,'day')
            } else if ( opts.showMode === 'week' ){
                today.endOf('week').add(1,'day')
            } else if( opts.showMode === 'day'){
                today.add(1,'day')
            }
        }

        dayData.value = today.format('YYYY-MM-DD');
        datePickerTitle.updateDate(today);

        if( opts.showMode ==='month' ){
            updateMonthDate( true );
        } else if( opts.showMode ==='year'){
            updateYearDate( true );
        } else if ( opts.showMode === 'week' ){
            updateWeekDate(true);
        } else if( opts.showMode === 'day'){
            updateTodaydate(true);
        }
        
    }

    function updateTodaydate( isForceUpdate ){
        const newDate = getMoment(dayData.value);
        
        if( isForceUpdate || !newDate.isSame(moment({y: sharedObj.pickDate.year(), M: sharedObj.pickDate.month(), d: sharedObj.pickDate.date()})) ){
            monthTitle.textContent = newDate.format("YYYY-MM-DD");
            opts.defaultDate = newDate;
            getDateData(newDate);
            settingTodayData();
        }
    }

    function updateWeekDate( isForceUpdate ){
        const newDate = getMoment(dayData.value);
        
        // 강제로 업데이트 하거나, pick한 날짜가 오늘일 아닐때만 업데이트
        if( isForceUpdate || !newDate.isSame(moment({y: sharedObj.pickDate.year(), M: sharedObj.pickDate.month(), d: sharedObj.pickDate.date()})) ){
            monthTitle.textContent = newDate.format("YYYY-MM-DD");
            opts.defaultDate = newDate;
            getDateData(newDate);
            settingWeekData();
            templateWeekUpdate();
        }
    }

    function updateShowMode( showMode ){
        opts.showMode = showMode;

        getDateData( getMoment(sharedObj.pickDate) );
        drawTotal();
    }
    function templateMonthUpdate(){
        templateData.injectModel( sectionTarget.querySelectorAll('.view-month .day-wrapper'), 'monthDay' , sharedObj.drawObj.month);
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
                    'title' : item.title,
                    'seq' : item.seq
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

        document.querySelector('.schedule-container .close-vertical').addEventListener('click' , writeDetail);
        document.querySelector('.schedule-container .close').addEventListener('click' , (e)=>{
            monthDimLayer.classList.add('hidden');
        })

        document.querySelectorAll('.schedule-container .schedule:not(.today)').forEach( target =>{
            target.addEventListener('click',openDetail);
        })
    }

    function openDetail( event ){
        const currentTarget = event.currentTarget;
        const date = currentTarget.dataset.index;
        const seq = currentTarget.dataset.seq;
        const target = sharedObj.dbTotalDataSeq[date][seq];
        const weekdaysMin = moment.weekdaysMin();
        const startDate = moment(target.startDate,'YYYY-MM-DD HH:mm:ss');
        const endDate = moment(target.endDate,'YYYY-MM-DD HH:mm:ss');

        sharedObj.drawObj.detailPop = {
            'today' : date,
            'title' : target.title,
            'seq' : target.seq,
            'content' : target.content,
            'important' : target.important,
            'startDate' :  startDate.format(`YYYY년 MM월 DD일(${weekdaysMin[startDate.days()]}) HH:mm:ss `),
            'endDate' :  endDate.format(`YYYY년 MM월 DD일(${weekdaysMin[endDate.days()]}) HH:mm:ss `),
            'latitude' : '',
            'longitude'  :''
        }

        templateData.injectModel( document.querySelectorAll('#detail-layer .detail-container'), 'detailPop' , sharedObj.drawObj.detailPop);

        if( target.important !== '1' ){
            document.querySelector('#detail-layer .detail-container #squaredFour').removeAttribute('checked');
        }

        document.querySelector('#detail-layer').classList.remove('hidden');
        document.querySelector('#detail-layer .close').addEventListener('click', ()=>{
            document.querySelector('#detail-layer').classList.add('hidden');
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
        let classT = opts.showMode;
        const viewTheme = document.querySelectorAll('.main-section .view-theme');
        const tartget = document.querySelector(`.main-section .view-${classT}`);
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
            showTimeOption : opts.showTimeOption,
            showDateOption : true,
            showMinutes : true,
            showSeconds : opts.showSeconds,
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

    function writeDetail( event ){
        const currentTarget = event.currentTarget;
        const date = currentTarget.dataset.index ? currentTarget.dataset.index : moment().format('YYYY-MM-DD HH:mm:ss');
        const wrateDom = document.querySelector('.write-dim-layer'); 
        const startCal = wrateDom.querySelector('.write-dim-layer #datetimepicker-start');
        const endCal = wrateDom.querySelector('.write-dim-layer #datetimepicker-end');
        const startDate = moment(date).startOf('day');
        const endDate = moment(date).add(1,'hour');

        wrateDom.classList.remove('hidden');
        wrateDom.querySelector('#detailTitle').value = '';
        wrateDom.querySelector('#detailContent').value = '';
        wrateDom.querySelector('#squaredFour-write').removeAttribute('checked');
        wrateDom.querySelector('#squaredFour-write').checked = false;
        wrateDom.querySelector('#startDate').value = '';
        wrateDom.querySelector('#endDate').value = '';
        wrateDom.querySelector('#detailTitle').focus();

        const startPicker = DatePicker.datetimepicker( startCal,{ 
            showTimeOption : true,
            showDateOption : true,
            showMinutes : true,
            showSeconds : true,
            useToday : true,
            useTodayButton : true,
            language : 'ko',
            direction : 'auto',
            minViewMode : "",
            viewMode : "",
            stepInterval : 5,
            defaultDate : startDate,
            callBackFun : changeStart
         });

         const endPicker = DatePicker.datetimepicker( endCal ,{ 
            showTimeOption : true,
            showDateOption : true,
            showMinutes : true,
            showSeconds : true,
            useToday : true,
            useTodayButton : true,
            language : 'ko',
            direction : 'auto',
            minViewMode : "",
            viewMode : "",
            stepInterval : 5,
            defaultDate : endDate,
            callBackFun : changeEnd
         });

         const sClickPicker = ( startPicker )=>{
            startPicker.show();
         }

         const eClickPicker = ( endPicker )=>{
            endPicker.show();
         }

         wrateDom.querySelector('.start > span:nth-child(2)').removeEventListener('click' ,sClickPicker.bind(null,startPicker));
         wrateDom.querySelector('.start > span:nth-child(2)').addEventListener('click' ,sClickPicker.bind(null,startPicker));
         wrateDom.querySelector('.start-date input[type="text"]').removeEventListener('click' ,sClickPicker.bind(null,startPicker));
         wrateDom.querySelector('.start-date input[type="text"]').addEventListener('click' ,sClickPicker.bind(null,startPicker));
        
         wrateDom.querySelector('.end > span:nth-child(2)').removeEventListener('click' ,eClickPicker.bind(null,endPicker));
         wrateDom.querySelector('.end > span:nth-child(2)').addEventListener('click' ,eClickPicker.bind(null,endPicker));
         wrateDom.querySelector('.end-date input[type="text"]').removeEventListener('click' ,eClickPicker.bind(null,endPicker));
         wrateDom.querySelector('.end-date input[type="text"]').addEventListener('click' ,eClickPicker.bind(null,endPicker));

         wrateDom.querySelector('.reset input').removeEventListener('click', formSubmit);
         wrateDom.querySelector('.reset input').addEventListener('click', formSubmit);


    }

     async function formSubmit(event){
        event.preventDefault()
        
        const wrateDom = document.querySelector('.write-dim-layer');
        const titileDom = wrateDom.querySelector('#detailTitle');
        const contentDom = wrateDom.querySelector('#detailContent');
        const important = wrateDom.querySelector('#squaredFour-write').checked == true ? 1 : 0;
        const startDateDom = wrateDom.querySelector('#startDate');
        const endDateDom = wrateDom.querySelector('#endDate');
        titileDom.classList.remove('validate');
        contentDom.classList.remove('validate');
        startDateDom.classList.remove('validate');
        endDateDom.classList.remove('validate');

        if( !titileDom.value ){
            titileDom.classList.add('validate');
            titileDom.focus();
        } else if( !contentDom.value ){
            contentDom.classList.add('validate');
            contentDom.focus();
        } else if( !startDateDom.value ){
            startDateDom.classList.add('validate');
            startDateDom.focus();
        } else if( !endDateDom.value ){
            endDateDom.classList.add('validate');
            endDateDom.focus();
        } else {
            const formData = new FormData(document.getElementById('api-write'));
            formData.append( "important", important );
           
            const response = await fetch(`${apiServer}/api/cal-one`,{ 
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
                body : JSON.stringify(Object.fromEntries(formData))
            })

            if (response.ok) {
                let json = await response.json();
                if( json.status ){
                    await getAPIData();
                } else {
                    new Error('DB에러');
                }
                
                
            } else {
                new Error('DB에러');
            }

            wrateDom.classList.add('hidden');
            
            const date =  moment(startDateDom.value).format('YYYY-MM-DD') ;
            const daydata = sharedObj.dbTotalData[date];
            const clickItem = sharedObj.drawObj.month.clickItem;
            const clickList = clickItem.clickList = [];
            

            if( daydata ){
                daydata.map( item =>{
                    const className = item.important ==='1' ? 'important': 'normal'
                    clickList.push({
                        'className' : className,
                        'title' : item.title,
                        'seq' : item.seq
                    })
                })
            }
            
            clickItem.today = date;
            templateMonthPopup();
        }
    }
    

    function changeStart(){
        const wrateDom = document.querySelector('.write-dim-layer'); 
        const startCal = wrateDom.querySelector('.write-dim-layer #datetimepicker-start input');
        const hTarget = wrateDom.querySelector('.write-dim-layer .start-date input[type="hidden"]');
        const cTarget = wrateDom.querySelector('.write-dim-layer .start-date input[type="text"]');
        const weekdaysMin = moment.weekdaysMin();
        const momoentC = moment(startCal.value,'YYYY-MM-DD HH:mm:ss');

        hTarget.value = momoentC.format('YYYY-MM-DD HH:mm:ss');
        cTarget.value = momoentC.format(`YYYY년 MM월 DD일 (${weekdaysMin[momoentC.days()]}) HH:mm:ss`);
    }

    function changeEnd(){
        const wrateDom = document.querySelector('.write-dim-layer'); 
        const endCal = wrateDom.querySelector('.write-dim-layer #datetimepicker-end input');
        const hTarget = wrateDom.querySelector('.write-dim-layer .end-date input[type="hidden"]');
        const cTarget = wrateDom.querySelector('.write-dim-layer .end-date input[type="text"]');
        const weekdaysMin = moment.weekdaysMin();
        const momoentC = moment(endCal.value,'YYYY-MM-DD HH:mm:ss');

        hTarget.value = momoentC.format('YYYY-MM-DD HH:mm:ss');
        cTarget.value = momoentC.format(`YYYY년 MM월 DD일 (${weekdaysMin[momoentC.days()]}) HH:mm:ss`);
    }
   
})();

