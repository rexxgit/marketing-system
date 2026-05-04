import os
import json
import requests
import base64
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ============================================================
# CONFIGURATION
# ============================================================
api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    print("❌ No API key")
    exit(1)

# GitHub configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = "rexxgit/marketing-system"
GITHUB_FEEDBACK_PATH = "feedback/"

# ============================================================
# OPENROUTER CLIENT
# ============================================================
client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "https://marketing-system-api.onrender.com",
        "X-Title": "Marketing Strategy System"
    }
)

# Test connection
try:
    test = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{"role": "user", "content": "OK"}],
        max_tokens=3
    )
    ACTIVE_MODEL = "deepseek/deepseek-chat"
    print("✅ DeepSeek connected")
except:
    ACTIVE_MODEL = "openai/gpt-3.5-turbo"
    print("✅ GPT-3.5 connected")

app = Flask(__name__)
CORS(app)

# ============================================================
# CREATE FEEDBACK DIRECTORY IN HUGGING FACE REPOSITORY
# ============================================================
FEEDBACK_DIR = "feedback"
if not os.path.exists(FEEDBACK_DIR):
    os.makedirs(FEEDBACK_DIR)
    print(f"📁 Created feedback directory: {FEEDBACK_DIR}")

# Create .gitkeep file so the directory persists in Git
gitkeep_path = os.path.join(FEEDBACK_DIR, ".gitkeep")
if not os.path.exists(gitkeep_path):
    with open(gitkeep_path, 'w') as f:
        f.write("# Feedback directory - JSON files are automatically saved here\n")
    print(f"📁 Created .gitkeep in {FEEDBACK_DIR}")

# ============================================================
# SYSTEM PROMPT
# ============================================================
SYSTEM_PROMPT = """
## SYSTEM INSTRUCTION

Customer data: [CUSTOMER DATA]
Product description: [PRODUCT DESCRIPTION]

### ROLE 1: Segmentation
Identify exactly 3 customer segments. Pick one primary target. Explain why in 2 sentences.

### ROLE 1.5: PESTLE Analysis
Conduct PESTLE with one factor per category. Add mini-SWOT per factor.

### ROLE 1.6: Porter's Five Forces
Analyze rivalry, new entrants, substitutes, supplier power, buyer power.

### ROLE 2: Positioning
Write: "For [target] who [need], our brand is [benefit] because [reason]."

### ROLE 3: 4Ps
Product, Price, Place, Promotion (1 sentence each).

### ROLE 4: SWOT + Micro-SWOT
Standard SWOT + micro-SWOT per 4P.

### ROLE 5: KPI + Budget
One primary KPI, target, budget allocation, logic, safeguards.

### ROLE 6: Roadmap
30-day action plan, 5 tasks.

### ROLE 7: Design & Media
Colors, fonts, diagrams, image prompt, video script.

Output all sections clearly labeled.
"""

def run_system(customer_data, product_description):
    filled = SYSTEM_PROMPT.replace("[CUSTOMER DATA]", customer_data)
    filled = filled.replace("[PRODUCT DESCRIPTION]", product_description)
    
    stream = client.chat.completions.create(
        model=ACTIVE_MODEL,
        messages=[
            {"role": "system", "content": "You are a strategic marketing system. Output complete plan."},
            {"role": "user", "content": filled}
        ],
        temperature=0.5,
        max_tokens=8000,
        stream=True
    )
    
    result = ""
    for chunk in stream:
        if chunk.choices[0].delta.content:
            result += chunk.choices[0].delta.content
    return result


