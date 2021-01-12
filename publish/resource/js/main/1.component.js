import { JTemplate, DatePicker } from "/js/common/component.js";

(()=>{
    const calendarIcon = document.getElementById('icon-popup');
    const calendarIconPop = document.getElementById('icon-popup-target');
    const monthTitleIcon = document.getElementById('title-calendar-icon');
    const monthTitle = document.getElementsByClassName('month-title')[0];

    settingEvent();
    settingDatePicker();

   
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
        calendarIconPop.addEventListener('mouseout' ,addHiddenClass);
        calendarIconPop.addEventListener('mouseover' , removeHiddenClass);
    }

    function openDatePicker(e){
        monthTitleIcon.click();
    }

    function addHiddenClass(e){
        const classList = calendarIconPop.classList.add('hidden');
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
    }

    function settingDatePicker(){
        const target = document.getElementById("datetimepicker-notime");
        const datePicker = DatePicker.datetimepicker( target  ,{ 
            showTimeOption : true,
            showDateOption : true,
            showMinutes : true,
            showSeconds : true,
            useToday : true,
            useTodayButton : true,
            defaultDate : '2021-01-12',
            language : 'ko',
            direction : 'auto',
            minViewMode : '',
            viewMode : '',
            disabledDates : [ '2021.01.13', '2021.03,04' ],
            minDate : '1988.01.11',
            maxDate : '2021.04.11',
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
         });
        console.log(datePicker);
    }
   
})();   