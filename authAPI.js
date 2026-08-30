import exp from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
export const authRoute = exp.Router();

//User registration(Job Seeker or Employer account creation)
authRoute.post("/register", async (req, res) => {
  //get user from client
  let newUser = req.body;
  //only jobseeker/employer can self register, admin is created directly in db
  if (newUser.role !== "EMPLOYER") {
    newUser.role = "JOBSEEKER";
  }
  //hash the password
  let hashedPassword = await hash(newUser.password, 12);
  //replace plain password with hasedpassword
  newUser.password = hashedPassword;
  //save in db
  let userDocument = await UserModel.create(newUser);
  //send res
  res.status(201).json({ success: true, message: "User registered", data: userDocument });
});

//User Login(any role)
authRoute.post("/login", async (req, res) => {
  //get user cred object
  let credObj = req.body;
  //verify email
  let user = await UserModel.findOne({ email: credObj.email });
  //if email not found
  if (user === null) {
    res.status(404).json({ success: false, message: "Invalid Email" });
  } else if (user.active === false) {
    //account deactivated by admin
    res.status(403).json({ success: false, message: "Your account has been deactivated" });
  } else {
    //compare passwords
    let result = await compare(credObj.password, user.password);
    //if passwords not matched
    if (result === false) {
      res.status(404).json({ success: false, message: "Invalid Password" });
    } else {
      // create encoded(signed) JWT token
      let signedToken = jwt.sign({ id: user._id, role: user.role }, "abcdef", { expiresIn: "1d" });
      //store token in cookie storage as httpOnly cookie
      res.cookie("accessToken", signedToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      //send signed token to client
      res.status(200).json({ success: true, message: "Login success", role: user.role });
    }
  }
});

// User logout(any role)
authRoute.post("/logout", async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).json({ success: true, message: "Logout success" });
});
