const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
var SdkInstanceFactory = require('balena-sdk');
var sdk;

const PORT = 80;
app.use('/flash', express.static(__dirname + '/index.html'));

// default options
app.use(fileUpload());

app.use(express.static('public'));

app.get('/ping', function(req, res) {
    res.send('pong');
});

app.post('/upload', function(req, res) {
    let firmware;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send('No files were uploaded.');
        return;
    }

    firmware = req.files.firmware;

    uploadPath = '/data/' + firmware.name;

    // if (firmware.mimetype != 'text/x-hex') {
    //     console.error('Incorrect file type ', firmware.mimetype);
    //     return;
    // }

    firmware.mv(uploadPath, function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        res.send('File uploaded to ' + uploadPath);
        if (sdk) {
            // set the 'stats.lastrequest' tag but w/o blocking the response
            sdk.models.device.tags
                .set(process.env.BALENA_DEVICE_UUID, 'firmware', firmware.name)
                .catch(function(e) {
                    console.error('Error while setting firmware tag', e);
                });

            sdk.models.device.envVar
                .remove(process.env.BALENA_DEVICE_UUID, 'FLASHED')
                .catch(function(e) {
                    console.error('Error while setting envar', e);
                });

            sdk.models.device.envVar
                .set(process.env.BALENA_DEVICE_UUID, 'FIRMWARE', firmware.name, function() {
                    sdk.models.device
                        .startService(process.env.BALENA_DEVICE_UUID, 'openocd')
                        .catch(function(e) {
                            console.error('Error while restarting webserver', e);
                        });
                })
                .catch(function(e) {
                    console.error('Error while setting envar', e);
                });
        }
    });
});

app.listen(PORT, function() {
    console.log('Express server listening on port ', PORT); // eslint-disable-line
    sdk = SdkInstanceFactory();
    sdk.auth.logout();
    sdk.auth.loginWithToken(process.env.BALENA_API_KEY);
});