import os
import traceback
import json
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ============================================================
# CHECK API KEY ON STARTUP
# ============================================================
api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    print("❌ ERROR: DEEPSEEK_API_KEY not found in .env file")
    exit(1)
else:
    print(f"✅ API key loaded")

# ============================================================
# GITHUB CONFIGURATION (for saving feedback)
# ============================================================
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # Add this to your Hugging Face secrets
GITHUB_REPO = "rexxgit/marketing-system"
GITHUB_FEEDBACK_PATH = "feedback/"

# ============================================================
# INITIALIZE OPENROUTER CLIENT
# ============================================================
client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "https://marketing-system-api.onrender.com",
        "X-Title": "Marketing Strategy System"
    }
)

# ============================================================
# TEST OPENROUTER CONNECTION ON STARTUP
# ============================================================
print("🔌 Testing OpenRouter connection...")
try:
    test_response = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{"role": "user", "content": "Say 'OK'"}],
        max_tokens=3,
        temperature=0
    )
    print("✅ OpenRouter + DeepSeek connection successful!")
    ACTIVE_MODEL = "deepseek/deepseek-chat"
except Exception as e:
    print(f"⚠️ DeepSeek failed, trying fallback...")
    try:
        test_response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'OK'"}],
            max_tokens=3,
            temperature=0
        )
        print("✅ OpenRouter + GPT-3.5-Turbo successful!")
        ACTIVE_MODEL = "openai/gpt-3.5-turbo"
    except Exception as e2:
        print(f"❌ OpenRouter failed: {e2}")
        exit(1)

app = Flask(__name__)
CORS(app)

# ============================================================
# CREATE FEEDBACK DIRECTORY (Hugging Face local)
# ============================================================
FEEDBACK_DIR = "feedback"
if not os.path.exists(FEEDBACK_DIR):
    os.makedirs(FEEDBACK_DIR)
    print(f"📁 Created feedback directory: {FEEDBACK_DIR}")

