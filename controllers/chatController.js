const OpenAI = require('openai');
const readlineSync = require('readline-sync')
const User = require("../models/user");
const API_KEY = process.env.API_KEY;
const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `
You are EWL AI AGETN, an AI assistant specializing in authentication tasks: login and signup.
You also provide a friendly greeting to users.

Your behavior follows a strict state machine: START → PLAN → ACTION → OBSERVATION → OUTPUT.
Do not do anything outside this state machine.

If the user asks for anything other than a greeting, login, or signup, you must deny with:
{"type":"output","output":"I can only help with login and signup."}

Available Tools:
loginTool(Email:string,Password:string) => {success,msg}
signupTool(Name:string,Email:string,Password:string) => {success,msg}

EXAMPLES:

// --- GREETING ---
START
{"type":"user", "user":"hello"},
{"type":"plan", "plan":"I will greet the user and offer assistance with login or signup."},
{"type":"output", "output":"Hello! I am EWL AI AGETN. What can I do for you today? I can help you with login or signup."},

// --- SIGNUP FLOW ---
{"type":"user", "user":"I want to sign up"},
{"type":"plan", "plan":"I will ask for the user's name, email, and password."},
{"type":"output", "output":"Please provide your name, email, and password for signup."},

// --- VALID SIGNUP ---
{"type":"user", "user":"My name is John, email is test@example.com, and password is Password123!"},
{"type":"plan", "plan":"I will call the signupTool with the provided name, email, and password."},
{"type":"action", "action":"signupTool", "input":"John test@example.com Password123!"},
{"type":"observation", "observation":"{success:true, msg:'signup successful'}"},
{"type":"output", "output":"Signup successful. Welcome, John!"},

// --- INVALID SIGNUP - ALREADY EXISTS ---
{"type":"user", "user":"My name is Jane, email is jane@example.com, and password is NewPass123$"},
{"type":"plan", "plan":"I will call the signupTool with the provided name, email, and password."},
{"type":"action", "action":"signupTool", "input":"Jane jane@example.com NewPass123$"},
{"type":"observation", "observation":"{success:false, msg:'user already exists'}"},
{"type":"output", "output":"A user with this email already exists. Please try logging in or use a different email."},

// --- LOGIN FLOW ---
{"type":"user", "user":"I want to log in"},
{"type":"plan", "plan":"I will ask for the user's email and password."},
{"type":"output", "output":"Please provide your email and password to login."},

// --- VALID LOGIN ---
{"type":"user", "user":"My email is user@example.com and my password is LoginPass456!"},
{"type":"plan", "plan":"I will call the loginTool with the provided email and password."},
{"type":"action", "action":"loginTool", "input":"user@example.com LoginPass456!"},
{"type":"observation", "observation":"{success:true, msg:'user logged in successfully'}"},
{"type":"output", "output":"Login successful. Welcome back!"},

// --- INVALID LOGIN - WRONG PASSWORD ---
{"type":"user", "user":"My email is user@example.com and my password is wrong_password"},
{"type":"plan", "plan":"I will call the loginTool with the provided email and password."},
{"type":"action", "action":"loginTool", "input":"user@example.com wrong_password"},
{"type":"observation", "observation":"{success:false, msg:'incorrect password'}"},
{"type":"output", "output":"Incorrect password. Please try again."},

// --- DENY OTHER TASKS ---
{"type":"user", "user":"What is the capital of France?"},
{"type":"output", "output":"I can only help with login and signup."}

rules:
- Signup and Login: 
  - Do not perform any client-side validation (like checking for password length or email format). 
  - Instead, always call the appropriate tool with the provided user input and let the tool handle the validation.
  - Base your output message on the 'success' and 'msg' values from the tool's observation.
- If the user asks for anything other than a greeting, signup, or login, deny immediately.
- Do not add anything outside the START → PLAN → ACTION → OBSERVATION → OUTPUT state machine.
`;

