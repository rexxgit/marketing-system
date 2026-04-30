import os
import traceback
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
        messages=[{"role": "user", "content": "OK"}],
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
            messages=[{"role": "user", "content": "OK"}],
            max_tokens=3,
            temperature=0
        )
        print("✅ OpenRouter + GPT-3.5-Turbo successful!")
        ACTIVE_MODEL = "openai/gpt-3.5-turbo"
    except Exception as e2:
        print(f"❌ OpenRouter failed: {e2}")
        print("   Check your API key and credits at openrouter.ai/credits")
        exit(1)

app = Flask(__name__)

# ============================================================
# MEMORY-OPTIMIZED CORS (Less overhead)
# ============================================================
CORS(app, origins=[
    "https://marketing-system-three.vercel.app",
    "https://marketing-system.vercel.app",
    "http://localhost:5000"
])

# ============================================================
# COMPRESSED SYSTEM PROMPT (Removed extra whitespace, shorter instructions)
# ============================================================
SYSTEM_PROMPT = """## SYSTEM INSTRUCTION: Execute roles in exact order.

### GLOBAL INPUTS
Customer data: [CUSTOMER DATA]
Product description: [PRODUCT DESCRIPTION]

### GLOBAL PERSONIFICATION
Possess the mind of: 1) Marketing prompt engineering expert, 2) PESTLE analysis expert, 3) Porter's Five Forces expert. Fuse with Kotler and Porter. Tone: Professional.

### CRITICAL CONSTRAINT
Product description may be imperfect. Extract intent, assume reasonableness, force correlation to customer segment, fill gaps logically, state assumptions explicitly.

### ROLE 1: Marketing Analyst (Segmentation)
Using customer data and product description, identify exactly 3 customer segments. Pick one primary target. Explain why in 2 sentences.
Output: [SEGMENTATION OUTPUT]

### ROLE 1.5: PESTLE Analyst
Using primary target from[SEGMENTATION OUTPUT], conduct PESTLE analysis with one factor per category: Political, Economic, Social, Technological, Legal, Environmental. Each factor must be specific to segment's geography/industry. Include mini-SWOT per factor (1 S,1 W,1 O,1 T).
Output: [PESTLE OUTPUT]

### ROLE 1.6: Porter's Five Forces Analyst
Using [SEGMENTATION OUTPUT] and [PESTLE OUTPUT], analyze: Rivalry, New Entrants, Substitutes, Supplier Power, Buyer Power. Rate each Low/Medium/High. State overall industry attractiveness and strategic implication.
Output: [PORTER OUTPUT]

### ROLE 2: Brand Strategist (Positioning)
Using [SEGMENTATION OUTPUT],[PESTLE OUTPUT],[PORTER OUTPUT],[PRODUCT DESCRIPTION], write positioning statement: "For [target] who [need], our brand is [benefit] because [reason]." 'Because' must reference PESTLE or Porter insight.
Output: [POSITIONING OUTPUT]

### ROLE 3: Marketing Mix Architect (4Ps)
Using [SEGMENTATION OUTPUT] and [POSITIONING OUTPUT], recommend: Product(1 sentence), Price(1 sentence), Place(1 sentence), Promotion(1 sentence).
Output: [4Ps OUTPUT]

### ROLE 4: Strategic Analyst (SWOT)
Using [SEGMENTATION OUTPUT],[POSITIONING OUTPUT],[4Ps OUTPUT]: Part A: Standard SWOT(3 each S/W/O/T). Part B: Micro-SWOT per 4P. No generic terms, show correlations, long-term chain.
Output: [SWOT OUTPUT]

### ROLE 5: Analytics Manager (KPI+Budget)
Using [4Ps OUTPUT] and [SWOT OUTPUT]: 1) Primary KPI(decision impact, not vanity) with target range. 2) Budget allocation(%) across Content Marketing, Paid Ads, Email, Webinars, Tools/Analytics. Explain funnel role. 3) System Logic(2-3 sentences: Product→Price→Place→Promotion→KPI). 4) Strategic Safeguards(Unintended Consequence, Tactical Hell Check, Lost in Trivia Check).
Output: [KPI OUTPUT]

### ROLE 6: Project Manager (Roadmap)
Using [4Ps OUTPUT] and [KPI OUTPUT]: Create 30-day action plan with exactly 5 tasks. Format: [Specific, measurable, realistic, time-bound task] by Owner because [KPI connection]. At least 2 tasks must address product refinement if description was vague.
Output: [ROADMAP OUTPUT]

### ROLE 7: Design & Media Generator
Using [SEGMENTATION OUTPUT],[POSITIONING OUTPUT],[4Ps OUTPUT]: Generate 1) Color Palette(4 colors with hex, psychological reason), 2) Font Recommendations, 3) Diagram Types(funnel/flowchart/org chart/data viz/mind map) with explanation, 4) Image Prompt for Midjourney/DALL-E, 5) Video Script(15-second vertical with timing splits, audio, CTA).
Output: [DESIGN OUTPUT]

### VALIDATION CHECK
1) Dependency check: Yes/No + explanation. 2) Constraint check: No generic terms, correlations, long-term thinking? 3) Relation check: Correlation forced despite imperfection? 4) Kotler alignment: KPI measures decision impact? Final: One sentence stating production readiness, plus one sentence noting assumptions about product."""

