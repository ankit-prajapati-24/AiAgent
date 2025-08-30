const User = require("../models/user");
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