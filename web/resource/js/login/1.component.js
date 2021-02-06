(()=>{
    const loginKaKao = document.querySelector('.kakao-login');
    loginKaKao.addEventListener('click',(event)=>{
        location.href = '/auth/kakao';
    })
})();