const loginTool = async (Email, Password) => {
    try {
        const user = await User.findOne({ Email });
               if (!user) {
                   return{
                       success: false,
                       msg: "user does not exists"
                   };
               }
               if (user.Password !== Password) {
                   return {
                       success: false,
                       msg: "password is incorrect"
                   };
               }
       
               return {
                   success: true,
                   msg: "user logged in successfully",
                   user: user
               }
    } catch (err) {
        console.log("error while login", err);
    }
}
const signupTool = async (Name, Email, Password) => {
    try {
        //  console.log(req.body, "this is give data");
               const user = await User.findOne({ Email });
               if (user) {
                   return {
                       success: false,
                       msg: "user already exists"
                   }
               }
               const payload = {
                   Email: Email,
                   Password: Password,
                   Name,
       
               }
       
               const newUser = await User.create(payload);
       
               return {
                   success: true,
                   msg: "user created successfully",
                   user: newUser
               }

    } catch (err) {
        console.log("error while login", err);
    }
}

const AVAILABLE_TOOLS = {
    "loginTool": loginTool,
    "signupTool": signupTool
}

function makeValidJSON(input) {
  // Trim spaces
  let data = input.trim();

  // Ensure every object is separated by a comma
  data = data.replace(/}\s*{/g, '},{');

  // Wrap with [ ] to make it a valid JSON array
  if (!data.startsWith("[")) {
    data = "[" + data;
  }
  if (!data.endsWith("]")) {
    data = data + "]";
  }

  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Invalid JSON:", e);
    return [];
  }
}


async function callTool() {
    const message = [
        { role: "system", content: SYSTEM_PROMPT + " Always respond in single JSON objects." }
    ];
    while (true) {

        const userInput = readlineSync.question(" << ");
        message.push({ role: "user", content: JSON.stringify({type:"user",user:userInput}) });

        while (true) {
            // console.log("\n\nMessage so far:", message);
            const chat = await client.chat.completions.create({
                
                model: "meta-llama/llama-4-scout-17b-16e-instruct",   // ✅ Groq model
                messages: message,
                response_format: { type: 'json_object' }
            });

            const raw = `${chat.choices[0].message.content}`;
            console.log("RAW: AI Reponse ",raw,"\n\n");

            let response;
            try {
                response = JSON.parse(raw);
                // response = response[response.length - 1]; // Get the last object in the array
                // console.log("Parsed JSON: ", response);
            } catch (err) { 
                console.error("⚠️ Failed to parse JSON, got:", raw);
                break;
            }

            if (response.type === "output") {
                console.log("🤖 :", response.output);
                break;
            }
            else if (response.type === "action") {
                const tool = AVAILABLE_TOOLS[response.action];
                const observation = await tool(...response.input.split(" "));
                console.log("Observation from tool:", observation);
                const content = JSON.stringify({ type: "observation", observation });
                message.push({ role: "assistant", content: content });
            }
            else if (response.type === "plan") {
                message.push({ role: "assistant", content: JSON.stringify(response) });
            }
        }
    }
}


// callTool();

exports.chatController = async (req, res) => {
    try {
 const { userMessage, history } = req.body;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT + " Always respond in single JSON objects." },
    ...(history || []),
    { role: "user", content: JSON.stringify({ type: "user", user: userMessage }) }
  ];

   while (true) {
            // console.log("\n\nMessage so far:", message);
            const chat = await client.chat.completions.create({
                
                model: "meta-llama/llama-4-scout-17b-16e-instruct",   // ✅ Groq model
                messages: messages,
                response_format: { type: 'json_object' }
            });

            const raw = `${chat.choices[0].message.content}`;
            console.log("RAW: AI Reponse ",raw,"\n\n");

            let response;
            try {
                response = JSON.parse(raw);
                // response = response[response.length - 1]; // Get the last object in the array
                // console.log("Parsed JSON: ", response);
            } catch (err) { 
                console.error("⚠️ Failed to parse JSON, got:", raw);
                break;
            }

            if (response.type === "output") {
                return res.status(200).json({ "message": response.output ,messages});
                // console.log("🤖 :", response.output);
                // break;
            }
            else if (response.type === "action") {
                const tool = AVAILABLE_TOOLS[response.action];
                const observation = await tool(...response.input.split(" "));
                console.log("Observation from tool:", observation);
                const content = JSON.stringify({ type: "observation", observation });
                messages.push({ role: "assistant", content: content });
            }
            else if (response.type === "plan") {
                messages.push({ role: "assistant", content: JSON.stringify(response) });
            }
        }

    }catch (err) {
        res.status(500).json({ message: "Error in chat controller", error: err.message });
    }
}