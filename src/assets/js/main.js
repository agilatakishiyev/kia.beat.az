window.addEventListener('DOMContentLoaded', (e) => {
    let isNameInputFilled = false;
    let isSurNameInputFilled = false;
    const mainForm = document.getElementById('main-form');
    const nameInput = document.getElementById('name-input');
    const surnameInput = document.getElementById('surname-input')
    const centerSection = document.querySelector('.center');
    const generateSection = document.querySelector('.generate');
    const currentUser = localStorage.getItem('user');

    if(currentUser) {
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
                body: JSON.stringify({name: nameInput.value, surname: surnameInput.value}),
            })
            .then(res => res.json())
            .then(res => {
                if(res) {
                    localStorage.setItem('user', JSON.stringify(res));
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

    for (const option of document.querySelectorAll(".custom-option")) {
        option.addEventListener('click', function() {
            if (!this.classList.contains('selected')) {
                this.parentNode.querySelector('.custom-option.selected')?.classList.remove('selected');
                this.classList.add('selected');
                this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
            }
            generateButton.removeAttribute('disabled');
        })
    }

    window.addEventListener('click', function(e) {
        const select = document.querySelector('.custom-select')
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });
});