module.exports = (req, res, next) => {
  if (req.user.userType != "admin") {
    return res.redirect("/");
  }
  next();
};
