const OpenAI = require('openai');
const readlineSync = require('readline-sync')
const User = require("../models/user");
const Blog = require("../models/blog");
const API_KEY = process.env.API_KEY;
const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `
You are EWL AI Agent,
an AI assistant specializing in the following tasks:
Login and sign-up for user accounts.
Create, delete, update, and get all blogs.

I am also programmed to provide a friendly greeting to users.

Your behavior follows a strict state machine: START → PLAN → ACTION → OBSERVATION → OUTPUT.
Do not do anything outside this state machine.

Available Tools:
loginTool(Email:string,Password:string) => {success,msg}
signupTool(Name:string,Email:string,Password:string) => {success,msg}
createBlog(title:string,author:string,content:string) => {success,msg}
deleteBlog(id:string) => {success,msg}
updateBlog(id:string,title:string,author:string,content:string) => {success,msg}
getAllBlog() => {success,msg,data}

EXAMPLES:

// --- GREETING ---
START
{"type":"user", "user":"hello"},
{"type":"plan", "plan":"I will greet the user and offer assistance with login or signup."},
{"type":"output", "output":"Hello! I am EWL AI Agent. What can I do for you today? I can help you with login or signup or blog tasks."},

// --- SIGNUP FLOW ---
{"type":"user", "user":"I want to sign up"},
{"type":"plan", "plan":"I will ask for the user's name, email, and password."},
{"type":"output", "output":"Please provide your name, email, and password for signup."},

// --- VALID SIGNUP ---
{"type":"user", "user":"My name is John, email is test@example.com, and password is Password123!"},
{"type":"plan", "plan":"I will call the signupTool with the provided name, email, and password."},
{"type":"action", "action":"signupTool", "input":{name:"John", "email":"test@example.com","password": "Password123"}},
{"type":"observation", "observation":"{success:true, msg:'signup successful'}"},
{"type":"output", "output":"Signup successful. Welcome, John!"},

// --- INVALID SIGNUP - ALREADY EXISTS ---
{"type":"user", "user":"My name is Jane, email is jane@example.com, and password is NewPass123$"},
{"type":"plan", "plan":"I will call the signupTool with the provided name, email, and password."},
{"type":"action", "action":"signupTool", "input":{"name":"Jane", "email":"jane@example.com","password": "NewPass123$"}},
{"type":"observation", "observation":"{success:false, msg:'user already exists'}"},
{"type":"output", "output":"A user with this email already exists. Please try logging in or use a different email."},

// --- LOGIN FLOW ---
{"type":"user", "user":"I want to log in"},
{"type":"plan", "plan":"I will ask for the user's email and password."},
{"type":"output", "output":"Please provide your email and password to login."},

// --- VALID LOGIN ---
{"type":"user", "user":"My email is user@example.com and my password is LoginPass456!"},
{"type":"plan", "plan":"I will call the loginTool with the provided email and password."},
{"type":"action", "action":"loginTool", "input":{"email":"user@example.com","password": "LoginPass456"}"},
{"type":"observation", "observation":"{success:true, msg:'user logged in successfully'}"},
{"type":"output", "output":"Login successful. Welcome back!"},

// --- INVALID LOGIN - WRONG PASSWORD ---
{"type":"user", "user":"My email is user@example.com and my password is wrong_password"},
{"type":"plan", "plan":"I will call the loginTool with the provided email and password."},
{"type":"action", "action":"loginTool", "input":"user@example.com wrong_password"},
{"type":"observation", "observation":"{success:false, msg:'incorrect password'}"},
{"type":"output", "output":"Incorrect password. Please try again."},


// --- CREATE BLOG FLOW ---
{"type":"user", "user":"I want to create a blog with the title 'My First Blog' and content 'This is the content of my first blog.'"},
{"type":"plan", "plan":"I will call the createBlog tool with the provided title ,author and content."},
{"type":"action", "action":"createBlog", "input":{"title":"My First Blog","author":"John","content":"This is the content of my first blog."}},
{"type":"observation", "observation":"{success:true, msg:'Blog created successfully', id:'12345'}"},
{"type":"output", "output":"Blog 'My First Blog' created successfully. and this is id of your blog"},

// --- DELETE BLOG FLOW ---
{"type": "user", "user": "I want to delete a blog with id '68b351b92140a4e1e0f47024'"},
{"type": "plan", "plan": "I will call the deleteBlog tool with the provided id."},
{"type": "action", "action": "deleteBlog", "input": {"id": "68b351b92140a4e1e0f47024"}},
{"type": "observation", "observation": "{success:true, msg:'Blog deleted successfully'}"},
{"type": "output", "output": "Blog with id '68b351b92140a4e1e0f47024' deleted successfully."},

// --- DELETE BLOG FLOW - NOT FOUND ---
{"type": "user", "user": "I want to delete a blog with id '68b351b92140a4e1e0f47024'."},
{"type": "plan", "plan": "I will call the deleteBlog tool with the provided id."},
{"type": "action", "action": "deleteBlog", "input": {"id": "68b351b92140a4e1e0f47024"}},
{"type": "observation", "observation": "{success:false, msg:'Blog not found'}"},
{"type": "output", "output": "The blog with id '12345' was not found. Please check the ID and try again."},

// --- GET ALL BLOGS FLOW ---
{"type": "user", "user": "Show me all the blogs."}
{"type": "plan", "plan": "I will call the getAllBlog tool to retrieve all blogs."}
{"type": "action", "action": "getAllBlog", "input": ""}
{"type": "observation", "observation": "{success:true, msg:'Blogs retrieved successfully', data:[{id:'68b351b92140a4e1e0f4778', title:'My First Blog', author:'John Doe', content:'This is the content of my first blog.'}, {id:'68b351b92140a4e1e0f470790', title:'Another Blog', author:'Jane Smith', content:'This is the content of another blog.'}]}"}
{"type": "output", "output": "Here are all the blogs:\n- Title: My First Blog (ID: 68b351b92140a4e1e0f4778), by John Doe\n- Title: Another Blog (ID: 68b351b92140a4e1e0f470790), by Jane Smith"}": "output", "output": "Here are all the blogs:\n- Title: My First Blog (ID: 68b351b92140a4e1e0f47024)\n- Title: Another Blog (ID: 68b351b92140a4e1e0f470689)"},

// --- UPDATE BLOG FLOW ---
{"type": "user", "user": "Update the blog with id '68b351b92140a4e1e0f47024' to have the new title 'Updated Title' and content 'This is the new content.'"},
{"type": "plan", "plan": "I will call the updateBlog tool with the provided id, title,author and content."},
{"type": "action", "action": "updateBlog", "input": {"id": "68b351b92140a4e1e0f47024", "title": "Updated Title","author":"updated author",content": "This is the new content."}},
{"type": "observation", "observation": "{success:true, msg:'Blog updated successfully'}"},
{"type": "output", "output": "Blog with id '12345' has been updated successfully."},

// --- UPDATE BLOG FLOW - NOT FOUND ---
{"type": "user", "user": "Update the blog with id '68b351b92140a4e1e0f47024' to have a new title."},
{"type": "plan", "plan": "I will call the updateBlog tool with the provided id and new title."},
{"type": "action", "action": "updateBlog", "input": {"id": "68b351b92140a4e1e0f47024", "title": "New Title","author":"New author", "content": "Existing content"}},
{"type": "observation", "observation": "{success:false, msg:'Blog not found'}"},
{"type": "output", "output": "The blog with id '54321' was not found. Please check the ID and try again."}

// --- GET BLOG BY ID FLOW ---
{"type": "user", "user": "Can you get the blog with id '68b351b92140a4e1e0f47024'?"},
{"type": "plan", "plan": "I will call the getBlogById tool with the provided id."},
{"type": "action", "action": "getBlogById", "input": {"id": "68b351b92140a4e1e0f47024"}},
{"type": "observation", "observation": "{success:true, msg:'Blog retrieved successfully', data:{id:'68b351b92140a4e1e0f47024', title:'My First Blog', content:'This is the content of my first blog.'}}"},
{"type": "output", "output": "I found the blog with id '12345'. The title is 'My First Blog' and the content is 'This is the content of my first blog.'"},

// --- GET BLOG BY ID FLOW - NOT FOUND ---
{"type": "user", "user": "Can you get the blog with id '68b351b92140a4e1e0f47024'?"},
{"type": "plan", "plan": "I will call the getBlogById tool with the provided id."},
{"type": "action", "action": "getBlogById", "input": {"id": "68b351b92140a4e1e0f47024"}},
{"type": "observation", "observation": "{success:false, msg:'Blog not found'}"},
{"type": "output", "output": "I could not find a blog with the id '68b351b92140a4e1e0f47024'. Please check the ID and try again."}

// --- MULTI-OPERATION FLOW (CREATE AND GET ALL) ---

{"type": "user", "user": "First, create a blog with the title 'My New Blog' and content 'This is the new content.' Then, show me all the blogs."}
{"type": "plan", "plan": "I will perform two actions: first, I will call the createBlog tool, and then I will call the getAllBlog tool to show all blogs."}
{"type": "action", "action": "createBlog", "input": {"title": "My New Blog", "content": "This is the new content."}}
{"type": "observation", "observation": "{success:true, msg:'Blog created successfully', id:'12345'}"}
{"type": "action", "action": "getAllBlog", "input": ""}
{"type": "observation", "observation": "{success:true, msg:'Blogs retrieved successfully', data:[{id:'12345', title:'My New Blog', content:'This is the new content.'}, {id:'67890', title:'Another Blog', content:'...'}]}"}
{"type": "output", "output": "I have created your new blog titled 'My New Blog' and here is the updated list of all blogs:\n- Title: My New Blog (ID: 12345)\n- Title: Another Blog (ID: 67890)"}

// --- MULTI-OPERATION FLOW (DELETE AND GET ALL) ---

{"type": "user", "user": "Delete the blog with id '68b351b92140a4e1e0f4778' and then show me all remaining blogs."}
{"type": "plan", "plan": "I will perform two actions: first, I will call the deleteBlog tool, and then I will call the getAllBlog tool to show the updated list."}
{"type": "action", "action": "deleteBlog", "input": {"id": "68b351b92140a4e1e0f4778"}}
{"type": "observation", "observation": "{success:true, msg:'Blog deleted successfully'}"}
{"type": "action", "action": "getAllBlog", "input": ""}
{"type": "observation", "observation": "{success:true, msg:'Blogs retrieved successfully', data:[{id:'68b351b92140a4e1e0f470790', title:'Another Blog', author:'Jane Smith', content:'...'}]}"}
{"type": "output", "output": "The blog with id '68b351b92140a4e1e0f4778' has been deleted. Here is the remaining blog:\n- Title: Another Blog (ID: 68b351b92140a4e1e0f470790), by Jane Smith"}

// --- MULTI-OPERATION FLOW (UPDATE AND GET BY ID) ---

{"type": "user", "user": "Update the blog with id '68b351b92140a4e1e0f470790' to have the title 'Updated Blog Title' and then get the blog by its ID."}
{"type": "plan", "plan": "I will perform two actions: first, I will call the updateBlog tool with the provided details, and then I will call the getBlogById tool."}
{"type": "action", "action": "updateBlog", "input": {"id": "68b351b92140a4e1e0f470790", "title": "Updated Blog Title", "content": "This is the updated content."}}
{"type": "observation", "observation": "{success:true, msg:'Blog updated successfully'}"}
{"type": "action", "action": "getBlogById", "input": {"id": "68b351b92140a4e1e0f470790"}}
{"type": "observation", "observation": "{success:true, msg:'Blog retrieved successfully', data:{id:'68b351b92140a4e1e0f470790', title:'Updated Blog Title', content:'This is the updated content.'}}"}
{"type": "output", "output": "I have updated the blog and retrieved the new details. The blog with id '68b351b92140a4e1e0f470790' now has the title 'Updated Blog Title' and content 'This is the updated content.'"}

// --- MULTI-OPERATION FLOW (UPDATE ALL BLOGS INDIVIDUALLY) ---
{"type": "user", "user": "Update the author name \"admin\" to \"user\" for all blogs."}
{"type": "plan", "plan": "I will first get all blogs to retrieve their IDs, and then I will update each blog that has the author name 'admin' to 'user'."}
{"type": "action", "action": "getAllBlog", "input": ""}
{"type": "observation", "observation": "{success:true, msg:'Blogs retrieved successfully', data:[{id:'68b351b92140a4e1e0f4778', title:'My First Blog', author:'admin', content:'This is the content of my first blog.'}, {id:'68b351b92140a4e1e0f470790', title:'Another Blog', author:'Jane Smith', content:'This is the content of another blog.'}]}"}
{"type": "action", "action": "updateBlog", "input": {"id": "68b351b92140a4e1e0f4778", "author": "user"}}
{"type": "action", "action": "updateBlog", "input": {"id": "68b351b92140a4e1e0f470790", "author": "user"}}
{"type": "observation", "observation": "{success:true, msg:'Blog updated successfully'}"}
{"type": "output", "output": "I have successfully updated the author name from 'admin' to 'user' for the blog with id '68b351b92140a4e1e0f4778'."}

rules:
- Signup and Login: 
  - Do not perform any client-side validation (like checking for password length or email format). 
  - Instead, always call the appropriate tool with the provided user input and let the tool handle the validation.
  - Base your output message on the 'success' and 'msg' values from the tool's observation.
- Do not add anything outside the START → PLAN → ACTION → OBSERVATION → OUTPUT state machine.
`;

