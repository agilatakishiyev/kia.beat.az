window.addEventListener('DOMContentLoaded', (e) => {
    console.log('document laoded');
    const mainForm = document.getElementById('main-form');
    const centerSection = document.querySelector('.center');
    const generateSection = document.querySelector('.generate');
    const currentUser = localStorage.getItem('user');

    if(currentUser) {
        mainForm.classList.add('d-none');
        centerSection.classList.add('to-top');
        generateSection.classList.remove('not-shown');
    }

    mainForm.onsubmit = function (e) {
        e.preventDefault();
        const name = document.getElementById('name-input').value;
        const surname = document.getElementById('surname-input').value;
        if(name && surname) {
            fetch("new-user", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({name, surname}),
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

    for (const option of document.querySelectorAll(".custom-option")) {
        option.addEventListener('click', function() {
            if (!this.classList.contains('selected')) {
                this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
                this.classList.add('selected');
                this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
            }
        })
    }

    window.addEventListener('click', function(e) {
        const select = document.querySelector('.custom-select')
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });
});