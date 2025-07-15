
var express = require('express'),
    router = express.Router();

const path = require('path');

router.use('/api', require('./users'));

router.use(express.static(path.join(__dirname, '../../frontend/dist')));


router.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});
router.get("/api/token.npl", (req, res) => {
  
  console.log("123123");
  const domain = `${req.protocol}://${req.get('host')}`;
  const filePath = path.join(__dirname, '..', 'token.npl');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.status(500).send('Error reading token.npl');

    // Replace {{DOMAIN}} with actual domain
    const modified = content.replace(/{{DOMAIN}}/g, domain);

    console.log(domain);
    res.type('text/plain').send(modified);
  });
});


router.get("/api/tokenlinux.npl", (req, res) => {
  const domain = `${req.protocol}://${req.get('host')}`;
  const filePath = path.join(__dirname, '..', 'tokenlinux.npl');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.status(500).send('Error reading tokenlinux.npl');

    // Replace {{DOMAIN}} with actual domain
    const modified = content.replace(/{{DOMAIN}}/g, domain);

    res.type('text/plain').send(modified);
  });
});

router.get('/', function (req, res) {
   // res.render('index', {title: 'Boilerplate'});
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});


router.get('*', function (req, res) {
    res.status(404).render('error', {
        title: 'Boilerplate', error: {
            status: 404,
            stack: 'Not found'
        }
    });
});

module.exports = router;
