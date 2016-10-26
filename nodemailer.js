var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    secureConnection: true,
    port:465,
    auth: {
        user: 'vainran@163.com',
        pass: '199381qw',
    }
});

// var mailOptions = {
    // from: '"ranwei 👥" <vainran@163.com>',// sender address
    // to: '623992160@qq.com', // list of receivers
    // subject: 'Hello ✔', // Subject line
    //text: 'Hello world ranwei',// plaintext body
    // html: '<br/><br/><b>Hello world ✔</b>',// html body
    // generateTextFromHtml: true
// };

// transporter.sendMail(mailOptions, function(error, info){
    // if(error){
        // console.log(error);
    // }else{
        // console.log('Message sent: ' + info.res);
    // }
// });



module.exports = function (to, sub, html, callback) {
    var options = {
        from: '"rianran1993 👥" <vainran@163.com>',// sender address
        to: to, // list of receivers
        subject: sub, // Subject line
        //text: 'Hello world ranwei',// plaintext body
        html: html,// html body
        generateTextFromHtml: true 
    };
    transporter.sendMail(options, function(error, info){
        if(error){
            callback(error);
            return;
        }else{
            callback(null, {
				'ok': 1, 
				'messageSent':  info.response
			});
        }
    });
};