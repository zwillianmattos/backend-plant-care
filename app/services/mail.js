require('../config/dotenv');

const nodemailer = require('nodemailer');
const { encrypt } = require('../config/crypto');
const { empty } = require('../utils/utils');
const randomize = require('randomatic');
const jwt = require('jsonwebtoken');
const Email = require('email-templates');

module.exports = {
    send(toEmail, subjek, html, param) {

        return new Promise((resolve, reject) => {
            var transporter = nodemailer.createTransport({
                host: process.env.smtp_host,
                port: process.env.smtp_port,
                secure: false,
                debug: true,
                logger: true,
                auth: {
                    user: process.env.smtp_user,
                    pass: process.env.smtp_pass
                },
                tls: {
                    // do not fail on invalid certs
                    rejectUnauthorized: false
                }
            });

            transporter.verify(function (error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            const mailOptions = {
                from: process.env.smtp_user, // sender address
                to: toEmail, // list of receivers
                subject: subjek, // Subject line
                html: html
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                console.log(error, info)
                if (!empty(error)) {
                    reject(error)
                } else {
                    resolve({
                        key: param,
                        message: "Para proceguir verifique sua conta clicando no link de confirmação enviado para o email"
                    })
                }
            });
        });


    },
    sendAccountConfirmation(email) {
        let key = randomize('000000');
        return this.send(email, 'Ativação de conta', TEMPLATE_ATIVACAO('Ativação de conta', `<h1>${key}</h1>`) , key);
    },
    sendAccountRecovery(email) {
        let key = encrypt(email);
        return this.send(email, 'Recuperação de conta', `Clique no botao abaixo para recuperar a conta`, {
            buttons: [
                {
                    url: `${process.env.app_host}/user/accountRecovery/${key.encryptedData}/${key.iv}`,
                    label: "Aqui"
                }
            ]
        });
    }
}


const TEMPLATE_ATIVACAO = (title, mensagem) => {

    return `

    <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;"> 
    <tr style="border-collapse:collapse;"> 
     <td align="left" style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px;"> 
      <!--[if mso]><table width="560"><tr><td width="268" valign="top"><![endif]--> 
      <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
        <tr style="border-collapse:collapse;"> 
         <td width="268" align="left" style="padding:0;Margin:0;"> 
          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
            <tr style="border-collapse:collapse;"> 
             <td class="es-infoblock es-m-txt-c" align="left" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:12px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:14px;color:#CCCCCC;">Plant Care</p></td> 
            </tr> 
          </table></td> 
        </tr> 
      </table> 
    </tr> 
    </table></td> 
    </tr> 
    </table> 
    <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
    <tr style="border-collapse:collapse;"> 
    <td class="es-adaptive" align="center" style="padding:0;Margin:0;"> 
    <table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;"> 
    <tr style="border-collapse:collapse;"> 
     <td style="Margin:0;padding-top:15px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-color:#FFFFFF;" bgcolor="#ffffff" align="left"> 
      <!--[if mso]><table width="560" cellpadding="0" cellspacing="0"><tr><td width="174" valign="top"><![endif]--> 
      <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;"> 
        <tr style="border-collapse:collapse;"> 
         <td class="es-m-p0r" width="174" valign="top" align="center" style="padding:0;Margin:0;"> 
          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
            <tr style="border-collapse:collapse;"> 
             <td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;"><a href="${process.env.app_host}" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#333333;"><img src="data:image/png;base64,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" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" width="250"></a></td> 
            </tr> 
          </table></td> 
        </tr> 
      </table> 
      <!--[if mso]></td></tr></table><![endif]--></td> 
    </tr> 
    </table></td> 
    </tr> 
    </table> 
    
    <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
    <tr style="border-collapse:collapse;"> 
    <td align="center" style="padding:0;Margin:0;"> 
    <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;"> 
    <tr style="border-collapse:collapse;"> 
    <td align="left" style="padding:0;Margin:0;"> 
     
    </tr> 
    </table></td> 
    </tr> 
    </table> 
    <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
    <tr style="border-collapse:collapse;"> 
    <td align="center" style="padding:0;Margin:0;"> 
    <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;"> 
    <tr style="border-collapse:collapse;"> 
    <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;"> 
     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
       <tr style="border-collapse:collapse;"> 
        <td width="560" valign="top" align="center" style="padding:0;Margin:0;"> 
         <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
           <tr style="border-collapse:collapse;"> 
            <td align="left" style="padding:0;Margin:0;padding-bottom:5px;"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#333333;">${title}</h2></td> 
           </tr> 
           <tr style="border-collapse:collapse;"> 
            <td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-bottom:10px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">${mensagem}</p></td> 
           </tr> 
         </table></td> 
       </tr> 
     </table></td> 
    </tr> 
    </table></td> 
    </tr> 
    </table>        
    <!-- <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
    <tr style="border-collapse:collapse;"> 
    <td align="center" style="padding:0;Margin:0;"> 
    <table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;"> 
    <tr style="border-collapse:collapse;"> 
     <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;"> 
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
        <tr style="border-collapse:collapse;"> 
         <td width="560" valign="top" align="center" style="padding:0;Margin:0;"> 
          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
            <tr style="border-collapse:collapse;"> 
             <td align="center" style="padding:0;Margin:0;padding-bottom:10px;"><span class="es-button-border" style="border-style:solid;border-color:#808080;background:#CC0000;border-width:0px;display:inline-block;border-radius:24px;width:auto;"><a href="LINK_URL" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none !important;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;color:#FEFAFA;border-style:solid;border-color:#04CB04;border-width:5px 30px 5px 30px;display:inline-block;background:#04CB04;border-radius:24px;font-weight:normal;font-style:normal;line-height:19px;width:auto;text-align:center;border-left-width:30px;border-right-width:30px;">TEXTO BOTAO</a></span></td> 
            </tr> 
          </table></td> 
        </tr> 
      </table></td> 
    </tr> 
    </table></td> 
    </tr> 
    </table>  -->
    <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
    <tr style="border-collapse:collapse;"> 
    <td align="center" style="padding:0;Margin:0;"> 
    <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"> 
    <tr style="border-collapse:collapse;"> 
     <td align="left" style="padding:0;Margin:0;"> 
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
        <tr style="border-collapse:collapse;"> 
         <td width="600" valign="top" align="center" style="padding:0;Margin:0;"> 
          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
            <tr style="border-collapse:collapse;"> 
             <td align="center" style="padding:0;Margin:0;padding-bottom:40px;padding-left:40px;padding-right:40px;"> 
              <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                <tr style="border-collapse:collapse;"> 
                 <td style="padding:0;Margin:0px;border-bottom:0px solid #EFEFEF;background:rgba(0, 0, 0, 0) none repeat scroll 0% 0%;height:1px;width:100%;margin:0px;"></td> 
                </tr> 
              </table></td> 
            </tr> 
          </table></td> 
        </tr> 
      </table></td> 
    </tr> 
    
    </table></td> 
    </tr> 
    </table> 
    <table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;"> 
    <tr style="border-collapse:collapse;"> 
    <td align="center" style="padding:0;Margin:0;"> 
    <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#808080;"> 
    <tr style="border-collapse:collapse;"> 
     <td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;"> 
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
        <tr style="border-collapse:collapse;"> 
         <td width="560" valign="top" align="center" style="padding:0;Margin:0;"> 
          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
            <tr style="border-collapse:collapse;"> 
             <td align="center" style="padding:0;Margin:0;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#FFFFFF;">Plant Care - 2021 <br></p></td> 
            </tr> 
          </table></td> 
        </tr> 
      </table></td> 
    </tr> 
    </table></td> 
    </tr> 
    </table> 
    </td> 
    </tr> 
    </table> 
    </div>  
    </body>
    </html>
    
    `
}