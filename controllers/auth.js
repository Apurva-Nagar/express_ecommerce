const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: req.flash("error"),
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((isValid) => {
          if (isValid) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: req.flash("error"),
    oldInput: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postSignup = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  const profileImage = req.file;

  if (!profileImage) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage:
        "Please add a valid image (Supported formats: .PNG, .JPG, .JPEG)",
      oldInput: {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }

  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        username: username,
        email: email,
        password: hashedPassword,
        userType: "shopper",
        cart: { items: [] },
        profileImage: profileImage.path,
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/");
      return transporter.sendMail({
        to: email,
        from: "apurvanagar@gmail.com",
        subject: "Signup successful",
        html: "<h1>You have successfully signed up!</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: req.flash("error"),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with the email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");
        transporter.sendMail({
          to: req.body.email,
          from: "apurvanagar@gmail.com",
          subject: "Request for password reset.",
          html: `
            <p>A password reset was requested by you.</p>
            <p>Please click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password</p>
          `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } })
    .then((user) => {
      res.render("auth/new-password", {
        pageTitle: "Update Password",
        path: "/new-password",
        errorMessage: req.flash("error"),
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { password, userId, token } = req.body;
  let resetUser;

  User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpire = undefined;
      return resetUser.save();
    })
    .then((result) => {
      req.flash("error", "Password Reset Successful");
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
