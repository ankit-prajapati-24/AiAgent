const User = require("../models/user");
const History = require("../models/history");
const { contactUsTemplate } = require("../template/contactUs");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

exports.Signup = async (req, res) => {

    try {
        console.log(req.body);
        const { Email, Password, Name } = req.body;
        console.log(req.body, "this is give data");
        const user = await User.findOne({ Email });
        if (user) {
            return res.status(200).json({
                success: false,
                msg: "user already exists"
            }
            );
        }
        const payload = {
            Email: Email,
            Password: Password,
            Name,

        }

        const newUser = await User.create(payload);

        return res.status(200).json({
            success: true,
            msg: "user created successfully",
            user: newUser
        })
    }
    catch (err) {
        res.status(400).json({
            error: err
        })

    }
}


exports.Login = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const user = await User.findOne({ Email });
        if (!user) {
            return res.status(200).json({
                success: false,
                msg: "user does not exists"
            }
            );
        }
        if (user.Password !== Password) {
            return res.status(200).json({
                success: false,
                msg: "password is incorrect"
            }
            );
        }

        return res.status(200).json({
            success: true,
            msg: "user logged in successfully",
            user: user
        })
    }
    catch (err) {
        res.status(400).json({
            error: err
        })
    }
}

exports.history = async (req, res) => {
    try {
        const { email, history } = req.body;
        console.log(email, history);
        // const user = await History.findOne({ email: email });
        // if (!user) {
        //     return res.status(200).json({
        //         success: false,
        //         msg: "user does not exists"
        //     }
        //     );
        // }


        let newHistory = await History.findOneAndUpdate({ email }, { $push: { history: history } }, { new: true });
        return res.status(200).json({
            success: true,
            msg: "history added successfully",
            history: newHistory
        })

    } catch (err) {
        res.status(400).json({
            error: err
        })
    }
}
exports.getHistory = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        const user = await User.find({ email });
        if (!user) {
            return res.status(200).json({
                success: false,
                msg: "user does not exists"
            }
            );
        }
        const history = await History.find({ email });
        return res.status(200).json({
            success: true,
            history: history
        });
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
}
exports.deleteHistoryByIndex = async (req, res) => {
    try {
        const { index, email } = req.body;
        console.log(email, index)
        const userHiistory = await History.findOne({ email });
        console.log(userHiistory)
        if (!userHiistory) {
            return res.json({
                success: false,
                msg: "User history not found"
            })
        }
        if (index >= userHiistory.history.length) {
            return res.json({
                success: false,
                msg: "invalid index"
            })
        }
        userHiistory.history = userHiistory.history.filter((history, i) => i != index);
        console.log(userHiistory.history)
        await userHiistory.save();
        return res.json({
            success: true,
            msg: "User history at index " + index + " has been delted"
        })
    } catch (error) {
        res.status(400).json({
            error: error
        });
    }
}
exports.deleteAllHistory = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)
        const userHistory = await History.findOne({ email });
        if (!userHistory) {
            return res.json({
                success: false,
                msg: "User history not found"
            })
        }
        userHistory.history = [];
        await userHistory.save();
        return res.json({
            success: true,
            msg: "All user history has been deleted"
        })
    } catch (error) {
        res.status(400).json({
            error: error
        });
    }
}

// exports.updateInformation = async (req, res) => {
//     try {
//         console.log("data is here", req.body);
//         const { Email, Birthday, Country, Gender, Name } = req.body;
//         console.log("data is here", req.files);
//         // if()

//         // const Image = null;

//         // console.log(req.body,Image);
//         if (req.files && req.files.Image) {
//             const data = await uploadImageToCloudinary(req.files.Image, process.env.FOLDER_NAME);
//             const user = await User.findOneAndUpdate({ Email: Email },
//                 {
//                     Email: Email,
//                     Birthday: Birthday,
//                     Country: Country,
//                     Gender: Gender,
//                     Image: data.secure_url,
//                     Name: Name
//                 },
//                 {
//                     new: true
//                 }
//             );
//             console.log(user);

//             res.status(200).json({
//                 user
//             });
//         }
//         else {

//             const user = await User.findOneAndUpdate({ Email: Email },
//                 {
//                     Email: Email,
//                     Birthday: Birthday,
//                     Country: Country,
//                     Gender: Gender,
//                     Name: Name
//                 },
//                 {
//                     new: true
//                 }
//             );
//             console.log(user);
//             res.status(200).json({
//                 user
//             });
//         }


//     }
//     catch (err) {
//         res.status(400).json({
//             error: err
//         });
//     }
// }


exports.sendMail = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }
        const referer = req.get("referer");
        // → "http://127.0.0.1:5500/html/contact.html"

        // If you only want the base domain (without path)
        const { URL } = require("url");
        let clientDomain = null;
        if (referer) {
            const parsed = new URL(referer);
            clientDomain = `${parsed.protocol}//${parsed.host}`;
            // → "http://127.0.0.1:5500"
        }
        mailSender(email, "Thanks for contacting us", contactUsTemplate(name, message, clientDomain));
        res.status(200).json({
            success: true,
            msg: "mail sent successfully"
        });
    }
    catch (err) {
        res.status(400).json({
            error: err
        });
    }
}

