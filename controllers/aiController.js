const fetch = require('node-fetch');
const Employee = require('../models/Employee');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback model chain — tries each in order if one is rate-limited or unavailable
const MODELS = [
  'deepseek/deepseek-v4-flash:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'openai/gpt-oss-20b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
];

const SYSTEM_PROMPT = `You are an expert HR analyst AI. Analyze employee data and provide structured, actionable recommendations.
Always respond in valid JSON format with these exact keys:
{
  "promotionRecommendation": { "eligible": boolean, "reason": string },
  "trainingSuggestions": [string],
  "aiFeedback": string,
  "overallRating": string (one of: "Excellent", "Good", "Average", "Needs Improvement")
}`;

const callOpenRouter = async (prompt) => {
  let lastError = null;

  for (const model of MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'AI Employee Performance System',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        const errJson = JSON.parse(errText);
        const code = errJson?.error?.code;
        // 429 = rate limited, 404 = unavailable — try next model
        if (code === 429 || code === 404) {
          console.warn(`Model ${model} unavailable (${code}), trying next...`);
          lastError = new Error(errText);
          continue;
        }
        throw new Error(`OpenRouter API error: ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      console.log(`✅ AI response from model: ${model}`);

      // Extract JSON (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) return JSON.parse(jsonMatch[1]);
      return JSON.parse(content);

    } catch (err) {
      if (err.message.includes('429') || err.message.includes('404')) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All AI models are currently unavailable. Please try again later.');
};

// POST /api/ai/recommend  — single employee recommendation
const recommendEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const prompt = `Analyze this employee and provide HR recommendations:
Name: ${employee.name}
Department: ${employee.department}
Skills: ${employee.skills.join(', ') || 'None listed'}
Performance Score: ${employee.performanceScore}/100
Years of Experience: ${employee.experience}

Based on this data, provide:
1. Promotion eligibility with detailed reasoning
2. Training suggestions (list specific skills/courses)
3. Personalized AI feedback for improvement
4. Overall performance rating`;

    const recommendation = await callOpenRouter(prompt);

    res.json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        department: employee.department,
        performanceScore: employee.performanceScore,
        experience: employee.experience,
        skills: employee.skills,
      },
      recommendation,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/rank  — rank all employees with bulk recommendations
const rankEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ performanceScore: -1 });

    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No employees found to rank' });
    }

    const prompt = `Rank and analyze these employees based on performance. Return a JSON array of ranked employees with recommendations.

Employees:
${employees.map((e, i) => `${i + 1}. ${e.name} | ${e.department} | Score: ${e.performanceScore}/100 | Experience: ${e.experience}yrs | Skills: ${e.skills.join(', ')}`).join('\n')}

Respond with a JSON object: { "rankings": [ { "rank": number, "name": string, "promotionEligible": boolean, "rating": string, "keyStrength": string, "improvementArea": string } ] }`;

    const rankData = await callOpenRouter(prompt);

    // Merge AI rankings with DB data
    const enriched = employees.map((emp, index) => {
      const aiRank = rankData?.rankings?.find(r => r.name === emp.name) || {};
      return {
        rank: index + 1,
        employee: emp,
        aiInsights: aiRank,
      };
    });

    res.json({ success: true, count: enriched.length, rankings: enriched });
  } catch (error) {
    next(error);
  }
};

module.exports = { recommendEmployee, rankEmployees };