def save_to_github(feedback_data, filename):
    """Save feedback to GitHub repository (permanent)"""
    if not GITHUB_TOKEN:
        print("⚠️ No GITHUB_TOKEN, skipping GitHub save")
        return {"success": False, "reason": "No token"}
    
    try:
        file_content = json.dumps(feedback_data, indent=2)
        encoded_content = base64.b64encode(file_content.encode()).decode()
        
        url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FEEDBACK_PATH}{filename}"
        
        # Check if file already exists to get SHA
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
        
        payload = {
            "message": f"Add feedback: {filename}",
            "content": encoded_content,
            "branch": "main"
        }
        if existing_sha:
            payload["sha"] = existing_sha
        
        response = requests.put(url,
            headers={
                "Authorization": f"token {GITHUB_TOKEN}",
                "Accept": "application/vnd.github.v3+json"
            },
            json=payload
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Saved to GitHub: {filename}")
            return {"success": True, "url": response.json().get("content", {}).get("html_url", "")}
        else:
            print(f"❌ GitHub save failed: {response.status_code}")
            return {"success": False, "reason": f"HTTP {response.status_code}"}
            
    except Exception as e:
        print(f"❌ GitHub save error: {e}")
        return {"success": False, "reason": str(e)}


def save_to_huggingface_repo(feedback_data, filename):
    """Save feedback to Hugging Face Space repository (visible in file browser)"""
    try:
        filepath = os.path.join(FEEDBACK_DIR, filename)
        with open(filepath, 'w') as f:
            json.dump(feedback_data, f, indent=2)
        print(f"✅ Saved to Hugging Face repository: {filepath}")
        
        # Also try to commit to git if possible (Hugging Face Spaces auto-commits)
        return {"success": True, "path": filepath}
    except Exception as e:
        print(f"❌ Hugging Face save error: {e}")
        return {"success": False, "reason": str(e)}


# ============================================================
# API ENDPOINTS
# ============================================================
@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data"}), 400
        
        customer = data.get("customer_data", "")
        product = data.get("product_description", "")
        
        if not customer or not product:
            return jsonify({"error": "Both fields required"}), 400
        
        result = run_system(customer, product)
        return jsonify({"plan": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/feedback", methods=["POST", "OPTIONS"])
def save_feedback():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data"}), 400
        
        timestamp = datetime.now()
        filename = f"feedback_{timestamp.strftime('%Y%m%d_%H%M%S_%f')[:-3]}.json"
        
        feedback_data = {
            "id": filename,
            "timestamp": timestamp.isoformat(),
            "vote": data.get("vote", ""),
            "customer_preview": data.get("customer", "")[:200],
            "product_preview": data.get("product", "")[:200],
            "plan_summary": data.get("plan_summary", "")[:300],
            "user_agent": request.headers.get("User-Agent", "Unknown")[:200],
            "ip": request.headers.get("X-Forwarded-For", request.remote_addr)
        }
        
        # Save to Hugging Face repository (always, visible in file browser)
        hf_result = save_to_huggingface_repo(feedback_data, filename)
        
        # Save to GitHub (if token configured)
        github_result = save_to_github(feedback_data, filename) if GITHUB_TOKEN else {"success": False, "reason": "No token configured"}
        
        return jsonify({
            "status": "ok",
            "message": "Feedback saved",
            "huggingface": hf_result,
            "github": github_result,
            "filename": filename
        }), 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/feedback/list", methods=["GET"])
def list_feedback():
    """List all feedback files from Hugging Face repository"""
    files = []
    if os.path.exists(FEEDBACK_DIR):
        files = [f for f in os.listdir(FEEDBACK_DIR) if f.endswith('.json')]
        files.sort(reverse=True)  # Newest first
    return jsonify({
        "count": len(files),
        "files": files,
        "source": "huggingface_repository",
        "github_repo": f"https://github.com/{GITHUB_REPO}/tree/main/{GITHUB_FEEDBACK_PATH}" if GITHUB_TOKEN else None
    })


@app.route("/feedback/<filename>", methods=["GET"])
def view_feedback(filename):
    """View a specific feedback file from Hugging Face repository"""
    # Security: prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        return jsonify({"error": "Invalid filename"}), 400
    
    filepath = os.path.join(FEEDBACK_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    return jsonify(data)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": ACTIVE_MODEL})


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "healthy",
        "model": ACTIVE_MODEL,
        "github_configured": bool(GITHUB_TOKEN),
        "endpoints": {
            "generate": "POST /generate",
            "feedback": "POST /feedback",
            "list_feedback": "GET /feedback/list",
            "view_feedback": "GET /feedback/<filename>",
            "health": "GET /health"
        }
    })


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Strategic Marketing System - Feedback Server")
    print("="*60)
    print(f"🤖 Active Model: {ACTIVE_MODEL}")
    print(f"📁 Feedback Directory: {FEEDBACK_DIR}")
    print(f"🐙 GitHub: {'✓ CONFIGURED' if GITHUB_TOKEN else '✗ NOT CONFIGURED'}")
    if GITHUB_TOKEN:
        print(f"   Repository: {GITHUB_REPO}/{GITHUB_FEEDBACK_PATH}")
    print("="*60)
    print("\n📡 Endpoints:")
    print("   POST /generate - Generate marketing plan")
    print("   POST /feedback - Submit feedback")
    print("   GET  /feedback/list - List all feedback")
    print("   GET  /feedback/<filename> - View specific feedback")
    print("   GET  /health - Health check")
    print("="*60 + "\n")
    
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
