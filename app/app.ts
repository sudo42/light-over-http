import * as TF from 'tinkerforge';
import * as express from 'express';

const TF_HOST = 'localhost';
const TF_PORT = 4223;
const TF_ID_RS = 'oon';
const TF_RS_ADDR = 4273;

const API_PORT = 4221;

let tfCon = new TF.IPConnection();
let tfRsB = new TF.BrickletRemoteSwitch(TF_ID_RS, tfCon);

tfCon.connect(TF_HOST, TF_PORT, err => {
    console.error('TF connection failed!', err);
    process.exit(1);
});
tfCon.on(TF.IPConnection.CALLBACK_CONNECTED, r => {
    console.debug('ready!');
    tfRsB.setRepeats(2);
//    tfRsB.switchSocketB(TF_RS_ADDR, 2, 1, ()=>console.debug('ok'),e=>console.error('err', e));
//    console.debug('switched!');
});

console.debug('hooray!');

// process.stdin.on('data', data => {
//     tfCon.disconnect();
//     process.exit(0);
// });

const api = express();

// old, deprecated api
api.post('/v1/rs/:unit/:state', (req, res) => {
    const unit = req.params.unit;
    const state = req.params.state;
    tfRsB.switchSocketB(TF_RS_ADDR, unit, state);

    res.status(202).send();
});

// newer api
api.post('/v1/rs/:unit', (req, res) => {
    const VALUES_ON = ['1','true','on'];
    const VALUES_OFF = ['0','false','off'];
    const unit = req.params.unit;
    let state = req.body;
    let errors = [];

    if (!isFinite(unit) || unit < 1 || (unit > 16 && unit != 255) {
        errors.push({ msg: 'unit has to be an integer between 1 and 16 (255 is allowed, too)', debug: unit });
    }
    if (typeof state === 'undefined' || state === null || state === "") {
        errors.push({ msg: 'body is empty', debug: state });
    }
    if (VALUES_ON.includes(state)) {
        state = 1;
    } else if (VALUES_OFF.includes(state)) {
        state = 0;
    } else {
        errors.push({ msg: `body has to be one be one of these: ${[...VALUES_ON, ...VALUES_ON].concat(', ')}`, debug: state });
    }
    if (errors.length) {
        return res.status(400).json({ errors });
    }


    tfRsB.switchSocketB(TF_RS_ADDR, unit, state);

    return res.status(202).send();
});

api.use(express.static('static'));
api.listen(4221, () => console.info(`Listening on port ${API_PORT}/tcp`));
