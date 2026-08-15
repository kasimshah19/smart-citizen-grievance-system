const Groq = require("groq-sdk");

let groq = null;

if (process.env.GROQ_API_KEY) {
    try {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    } catch (error) {
        console.warn("Failed to initialize Groq client. Check your GROQ_API_KEY.");
    }
} else {
    console.warn("GROQ_API_KEY is not defined. AI features will fallback to default logic.");
}

/**
 * Analyzes the complaint title and description using Groq LLM to determine Priority.
 * @param {string} title - The complaint title.
 * @param {string} description - The complaint description.
 * @returns {Promise<string>} - Returns "Low", "Medium", "High", or "Emergency". Defaults to "Medium".
 */
const analyzeComplaintPriority = async (title, description) => {
    if (!groq) return "Medium";

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a civic issue priority discriminator for a grievance system. 
You must respond with EXACTLY ONE WORD from the following list indicating the severity of the issue: 
Low, Medium, High, Emergency. 
Respond with NOTHING ELSE. No extra text, no punctuation.

Guidelines:
- "Emergency": Immediate physical danger to life or severe property damage (e.g., live sparking wire, collapsing structure, massive fire).
- "High": Urgent issues requiring quick attention but not life-threatening (e.g., burst main water pipe, large open manhole, massive traffic block).
- "Medium": Standard issues (e.g., pothole, street light not working, mild water scarcity).
- "Low": Trivial or aesthetic issues (e.g., slightly overgrown grass, minor paint chipping on public walls).`,
                },
                {
                    role: "user",
                    content: `Title: ${title}\nDescription: ${description}`,
                },
            ],
            model: "llama3-8b-8192", // Fast, lightweight, free Groq model
            temperature: 0.1, // Low temp for deterministic categorical output
            max_tokens: 10,
        });

        const aiResponse = completion.choices[0]?.message?.content?.trim() || "";

        const validLevels = ["Low", "Medium", "High", "Emergency"];
        const matched = validLevels.find(level => aiResponse.includes(level));

        return matched || "Medium";
    } catch (error) {
        console.error("Groq AI Priority Analysis Error:", error);
        return "Medium"; // graceful fallback
    }
};

module.exports = {
    analyzeComplaintPriority,
};