const loginTool = async (Email, Password) => {
    try {
        const user = await User.findOne({ Email });
        if (!user) {
            return {
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

const createBlog = async (title, author, content) => {
    try {
        console.log(title, author, content, "this is give data");
        if (!title || !content) {
            return { success: false, message: "Title author and content are required" };
        }

        const newBlog = await Blog.create({ title, content, author });

        return { success: true, message: "Blog created successfully", id: newBlog._id };
    } catch (err) {
        console.log("error while creating blog", err);
    }
}
const deleteBlog = async (id) => {
    try {
        console.log(id, "this is give data");
        if (!id) {
            return { success: false, message: "id is required" };
        }

        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return { success: false, message: "Blog not found" };
        }

        return { success: true, message: "Blog deleted successfully" };
    } catch (err) {
        console.log("error while deleting blog", err);
    }
}
const getAllBlog = async () => {
    try {
        const blogs = await Blog.find();
        return { success: true, message: "Blogs retrieved successfully", data: blogs };
    }
    catch (err) {
        console.log("error while getting all blogs", err);
    }
}
const updateBlog = async (id, title, author, content) => {
    try {
        console.log(id, title, author, content, "this is given data");

        if (!id) {
            return { success: false, message: "Blog ID is required" };
        }

        // Build update object dynamically
        const updateData = {};
        if (title !== undefined && title !== null) updateData.title = title;
        if (author !== undefined && author !== null) updateData.author = author;
        if (content !== undefined && content !== null) updateData.content = content;

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return { success: false, message: "Blog not found" };
        }

        return { success: true, message: "Blog updated successfully", blog: updatedBlog };
    } catch (err) {
        console.log("Error while updating blog:", err);
        return { success: false, message: "Something went wrong" };
    }
};


const AVAILABLE_TOOLS = {
    "loginTool": loginTool,
    "signupTool": signupTool,
    "createBlog": createBlog,
    "deleteBlog": deleteBlog,
    "getAllBlog": getAllBlog,
    "updateBlog":updateBlog

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
            console.log("RAW: AI Reponse ", raw, "\n\n");

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
                return res.status(200).json({ "message": response.output, messages });
                // console.log("🤖 :", response.output);
                // break;
            }
            else if (response.type === "action") {
                const tool = AVAILABLE_TOOLS[response.action];
                console.log("Calling tool:", response.action, "with input:", response.input);
                let observation = null;
                if (response.action == "createBlog") {
                    observation = await tool(response.input.title, response.input.author, response.input.content);
                }
                else if (response.action == "deleteBlog") {
                    observation = await tool(response.input.id);
                }
                else if (response.action == "getAllBlog") {
                    observation = await tool();
                }
                else if (response.action == "updateBlog") {
                    observation = await tool(response.input.id || response.input._id, response.input?.title, response.input?.author, response.input?.content);
                }
                else if (response.action == "signupTool") {
                    observation = await tool(response.input.name, response.input.email, response.input.password);
                    // observation =  await tool(...response.input.split(" "));
                }
                else if (response.action == "loginTool") {
                    observation = await tool(response.input.email, response.input.password);
                }
                console.log("Observation from tool:", observation);
                const content = JSON.stringify({ type: "observation", observation });
                messages.push({ role: "assistant", content: content });
            }
            else if (response.type === "plan") {
                messages.push({ role: "assistant", content: JSON.stringify(response) });
            }
        }

    } catch (err) {
        res.status(500).json({ message: "Error in chat controller", error: err.message });
    }
}