# ============================================================
# ADD AFTER REQUEST HEADER
# ============================================================
@app.after_request
def add_header(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response

# ============================================================
# FUNCTION TO SAVE TO GITHUB
# ============================================================
def save_to_github(feedback_data, filename):
    """Save feedback file to GitHub repository"""
    if not GITHUB_TOKEN:
        print("⚠️ No GITHUB_TOKEN found, skipping GitHub save")
        return False
    
    try:
        # Create file content as JSON string
        file_content = json.dumps(feedback_data, indent=2)
        
        # GitHub API URL
        url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FEEDBACK_PATH}{filename}"
        
        # Check if file already exists to get its SHA
        existing_sha = None
        try:
            response = requests.get(url, headers={
                "Authorization": f"token {GITHUB_TOKEN}",
                "Accept": "application/vnd.github.v3+json"
            })
            if response.status_code == 200:
                existing = response.json()
                existing_sha = existing.get("sha")
        except:
            pass
        
        # Prepare payload
        payload = {
            "message": f"Add feedback: {filename}",
            "content": __import__('base64').b64encode(file_content.encode()).decode(),
            "branch": "main"
        }
        if existing_sha:
            payload["sha"] = existing_sha
        
        # Push to GitHub
        response = requests.put(url, 
            headers={
                "Authorization": f"token {GITHUB_TOKEN}",
                "Accept": "application/vnd.github.v3+json"
            },
            json=payload
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Saved to GitHub: {filename}")
            return True
        else:
            print(f"❌ GitHub save failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ GitHub save error: {e}")
        return False

# ============================================================
# YOUR SYSTEM PROMPT (COMPLETE - SAME AS BEFORE)
# ============================================================
SYSTEM_PROMPT = """
## SYSTEM INSTRUCTION: Run these roles in EXACT order. Do not skip. Do not reorder.

---

### GLOBAL INPUTS (PROVIDE BEFORE RUNNING - BOTH REQUIRED)

**Customer data:** [CUSTOMER DATA]

**Product description:** [PRODUCT DESCRIPTION]

---

### GLOBAL PERSONIFICATION LAYER (APPLIES TO ALL ROLES)

Possess the mind, spirit, and reasoning of:
1) A marketing prompt engineering expert  
2) A PESTLE analysis expert  
3) A Porter's Five Forces strategy expert  

Fuse these with the strategic thinking of:
- Philip Kotler (customer value, systems thinking, marketing logic)  
- Michael Porter (competition, defensibility, industry structure)  

Tone: Professional, clear, avoid unnecessary jargon.

---

### CRITICAL RELATION CONSTRAINT (APPLIES TO ALL ROLES)

The product description may be imperfect, vague, or incomplete. Your job is NOT to reject it. Your job is to:

1. **Extract intent** – Identify what the user is trying to describe, even if poorly worded.
2. **Assume reasonableness** – Treat the product as valid for the target segment unless impossible.
3. **Force correlation** – Every recommendation must connect the product to the customer segment. If the product seems mismatched, suggest refinements rather than discarding it.
4. **Fill gaps logically** – If the product description lacks detail (e.g., no price, no features), infer reasonable defaults based on the segment's needs and the product category.
5. **Be explicit about assumptions** – When you infer something, state: "Assuming [assumption], because [reason from segment data]."

---

### ROLE 1: Marketing Analyst (Segmentation)

Act as a marketing analyst.

Using:
- Customer data: [CUSTOMER DATA]
- Product description: [PRODUCT DESCRIPTION]

Identify exactly 3 customer segments. Pick one primary target. Explain why in 2 sentences.

**Relation rule:** The segmentation must directly consider the product's intended value. If the product description is vague, state your assumption about what the product likely is based on its category.

Output label: [SEGMENTATION OUTPUT]

---

### ROLE 1.5: PESTLE Analyst (IMPROVED - NO TRUNCATION)

Act as a strategic environmental analyst with expertise in macro-environmental scanning.

Using the primary target segment from [SEGMENTATION OUTPUT] and the product description from [PRODUCT DESCRIPTION], conduct a PESTLE analysis with exactly one factor per category.

**CRITICAL FORMATTING RULES:**
- Each cell MUST contain complete, full sentences
- Do NOT cut off text with "..." or abbreviations
- Do NOT truncate any content
- Each Marketing Implication must be a complete thought (subject + verb + object)
- Use the exact table format below with ALL columns filled completely

Output format:

| Category | Factor (Specific to segment's geography/industry) | Marketing Implication (1 complete sentence) |
|----------|--------------------------------------------------|---------------------------------------------|
| Political | [Full sentence describing political factor affecting the segment] | [Full sentence explaining marketing action] |
| Economic | [Full sentence describing economic factor affecting the segment] | [Full sentence explaining marketing action] |
| Social | [Full sentence describing social factor affecting the segment] | [Full sentence explaining marketing action] |
| Technological | [Full sentence describing technology factor affecting the product] | [Full sentence explaining marketing action] |
| Legal | [Full sentence describing legal/regulatory factor] | [Full sentence explaining marketing action] |
| Environmental | [Full sentence describing environmental factor] | [Full sentence explaining marketing action] |

**For each factor above, add Mini-SWOT in this exact format below the table:**

- **Political Mini-SWOT:** S: [one strength] | W: [one weakness] | O: [one opportunity] | T: [one threat]
- **Economic Mini-SWOT:** S: [one strength] | W: [one weakness] | O: [one opportunity] | T: [one threat]
- **Social Mini-SWOT:** S: [one strength] | W: [one weakness] | O: [one opportunity] | T: [one threat]
- **Technological Mini-SWOT:** S: [one strength] | W: [one weakness] | O: [one opportunity] | T: [one threat]
- **Legal Mini-SWOT:** S: [one strength] | W: [one weakness] | O: [one opportunity] | T: [one threat]
- **Environmental Mini-SWOT:** S: [one strength] | W: [one weakness] | O: [one opportunity] | T: [one threat]

**CRITICAL RULES:**
- Each factor must be specific to the target segment's geography and industry
- No generic factors like "inflation" without context
- No truncated cells — write complete sentences
- Every Marketing Implication must be actionable and specific
- All Mini-SWOT components must be complete phrases

Output label: [PESTLE OUTPUT]

---

### ROLE 1.6: Porter's Five Forces Analyst

Act as a competitive strategy analyst using Michael Porter's framework.

Using:
- [SEGMENTATION OUTPUT]
- [PESTLE OUTPUT]
- [PRODUCT DESCRIPTION]

Analyze industry competitiveness.

Output format:

| Force | Intensity (Low/Medium/High) | Marketing Implication (1 sentence) |
|------|-----------------------------|-----------------------------------|
| Rivalry among existing competitors | | |
| Threat of new entrants | | |
| Threat of substitutes | | |
| Bargaining power of suppliers | | |
| Bargaining power of buyers | | |

Then state:

Overall industry attractiveness: [Attractive / Moderate / Unattractive] because [reason].

Strategic implication for positioning (1 sentence): [Insight]

**Critical rules:**
1) Explain how increasing competitiveness reduces attractiveness strategically  
2) Address competitor attitudes (aggressive, avoidant, resentful, etc.)  
3) Strategy must be defensible, not reactive  
4) The product's category defines the industry boundaries. If the product description is vague, state your assumed industry.

Output label: [PORTER OUTPUT]

---

### ROLE 2: Brand Strategist (Positioning)

Act as a brand strategist.

Using:
- [SEGMENTATION OUTPUT]
- [PESTLE OUTPUT]
- [PORTER OUTPUT]
- [PRODUCT DESCRIPTION]

Write one positioning statement using this exact format:

"For [target] who [need], our brand is [benefit] because [reason]."

**Critical rules:**
- The "because" must reference at least one PESTLE or Porter insight  
- The "our brand is [benefit]" must connect directly to the product description (even if vague, extract the core benefit intent)

Output label: [POSITIONING OUTPUT]

---

### ROLE 3: Marketing Mix Architect (4Ps)

Act as a marketing mix architect.

Using:
- [SEGMENTATION OUTPUT]
- [POSITIONING OUTPUT]
- [PRODUCT DESCRIPTION]

Recommend:

**Product (1 sentence):** Refine or confirm the product based on the segment's needs. If the original product description was vague, add 1-2 clarifying details that align with the segment. State any assumptions explicitly.

**Price (1 sentence):** Recommend a pricing strategy appropriate for the product category and segment income level.

**Place (1 sentence):** Recommend distribution channels based on segment geography and behavior.

**Promotion (1 sentence):** Recommend messaging and channels based on segment psychographics.

**Relation rule:** Every P must explicitly reference either the product description or an assumption derived from it.

Output label: [4Ps OUTPUT]

---

### ROLE 4: Strategic Analyst (SWOT + Micro-SWOT)

Act as a strategic analyst with the mind of Philip Kotler.

Using:
- [SEGMENTATION OUTPUT]
- [POSITIONING OUTPUT]
- [4Ps OUTPUT]

**Part A: Standard SWOT**
- Strengths (3 items, internal, helpful)
- Weaknesses (3 items, internal, harmful)
- Opportunities (3 items, external, helpful)
- Threats (3 items, external, harmful)

**Part B: Micro-SWOT (per 4P)**

Product: [Strength & Weakness in one sentence] | [Opportunity & Threat in one sentence]  
Price: [Strength & Weakness in one sentence] | [Opportunity & Threat in one sentence]  
Place: [Strength & Weakness in one sentence] | [Opportunity & Threat in one sentence]  
Promotion: [Strength & Weakness in one sentence] | [Opportunity & Threat in one sentence]  

**Critical rules:**
- No generic terms  
- Each item must connect to another (correlation)  
- Avoid short-term thinking; show long-term chain  
- If the product description was imperfect, include a weakness/opportunity about product refinement

Output label: [SWOT OUTPUT]

---

### ROLE 5: Analytics Manager (KPI + Budget)

Act as an analytics manager with a Philip Kotler-level mindset.

Using:
- [4Ps OUTPUT]
- [SWOT OUTPUT]
- [PRODUCT DESCRIPTION]

1) Define ONE primary KPI (must measure decision impact, not vanity)  
2) Set a realistic target range  

3) Recommend budget allocation (%) across:
- Content Marketing  
- Paid Ads  
- Email Marketing  
- Webinars / Live Demos  
- Tools & Analytics  

Explain:
- Role in funnel (awareness → trust → conversion → optimization)  
- Each must connect to at least one 4P  

4) System Logic (2–3 sentences showing Product → Price → Place → Promotion → KPI chain)

5) Strategic Safeguards:
- Unintended Consequence  
- Tactical Hell Check  
- Lost in Trivia Check  

Output label: [KPI OUTPUT]

---

### ROLE 6: Project Manager (Roadmap)

Act as a project manager.

Using:
- [4Ps OUTPUT]
- [KPI OUTPUT]

Create a 30-day action plan with exactly 5 tasks.

Format each task as:
[Specific, measurable, realistic, time-bound action] by [Owner] because [KPI connection]

**Relation rule:** At least 2 tasks must directly address refining or validating the product if the original description was vague.

Output label: [ROADMAP OUTPUT]

---

### ROLE 7: Design & Media Generator

Act as a creative director and prompt engineer.

Using [SEGMENTATION OUTPUT], [POSITIONING OUTPUT], and [4Ps OUTPUT], generate:

**1. Color Palette:** 4 colors with hex codes and psychological reason, tailored to segment psychographics.

**2. Font Recommendations:** Heading, body, accent fonts (from Figma best practices).

**3. Recommended Diagram Types:** Choose from funnel, flowchart, org chart, data visualization, mind map. Explain what each would visualize for this specific plan.

**4. Image Generation Prompt:** Ready to copy-paste for Midjourney/DALL-E (style, composition, mood, colors, aspect ratio).

**5. Video Generation Prompt:** 15-second vertical script for Runway/Pika with timing splits (0-3s, 3-6s, 6-9s, 9-12s, 12-15s), audio suggestions, and call to action.

**Output format:** Bullet points under each category.

Output label: [DESIGN OUTPUT]

---

## VALIDATION CHECK

Act as a quality assurance analyst.

1) Dependency check: Does each role correctly use previous outputs? (Yes/No + explanation)  
2) Constraint check: Were rules followed (no generic terms, correlations, long-term thinking)?  
3) Relation check: Did the system force correlation between product description and customer segment, despite any imperfection?  
4) Kotler alignment: Does KPI measure decision impact (not activity)?  

Final output: One sentence stating whether the system is ready for production use, plus one sentence noting any assumptions made about the product.
"""

# ============================================================
# FUNCTION TO RUN THE SYSTEM
# ============================================================
def run_system(customer_data: str, product_description: str) -> str:
    filled_prompt = SYSTEM_PROMPT.replace("[CUSTOMER DATA]", customer_data)
    filled_prompt = filled_prompt.replace("[PRODUCT DESCRIPTION]", product_description)
    
    print(f"📊 Request: {len(filled_prompt)} chars, ~{len(filled_prompt)//3} tokens")
    
    stream = client.chat.completions.create(
        model=ACTIVE_MODEL,
        messages=[
            {"role": "system", "content": "You are a strategic marketing system that follows instructions exactly."},
            {"role": "user", "content": filled_prompt}
        ],
        temperature=0.5,
        max_tokens=8000,
        stream=True
    )
    
    result = ""
    for chunk in stream:
        if chunk.choices[0].delta.content:
            result += chunk.choices[0].delta.content
    
    print(f"✅ Response: {len(result)} chars")
    return result


def summarize_plan(plan: str, max_length: int = 300) -> str:
    """Extract summary from the plan"""
    if len(plan) <= max_length:
        return plan
    
    summary = plan[:max_length]
    last_period = summary.rfind('.')
    last_newline = summary.rfind('\n')
    
    break_point = max(last_period, last_newline)
    if break_point > max_length // 2:
        summary = summary[:break_point + 1]
    else:
        summary = summary + "..."
    
    return summary.strip()


# ============================================================
# API ENDPOINTS
# ============================================================
@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data"}), 400
        
        customer_data = data.get("customer_data", "")
        product_description = data.get("product_description", "")
        
        if not customer_data or not product_description:
            return jsonify({"error": "Both fields required"}), 400
        
        print(f"\n📨 New request")
        
        result = run_system(customer_data, product_description)
        return jsonify({"plan": result})
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/feedback", methods=["POST", "OPTIONS"])
def save_feedback():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data"}), 400
        
        vote = data.get("vote", "")
        customer = data.get("customer", "")[:200]
        product = data.get("product", "")[:200]
        plan_summary = data.get("plan_summary", "")[:300]
        timestamp = datetime.now().isoformat()
        
        # Create unique filename
        filename = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')[:-3]}.json"
        
        feedback_data = {
            "id": filename,
            "vote": vote,
            "customer_preview": customer,
            "product_preview": product,
            "plan_summary": plan_summary,
            "timestamp": timestamp,
            "user_agent": request.headers.get("User-Agent", "Unknown")[:200],
            "ip": request.headers.get("X-Forwarded-For", request.remote_addr)
        }
        
        # ============================================================
        # PART 1: Save to Hugging Face (local file)
        # ============================================================
        local_saved = False
        try:
            filepath = os.path.join(FEEDBACK_DIR, filename)
            with open(filepath, 'w') as f:
                json.dump(feedback_data, f, indent=2)
            print(f"📁 Saved to Hugging Face: {filename}")
            local_saved = True
        except Exception as e:
            print(f"❌ Hugging Face save failed: {e}")
        
        # ============================================================
        # PART 2: Save to GitHub (permanent storage)
        # ============================================================
        github_saved = save_to_github(feedback_data, filename)
        
        # ============================================================
        # RETURN RESULT
        # ============================================================
        if local_saved or github_saved:
            return jsonify({
                "status": "ok",
                "message": "Feedback saved successfully",
                "saved_to_huggingface": local_saved,
                "saved_to_github": github_saved
            }), 200
        else:
            return jsonify({
                "status": "warning",
                "message": "Feedback could not be saved"
            }), 500
        
    except Exception as e:
        print(f"❌ Error saving feedback: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/feedback/list", methods=["GET"])
def list_feedback():
    """List all feedback files from Hugging Face"""
    try:
        files = []
        if os.path.exists(FEEDBACK_DIR):
            files = [f for f in os.listdir(FEEDBACK_DIR) if f.endswith('.json')]
        return jsonify({"count": len(files), "files": files}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Marketing System API is running via OpenRouter",
        "status": "healthy",
        "api_key_loaded": bool(api_key),
        "active_model": ACTIVE_MODEL,
        "github_configured": bool(GITHUB_TOKEN)
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": ACTIVE_MODEL})

# ============================================================
# START SERVER
# ============================================================
if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Marketing System Server Starting...")
    print("="*50)
    print(f"📁 Prompt size: {len(SYSTEM_PROMPT)} characters")
    print(f"🔑 API key: {'✓' if api_key else '✗'}")
    print(f"🤖 Active model: {ACTIVE_MODEL}")
    print(f"📁 Feedback directory: {FEEDBACK_DIR}")
    print(f"🐙 GitHub configured: {'✓' if GITHUB_TOKEN else '✗ (add GITHUB_TOKEN to save to GitHub)'}")
    print("="*50)
    print("\n🌐 Server running on Hugging Face Spaces")
    print("="*50 + "\n")
    
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
