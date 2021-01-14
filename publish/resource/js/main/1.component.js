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
            showTimeOption : false,
            showDateOption : true,
            showMinutes : true,
            showSeconds : false,
            useToday : true,
            useTodayButton : true,
            language : 'ko',
            direction : 'auto',
            minViewMode : '',
            viewMode : '',
            format : '',
            stepInterval : 5
         });
        console.log(datePicker);

    }
   
})();   