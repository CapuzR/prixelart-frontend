const userService = require("../userServices/userServices");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "2021646eb484aae665e0d3b213425f1b",
});
//Es importante modificar userService por userServices.

//CRUD
//Create: /user/userAuthControllers.js

async function readUserById(req, res) {
  try {
    const readedUser = await userService.readUserById(req.user);
    return res.send(readedUser);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function readUserByUsername(req, res) {
  try {
    return await userService.readUserByUsername(req);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function updateUser(req, res) {
  try {
    const user = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      login_count: req.login_count,
    };
    const updatedUser = await userService.updateUser(user);
    return res.send(updatedUser);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readUserByAccount = async (req, res) => {
  try {
    const account = req.body.account;
    const getUser = await userService.readUserByAccount(account);
    return res.send(getUser);
  } catch (error) {
    res.status(500).send(error);
  }
};

async function disableUser(req, res) {
  try {
    const disabledUser = await userService.disableUser(req.body);
    return res.send(disabledUser);
  } catch (err) {
    res.status(500).send(err);
  }
}

const testEmails = async () => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "2021646eb484aae665e0d3b213425f1b",
  });
  try {
    mg.messages
      .create("sandbox2e58b581f9484b3ab04e21a4b110a37f.mailgun.org", {
        from: "Mailgun Sandbox <postmaster@sandbox2e58b581f9484b3ab04e21a4b110a37f.mailgun.org>",
        to: ["Edward <iamwar2070@gmail.com>"],
        subject: "Hello Edward",
        text: "Congratulations Edward, you just sent an email with Mailgun! You are truly awesome!",
      })
      .then((msg) => console.log(msg))
      .catch((err) => console.error(err));
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  readUserById,
  readUserByUsername,
  readUserByAccount,
  updateUser,
  disableUser,
  testEmails,
};

//CRUD END
