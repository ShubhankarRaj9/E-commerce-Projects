async function getAIRecommendations(req,res,userPrompt,products) {
    const API_KEY = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    try{
        const geminiPrompt =`
            Here is a list of available products:
            ${JSON.stringify(products,null,2)}
            Based on the above products, provide a list of product recommendations for the following user prompt: "${userPrompt}"
            only return product IDs in a JSON format.
        `;
        const response = await fetch(apiUrl,{
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{parts : [{text: geminiPrompt}]}],
                generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
                topP: 0.8
                },
            }),
        });
        if(!response.ok){
            const errorText = await response.text();
            console.error("Gemini API error:", errorText);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch AI recommendations."
            });
        }
        const data = await response.json();
        const aiTextResponse = data?.candidates?.[0].content?.parts?.[0]?.text?.trim() || "";
        const cleanedText = aiTextResponse.replace(/```json|```/g,"").trim();
        if(!cleanedText){
            throw new Error("AI response was empty or invalid.",401);
        }
        let parsedProducts;
        try{
            parsedProducts = JSON.parse(cleanedText);
            console.log("Parsed AI Products:", parsedProducts);
        }catch(err){
            throw new Error("Failed to parse AI response.",401);
        }
        return { success: true, products: parsedProducts};

    }catch(error){
        console.error("Error fetching AI recommendations:", error);
        return res.status(500).json({ 
            success: false, 
            message: "An error occurred while fetching AI recommendations."
        });
    }
}
module.exports =  getAIRecommendations ;