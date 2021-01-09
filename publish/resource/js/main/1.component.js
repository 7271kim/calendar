(()=>{
    const calendarIcon = document.getElementById('icon-popup');
    const calendarIconPop = document.getElementById('icon-popup-target');
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
        calendarIconPop.addEventListener('mouseout' ,addHiddenClass);
        calendarIconPop.addEventListener('mouseover' , removeHiddenClass);
    }

    function openDatePicker(e){
        $('#datePicker').datepicker('show');
        var popup =$(this).offset();
        var popupTop = popup.top - 100;
        $('.ui-datepicker').css({
            'top' : popupTop
        });
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
        /* $('#datePicker').datepicker({
		    format: "yyyy년 mm월 dd일",	//데이터 포맷 형식(yyyy : 년 mm : 월 dd : 일 )
		    startDate: '-10y',	//달력에서 선택 할 수 있는 가장 빠른 날짜. 이전으로는 선택 불가능 ( d : 일 m : 달 y : 년 w : 주)
		    endDate: '+10y',	//달력에서 선택 할 수 있는 가장 느린 날짜. 이후로 선택 불가 ( d : 일 m : 달 y : 년 w : 주)
		    autoclose : true,	//사용자가 날짜를 클릭하면 자동 캘린더가 닫히는 옵션
		    calendarWeeks : false, //캘린더 옆에 몇 주차인지 보여주는 옵션 기본값 false 보여주려면 true
		    clearBtn : true, //날짜 선택한 값 초기화 해주는 버튼 보여주는 옵션 기본값 false 보여주려면 true
		    //datesDisabled : ['2019-06-24','2019-06-26'],//선택 불가능한 일 설정 하는 배열 위에 있는 format 과 형식이 같아야함.
		    //daysOfWeekDisabled : [0,6],	//선택 불가능한 요일 설정 0 : 일요일 ~ 6 : 토요일
		    daysOfWeekHighlighted : [0], //강조 되어야 하는 요일 설정
		    disableTouchKeyboard : false,	//모바일에서 플러그인 작동 여부 기본값 false 가 작동 true가 작동 안함.
		    immediateUpdates: true,	//사용자가 보는 화면으로 바로바로 날짜를 변경할지 여부 기본값 :false 
		    //multidate : false, //여러 날짜 선택할 수 있게 하는 옵션 기본값 :false 
		    //multidateSeparator :",", //여러 날짜를 선택했을 때 사이에 나타나는 글짜 2019-05-01,2019-06-01
		    templates : {
		        leftArrow: '&laquo;',
		        rightArrow: '&raquo;'
		    }, //다음달 이전달로 넘어가는 화살표 모양 커스텀 마이징 
		    showWeekDays : true ,// 위에 요일 보여주는 옵션 기본값 : true
		    //title: "테스트",	//캘린더 상단에 보여주는 타이틀
		    todayHighlight : true ,	//오늘 날짜에 하이라이팅 기능 기본값 :false 
		    toggleActive : false,	//이미 선택된 날짜 선택하면 기본값 : false인경우 그대로 유지 true인 경우 날짜 삭제
		    weekStart : 0 ,//달력 시작 요일 선택하는 것 기본값은 0인 일요일 
		    language : "ko",	//달력의 언어 선택, 그에 맞는 js로 교체해줘야한다.
            beforeShow : function (input, inst) {},
            icons: {
				time: "fa fa-clock-o",
				date: "fa fa-calendar",
				up: "fa fa-arrow-up",
				down: "fa fa-arrow-down"
			}
        });//datepicker end */
    }
    //$('#datetimepicker1').datetimepicker({});
    $('#datetimepicker-notime').datetimepicker();
})();   