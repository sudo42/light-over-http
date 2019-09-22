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

api.post('/v1/rs/:unit/:state', (req, res) => {
    const unit = req.params.unit;
    const state = req.params.state;
    tfRsB.switchSocketB(TF_RS_ADDR, unit, state);

    res.status(202).send();
});

api.listen(4221, () => console.info(`Listening on port ${API_PORT}/tcp`));
