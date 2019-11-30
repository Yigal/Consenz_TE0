import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as path from "path";

// TODO: put in ENV file
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "info@consenz.co.il",
    pass: "XXXXXXXXXXXXX",
  },
});

export const sendNotificationsToUsers = (mailList, documentId, subject, body, authDomain) => {
  readHTMLFile(path.join(__dirname + "/../../templates/mailTemplate.html"), function(err, html) {
    mailList.forEach(function(to) {
      const template = handlebars.compile(html);
      const replacements = {
        documentUrl: `https://consenz.co.il/#/document/${documentId}/draft`,
        notificationsOffUrl: `${authDomain}/#/notificationsOff?id=${to}`,
        content: body.content,
        linkText: body.text,
        linkUrl: body.url,
      };
      const htmlToSend = template(replacements);
      const mailOptions = {
        from: "קונסנז <info@consenz.co.il>", // sender address
        subject,
        html: htmlToSend,
      };
      mailOptions["to"] = to;
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) console.log(error);
        else console.log("mail sent to " + to, info);
      });
    });
  });
};

const readHTMLFile = function(pathTo, callback) {
  fs.readFile(pathTo, { encoding: "utf-8" }, function(err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};
