window.addEventListener('DOMContentLoaded', function () {
    let isNameInputFilled = false;
    let isSurNameInputFilled = false;
    let sendingRequest = false;
    const mainForm = document.getElementById('main-form');
    const nameInput = document.getElementById('name-input');
    const surnameInput = document.getElementById('surname-input')
    const centerSection = document.querySelector('.center');
    const generateSection = document.querySelector('.generate');
    const currentUser = sessionStorage.getItem('user');

    if(currentUser) {
        document.querySelector('.generate__button__open-image-text').setAttribute('data-file-link', `/get-image/${JSON.parse(currentUser).userID}`)
        mainForm.classList.add('d-none');
        centerSection.classList.add('to-top');
        generateSection.classList.remove('not-shown');
    }


    function checkAndActivate () {
        if(isNameInputFilled && isSurNameInputFilled) {
            mainForm.querySelector("button[type='submit']").removeAttribute('disabled');
            nameInput.onkeyup = null;
            surnameInput.onkeyup = null;
        }
    }

    nameInput.onkeyup = function () {
        isNameInputFilled = true;
        checkAndActivate();
    }

    surnameInput.onkeyup = function () {
        isSurNameInputFilled = true;
        checkAndActivate();
    }

    function capitalizeFirstLetter(string) {
        if(typeof string==undefined) return;
        var firstLetter = string[0] || string.charAt(0);
        return firstLetter  ? firstLetter.toUpperCase() + string.substr(1) : '';
     }

    mainForm.onsubmit = function (e) {
        e.preventDefault();
        if(nameInput.value && surnameInput.value) {
            fetch("new-user", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({name: capitalizeFirstLetter(nameInput.value), surname: capitalizeFirstLetter(surnameInput.value)}),
            })
            .then(res => res.json())
            .then(res => {
                if(res) {
                    document.querySelector('.generate__button__open-image-text').setAttribute('href', `/get-image/${res.userID}`)
                    sessionStorage.setItem('user', JSON.stringify(res));
                    mainForm.classList.add('d-none');
                    centerSection.classList.add('to-top');
                    generateSection.classList.remove('not-shown');
                }
            });
        }else {
            return;
        }
    }

    document.querySelector('.custom-select-wrapper').addEventListener('click', function() {
        this.querySelector('.custom-select').classList.toggle('open');
    });

    const generateButton = document.querySelector('.generate__button');
    const generateButtonLoader = generateButton.querySelector('.generate-loader');
    generateButton.onclick = function () {
        if(document.getElementById('download').classList.contains('d-none')){
            generateButton.querySelector('.generate__button__text').classList.add('d-none');
            generateButtonLoader.classList.remove('d-none');
            const user  = JSON.parse(sessionStorage.getItem('user'));
            const city = document.querySelector(".custom-option.selected").getAttribute("data-value");
            if (!sendingRequest) {
                sendingRequest = true;
                fetch("generate", {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        user,
                        city
                    })
                })
                .then(res => {
                    generateButton.classList.add('d-none');
                    document.getElementById('download').classList.remove('d-none');
                });
            }
        }
    }


    for (const option of document.querySelectorAll(".custom-option")) {
        option.addEventListener('click', function() {
            if (!this.classList.contains('selected')) {
                if(this.parentNode.querySelector('.custom-option.selected')) {
                    this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
                }
                this.classList.add('selected');
                this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
            }
            generateButton.removeAttribute('disabled');
            generateButton.classList.remove('d-none');
            generateButtonLoader.classList.add('d-none');
            generateButton.querySelector('.generate__button__text').classList.remove('d-none');
            document.getElementById('download').classList.add('d-none');
            sendingRequest = false;
        })
    }

    window.addEventListener('click', function(e) {
        const select = document.querySelector('.custom-select')
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });

    document.querySelector('.generate__button__open-image-text').onclick = function (e) {
        this.querySelector('span').classList.add('d-none');
        this.querySelector('.save-loader').classList.remove('d-none');
    }

    function log() {
        document.getElementById('download').querySelector('span').classList.remove('d-none');
        document.getElementById('download').querySelector('.save-loader').classList.add('d-none');
    }
      
    // function download(file, callback) {
    //     var request = new XMLHttpRequest();
    //     request.responseType = 'json';
    //     request.open('GET', file);
    //     request.addEventListener('load', function () {
    //         callback(request.response);
    //     });
    //     request.send();
    // }
      
    // function save(object, name) {
    //     var a = document.createElement('a');
    //     a.href = `data:image/jpg;base64,${object}`;
    //     a.download = name;
    //     a.click();
    //     setTimeout(
    //         () => {
    //             log();
    //         }, 
    //         3000
    //     );
    // }
      
    document.querySelector('#download').addEventListener('click', function () {
        
        var a = document.createElement('a');
        a.href = `/get-image/${JSON.parse(sessionStorage.getItem('user')).userID}`;
        a.setAttribute('download', 'true');
        a.click();
        log();
        // download(`get-image/${JSON.parse(sessionStorage.getItem('user')).userID}`, function (response) {
        //     save(response.image, response.name);
        // });
    });
});

window.onload = function () {
    const loadingWrapper = document.querySelector('.loading-wrapper');
    loadingWrapper.classList.add('d-none');
}