'use strict';

const API = axios({
    url: './v1/rs/',
});

window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', evt => {
        const target = evt.target;
        if (!target.matches('.action')) {
            return true;
        }

        const parent = target.parentElement;
        const lightId = parent.getAttribute('data-light-id');
        const setTo = target.getAttribute('data-set-to');

        API.post(lightId, setTo);
    });
});