# ============================================================
# MEMORY-OPTIMIZED RUN FUNCTION (Streaming)
# ============================================================
def run_system(customer_data: str, product_description: str) -> str:
    """Replace placeholders and call OpenRouter API with streaming to save memory."""
    filled_prompt = SYSTEM_PROMPT.replace("[CUSTOMER DATA]", customer_data)
    filled_prompt = filled_prompt.replace("[PRODUCT DESCRIPTION]", product_description)
    
    print(f"📊 Request: {len(customer_data)} chars customer, {len(product_description)} chars product")
    print(f"   Total prompt: {len(filled_prompt)} chars, ~{len(filled_prompt)//3} tokens")
    
    # Use streaming to reduce memory pressure
    stream = client.chat.completions.create(
        model=ACTIVE_MODEL,
        messages=[
            {"role": "system", "content": "You are a strategic marketing system. Output complete plan."},
            {"role": "user", "content": filled_prompt}
        ],
        temperature=0.5,
        max_tokens=4000,  # Reduced from 8000 to save memory
        stream=True
    )
    
    # Collect streaming chunks
    result = ""
    for chunk in stream:
        if chunk.choices[0].delta.content:
            result += chunk.choices[0].delta.content
            # Yield to event loop periodically to prevent blocking
            if len(result) % 100 == 0:
                import time
                time.sleep(0.01)
    
    print(f"✅ Response: {len(result)} chars")
    return result

# ============================================================
# API ENDPOINTS
# ============================================================
@app.route("/generate", methods=["POST", "OPTIONS"])
def generate():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data"}), 400
        
        customer_data = data.get("customer_data", "")
        product_description = data.get("product_description", "")
        
        if not customer_data or not product_description:
            return jsonify({"error": "Both fields required"}), 400
        
        print(f"\n📨 Request: {customer_data[:50]}... | {product_description[:50]}...")
        
        result = run_system(customer_data, product_description)
        return jsonify({"plan": result})
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "healthy", "model": ACTIVE_MODEL})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": ACTIVE_MODEL})

# ============================================================
# START SERVER with memory-optimized settings
# ============================================================
if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Marketing System Server (Memory Optimized)")
    print("="*50)
    print(f"📁 Prompt size: {len(SYSTEM_PROMPT)} chars (reduced)")
    print(f"🔑 API key: {'✓' if api_key else '✗'}")
    print(f"🤖 Model: {ACTIVE_MODEL}")
    print("="*50)
    print("🌐 Server running at: http://0.0.0.0:10000")
    print("="*50 + "\n")
    
    # Use port 10000 for Render compatibility
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
