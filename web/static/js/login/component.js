(()=>{
    const loginKaKao = document.querySelector('.kakao-login');
    const loginGoogle = document.querySelector('.google-login');
    loginKaKao.addEventListener('click',(event)=>{
        location.href = '/auth/kakao';
    })
    loginGoogle.addEventListener('click',(event)=>{
        location.href = '/auth/google';
    })
})();

