const OpenAI = require('openai');
const readlineSync = require('readline-sync')
const User = require("../models/user");
const Blog = require("../models/blog");
const API_KEY = process.env.API_KEY;
const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
    // baseURL: "https://openrouter.ai/api/v1"
});
const { SYSTEM_PROMPT, SYSTEM_PROMPT_SHORT } = require("../utils/data");
const { model } = require('mongoose');

// {
//     // --- WRITE AND CREATE BLOG FLOW ---
// {"type":"user", "user":"Write a 500-word post about the future of AI and create a blog with it titled 'AI's Future' by me."},
// {"type":"plan", "plan":"I will first call the writePost tool to generate the content, then use that content to call the createBlog tool."},
// {"type":"action", "action":"writePost", "input":{"topic":"the future of AI", "length":500}},
// {"type":"observation", "observation":"{success:true, content:'The future of AI is...', msg:'Post generated successfully'}"},
// {"type":"action", "action":"createBlog", "input":{"title":"AI's Future", "author":"me", "content":"The future of AI is..."}},
// {"type":"observation", "observation":"{success:true, msg:'Blog created successfully', id:'54321'}"},
// {"type":"output", "output":"I have written a blog post about the future of AI and created a new blog with the title 'AI's Future'. Your new blog ID is 54321."},

// // --- ENHANCE POST AND UPDATE BLOG FLOW ---
// {"type":"user", "user":"I want to update my blog with ID '12345'. First, proofread this content: 'This is my blog content with sum grammer erors.' and then update the blog."},
// {"type":"plan", "plan":"I will first call the enhancePost tool to proofread the content, then use the corrected content to call the updateBlog tool."},
// {"type":"action", "action":"enhancePost", "input":{"content":"This is my blog content with sum grammer erors.", "enhancement_type":"proofread"}},
// {"type":"observation", "observation":"{success:true, content:'This is my blog content with some grammar errors.', msg:'Content enhanced successfully'}"},
// {"type":"action", "action":"updateBlog", "input":{"id":"12345", "content":"This is my blog content with some grammar errors."}},
// {"type":"observation", "observation":"{success:true, msg:'Blog updated successfully'}"},
// {"type":"output", "output":"I have proofread your content and updated the blog with ID '12345' successfully."},

// }


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
            return { success: false, msg: "Blog ID is required" };
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
            return { success: false, msg: "Blog not found" };
        }

        return { success: true, message: "Blog updated successfully", blog: updatedBlog };
    } catch (err) {
        console.log("Error while updating blog:", err);
        return { success: false, message: "Something went wrong" };
    }
};

const writePost = async (topic, length = 100) => {
    try {

        console.log(topic, length, "this is give data");
        if (!topic) {
            return { success: false, message: "Topic  are required" };
        }
        const messages = [
            // { role: "system", content:  " Always respond in single JSON objects." },
            { role: "user", content: JSON.stringify({ type: "user", user: userMessage }) }
        ];

        const chat = await client.chat.completions.create({

            model: "google/gemma-3n-e2b-it:free",    // ✅ Groq model
            // model: "gpt-4o-mini",    // ✅ Groq model
            messages: messages,
        });
        const raw = `${chat.choices[0].message.content}`;
        return { success: true, message: "Post generated successfully", content: raw };
    }
    catch (err) {
        console.log("error while writing post", err);
    }
}

const AVAILABLE_TOOLS = {
    "loginTool": loginTool,
    "signupTool": signupTool,
    "createBlog": createBlog,
    "deleteBlog": deleteBlog,
    "getAllBlog": getAllBlog,
    "updateBlog": updateBlog,
    "writePost": writePost,

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
            { role: "system", content: SYSTEM_PROMPT_SHORT + " Always respond in single JSON objects." },
            { role: "user", content: JSON.stringify({ type: "user", user: userMessage }) }
        ];

        let maxSteps = 10; // safety
        while (maxSteps-- > 0) {
            // console.log("\n\nMessage so far:", message);
            const chat = await client.chat.completions.create({

                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                // ✅ Groq model
                // model: "google/gemma-3n-e2b-it:free",   // ✅ Groq model
                // model: "gpt-4o-mini",
                messages: messages.slice(-5),
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
                else if (response.action == "writePost") {
                    observation = await tool(response.input.topic, response.input.length);
                }
                console.log("Observation from tool:", observation);
                const content = JSON.stringify({ type: "observation", observation });
                messages.push({ role: "assistant", content: content });
            }
            else if (response.type === "plan") {
                messages.push({ role: "assistant", content: JSON.stringify(response) });
            } else if (response.type === "observation") {
                messages.push({ role: "assistant", content: JSON.stringify(response) });
            }
        }

    } catch (err) {
        res.status(500).json({ message: "Error in chat controller", error: err.message });
    }
}