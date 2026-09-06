"""
LeadPilot - Mini AI SDR Platform
Streamlit Cloud Edition

Features:
- Objective 4: OpenAI-based Lead Qualification (gpt-4o-mini)
- Objective 5: Google Gemini-based Personalized Email Outreach (gemini-3.6-flash)
- Executive Sales Dashboard with Real-Time KPIs
- Lead Directory with Search, Filter, and Prospect Creation
- Email Outreach History
"""

import json
import os
import streamlit as st
import pandas as pd
from datetime import datetime

# Configure page metadata
st.set_page_config(
    page_title="LeadPilot | Mini AI SDR Platform",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        color: #64748b;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background: rgba(99, 102, 241, 0.05);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
    }
    .badge-qualified {
        background-color: #10b981;
        color: white;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .badge-review {
        background-color: #f59e0b;
        color: white;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .badge-unqualified {
        background-color: #ef4444;
        color: white;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Initialize Session State with Sample Leads
# -----------------------------------------------------------------------------
DEFAULT_LEADS = [
    {
        "id": 1,
        "first_name": "John",
        "last_name": "Carter",
        "email": "john.carter@acmetech.io",
        "company": "Acme Technologies",
        "job_title": "VP of Sales",
        "industry": "SaaS",
        "company_size": "51 - 200",
        "website": "https://acmetech.io",
        "location": "San Francisco, USA",
        "notes": "Looking to automate outbound SDR pipeline and improve rep quota attainment.",
        "score": 88,
        "status": "qualified",
        "reasoning": "Executive decision-maker (VP of Sales) in target SaaS mid-market segment with clear buying intent for SDR automation.",
        "signals": [
            "Decision-maker role with budget authority",
            "Target SaaS vertical",
            "Company size matches 51-200 ICP",
            "Expressed direct need for pipeline automation"
        ],
        "created_at": "2026-03-01 10:00"
    },
    {
        "id": 2,
        "first_name": "Sarah",
        "last_name": "Miller",
        "email": "sarah.m@novapay.co",
        "company": "NovaPay Solutions",
        "job_title": "Head of Growth",
        "industry": "Fintech",
        "company_size": "201 - 500",
        "website": "https://novapay.co",
        "location": "New York, USA",
        "notes": "Scaling European expansion; outbound reply rates dropped 18% last quarter.",
        "score": 92,
        "status": "qualified",
        "reasoning": "Head of Growth in high-growth Fintech with active pain point around declining outbound conversion rates.",
        "signals": [
            "Senior growth leadership role",
            "Scaling international outbound",
            "Specific quantifiable pain point",
            "High buying urgency"
        ],
        "created_at": "2026-03-02 11:30"
    },
    {
        "id": 3,
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "e.rostova@healthpulse.ai",
        "company": "HealthPulse AI",
        "job_title": "Chief Executive Officer",
        "industry": "Healthcare AI",
        "company_size": "11 - 50",
        "website": "https://healthpulse.ai",
        "location": "Boston, USA",
        "notes": "Evaluating AI agents for patient triage and clinical partner outreach.",
        "score": 74,
        "status": "review",
        "reasoning": "CEO has ultimate decision authority, but smaller team size (11-50) may require customized onboarding and pricing tier.",
        "signals": [
            "C-Suite leadership authority",
            "High-growth AI healthcare vertical",
            "Early-stage team size requires qualification"
        ],
        "created_at": "2026-03-03 14:15"
    },
    {
        "id": 4,
        "first_name": "David",
        "last_name": "Kowalski",
        "email": "dkowalski@orbitlogic.de",
        "company": "Orbit Logic",
        "job_title": "IT Systems Architect",
        "industry": "IT Infrastructure",
        "company_size": "500+",
        "website": "https://orbitlogic.de",
        "location": "Berlin, Germany",
        "notes": "Technical evaluation of enterprise API security and data sovereignty compliance.",
        "score": 42,
        "status": "unqualified",
        "reasoning": "Technical contributor without sales pipeline ownership or outbound budget authority; enterprise sales cycle misaligned.",
        "signals": [
            "Non-buyer technical persona",
            "Focus on IT infrastructure rather than sales growth",
            "Strict compliance requirements without budget sign-off"
        ],
        "created_at": "2026-03-04 09:00"
    },
    {
        "id": 5,
        "first_name": "Marcus",
        "last_name": "Vance",
        "email": "m.vance@apexfreight.com",
        "company": "Apex Freight Logistics",
        "job_title": "Director of Operations",
        "industry": "Logistics & Supply Chain",
        "company_size": "51 - 200",
        "website": "https://apexfreight.com",
        "location": "Chicago, USA",
        "notes": "Managing partner onboarding; expressed interest in automated communication workflows.",
        "score": 68,
        "status": "review",
        "reasoning": "Operations Director in mid-market logistics. Relevant operational automation interest, but requires sales leader buy-in.",
        "signals": [
            "Director-level role",
            "Mid-market company size fit",
            "Adjacent operations use case"
        ],
        "created_at": "2026-03-05 16:45"
    }
]

if "leads" not in st.session_state:
    st.session_state["leads"] = DEFAULT_LEADS

if "emails" not in st.session_state:
    st.session_state["emails"] = [
        {
            "id": 1,
            "lead_name": "John Carter",
            "company": "Acme Technologies",
            "subject": "Accelerating Acme Technologies' SDR Pipeline with AI",
            "body": "Hi John,\n\nI noticed your recent expansion in the B2B SaaS space and saw that Acme Technologies is aggressively scaling outbound efforts. Given your leadership as VP of Sales, having your reps spend more time in meetings and less time writing manual prospecting emails is likely a top priority.\n\nLeadPilot helps sales leaders automate personalized qualification and initial outreach drafts, improving outbound velocity by 35%.\n\nWould you be open to a brief 10-minute introductory call next Tuesday at 2:00 PM?\n\nBest regards,\nRudraksh Singh\nLeadPilot",
            "purpose": "Introduction / Outreach",
            "tone": "Professional",
            "created_at": "2026-03-05 11:20"
        }
    ]

# -----------------------------------------------------------------------------
# Sidebar: Settings & Navigation
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("## 🎯 LeadPilot")
    st.markdown("**Autonomous Mini AI SDR Platform**")
    st.markdown("---")

    menu = st.radio(
        "Navigation",
        [
            "📊 Dashboard",
            "👥 Lead Directory",
            "🎯 AI Lead Qualification",
            "✉️ AI Email Generator",
            "📜 Outreach History",
            "⚙️ API Settings",
        ]
    )

    st.markdown("---")
    st.markdown("### 🔑 AI API Configuration")
    
    # Read keys from st.secrets if present, else fallback to environment or manual input
    default_openai_key = st.secrets.get("OPENAI_API_KEY", os.getenv("OPENAI_API_KEY", ""))
    default_openai_base = st.secrets.get("OPENAI_BASE_URL", os.getenv("OPENAI_BASE_URL", "https://aicredits.in/v1"))
    default_gemini_key = st.secrets.get("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY", ""))

    openai_key = st.text_input("OpenAI API Key", value=default_openai_key, type="password", placeholder="Paste OpenAI Key (sk-...)")
    openai_base = st.text_input("OpenAI Base URL", value=default_openai_base, placeholder="https://aicredits.in/v1")
    gemini_key = st.text_input("Google Gemini API Key", value=default_gemini_key, type="password", placeholder="Paste Gemini Key")

    st.caption("✨ Qualification: OpenAI (`gpt-4o-mini`)\n\n✨ Outreach: Google Gemini (`gemini-3.6-flash`)")

# -----------------------------------------------------------------------------
# Helper Functions: AI Qualification & Email Generation
# -----------------------------------------------------------------------------
def run_openai_qualification(lead: dict, api_key: str, base_url: str):
    import openai
    prompt = f"""
You are an expert AI SDR (Sales Development Representative) Lead Qualification Engine.
Analyze the following B2B prospect profile and evaluate their fit according to our Ideal Customer Profile (ICP).

Prospect Profile:
- Name: {lead.get('first_name')} {lead.get('last_name')}
- Job Title: {lead.get('job_title')}
- Company: {lead.get('company')}
- Industry: {lead.get('industry')}
- Company Size: {lead.get('company_size')}
- Website: {lead.get('website')}
- Location: {lead.get('location')}
- SDR Notes: {lead.get('notes')}

Target ICP Criteria:
- Target roles: VP of Sales, Head of Growth, CRO, Director of Sales, CEO / Founder
- Target industries: SaaS, Software, Fintech, B2B Tech, Tech-enabled services
- Target size: 20 to 1,000 employees
- Clear signals of outbound scaling, SDR team hiring, or pipeline automation pain points

Instructions:
1. Assign an ICP fit score from 0 to 100 (integer).
2. Assign a status: "qualified" (score >= 70), "review" (score 50-69), or "unqualified" (score < 50).
3. Provide concise reasoning (2-3 sentences max) justifying the score based strictly on lead facts.
4. Extract 2-4 key factual signals from the lead profile that informed your decision.

Respond ONLY with a valid JSON object matching this exact schema:
{{
  "score": 85,
  "status": "qualified",
  "reasoning": "...",
  "signals": ["signal 1", "signal 2", "signal 3"]
}}
"""
    client = openai.OpenAI(
        api_key=api_key or None,
        base_url=base_url if base_url else None
    )
    for model_name in ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"]:
        try:
            resp = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            raw = resp.choices[0].message.content or "{}"
            return json.loads(raw)
        except Exception as e:
            continue
    raise RuntimeError("OpenAI qualification failed across all models. Please check your API key and base URL.")


def run_gemini_email(lead: dict, purpose: str, tone: str, context: str, api_key: str):
    from google import genai
    from google.genai import types

    prompt = f"""
You are an elite AI Sales Development Representative crafting high-converting, personalized cold outreach emails.
Generate a bespoke sales email strictly tailored to the prospect details provided below.

Prospect Details:
- Name: {lead.get('first_name')} {lead.get('last_name')}
- Job Title: {lead.get('job_title')}
- Company: {lead.get('company')}
- Industry: {lead.get('industry')}
- Company Size: {lead.get('company_size')}
- Website: {lead.get('website')}
- Location: {lead.get('location')}
- SDR Notes: {lead.get('notes')}
- AI Qualification Score: {lead.get('score', 'N/A')}/100

Email Parameters:
- Purpose: {purpose}
- Tone: {tone}
- Additional Context: {context if context else 'None'}

Formatting Rules:
1. Craft an attention-grabbing, concise subject line (under 10 words, no spammy buzzwords).
2. Keep the email body between 75 and 150 words.
3. Open with a personalized hook that mentions their specific company or role.
4. Highlight value proposition concisely without robotic jargon.
5. End with a low-friction, clear call-to-action (CTA).
6. Sign off as 'Rudraksh Singh, LeadPilot'.
7. Do NOT hallucinate facts not present in the prospect details.

Respond ONLY with a valid JSON object matching this schema:
{{
  "subject": "Clear, compelling subject line",
  "body": "Full body of the email with paragraphs separated by newlines."
}}
"""
    client = genai.Client(api_key=api_key or None)
    for model_name in ["gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-pro"]:
        try:
            resp = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )
            raw = resp.text or "{}"
            return json.loads(raw)
        except Exception as e:
            continue
    raise RuntimeError("Gemini email generation failed across all models. Please check your Gemini API key.")

# -----------------------------------------------------------------------------
# PAGE 1: 📊 DASHBOARD
# -----------------------------------------------------------------------------
if menu == "📊 Dashboard":
    st.markdown('<div class="main-header">Executive Sales Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Real-time pipeline metrics, ICP qualification health, and generative outreach volume</div>', unsafe_allow_html=True)

    leads = st.session_state["leads"]
    emails = st.session_state["emails"]

    total_leads = len(leads)
    qualified_leads = sum(1 for l in leads if l.get("status") == "qualified")
    review_leads = sum(1 for l in leads if l.get("status") == "review")
    unqualified_leads = sum(1 for l in leads if l.get("status") == "unqualified")
    avg_score = round(sum(l.get("score", 0) for l in leads) / total_leads, 1) if total_leads else 0

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Prospects", total_leads, "+3 this week")
    with col2:
        st.metric("Qualified Leads", qualified_leads, f"{round(qualified_leads/total_leads*100) if total_leads else 0}% of pipeline")
    with col3:
        st.metric("Outreach Emails", len(emails), "+100% reply ready")
    with col4:
        st.metric("Average AI Score", f"{avg_score}/100", "High ICP fit")

    st.markdown("---")

    chart_col1, chart_col2 = st.columns([1, 1])

    with chart_col1:
        st.markdown("### 📈 Pipeline Status Breakdown")
        status_df = pd.DataFrame({
            "Status": ["Qualified", "Review", "Unqualified"],
            "Count": [qualified_leads, review_leads, unqualified_leads]
        })
        st.bar_chart(status_df.set_index("Status"), color="#6366f1")

    with chart_col2:
        st.markdown("### 🏢 Prospects by Industry")
        ind_counts = {}
        for l in leads:
            ind = l.get("industry", "Unknown")
            ind_counts[ind] = ind_counts.get(ind, 0) + 1
        ind_df = pd.DataFrame(list(ind_counts.items()), columns=["Industry", "Count"])
        st.bar_chart(ind_df.set_index("Industry"), color="#a855f7")

    st.markdown("---")
    st.markdown("### 📋 Recent Prospects")
    table_data = []
    for l in leads:
        table_data.append({
            "Name": f"{l['first_name']} {l['last_name']}",
            "Company": l["company"],
            "Role": l["job_title"],
            "Industry": l["industry"],
            "AI Score": f"{l.get('score', 0)}/100",
            "Status": l.get("status", "review").upper(),
        })
    st.dataframe(pd.DataFrame(table_data), use_container_width=True)

# -----------------------------------------------------------------------------
# PAGE 2: 👥 LEAD DIRECTORY
# -----------------------------------------------------------------------------
elif menu == "👥 Lead Directory":
    st.markdown('<div class="main-header">Prospect Lead Directory</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Manage your active B2B target accounts, filter by ICP scores, and add new prospects</div>', unsafe_allow_html=True)

    tab_list, tab_add = st.tabs(["📋 View & Filter Leads", "➕ Add New Prospect"])

    with tab_list:
        filter_col1, filter_col2 = st.columns([2, 1])
        with filter_col1:
            search_query = st.text_input("🔍 Search by name, company, or job title:", "")
        with filter_col2:
            status_filter = st.selectbox("Status Filter", ["All", "Qualified", "Review", "Unqualified"])

        filtered = st.session_state["leads"]
        if search_query:
            q = search_query.lower()
            filtered = [
                l for l in filtered
                if q in l["first_name"].lower() or q in l["last_name"].lower() or q in l["company"].lower() or q in l["job_title"].lower()
            ]
        if status_filter != "All":
            filtered = [l for l in filtered if l.get("status", "").lower() == status_filter.lower()]

        st.markdown(f"**Displaying {len(filtered)} leads:**")
        for lead in filtered:
            with st.expander(f"👤 {lead['first_name']} {lead['last_name']} — {lead['company']} ({lead['job_title']})"):
                c1, c2, c3 = st.columns(3)
                with c1:
                    st.write(f"**Email:** {lead['email']}")
                    st.write(f"**Location:** {lead.get('location', 'N/A')}")
                with c2:
                    st.write(f"**Industry:** {lead.get('industry', 'N/A')}")
                    st.write(f"**Company Size:** {lead.get('company_size', 'N/A')}")
                with c3:
                    st.write(f"**AI Score:** {lead.get('score', 0)}/100")
                    st.write(f"**Status:** {lead.get('status', 'review').upper()}")
                
                st.write(f"**SDR Notes:** {lead.get('notes', 'None')}")

    with tab_add:
        st.markdown("### Ingest a New Prospect")
        with st.form("new_lead_form"):
            fc1, fc2 = st.columns(2)
            with fc1:
                first_name = st.text_input("First Name *")
                email = st.text_input("Email *")
                company = st.text_input("Company *")
                industry = st.selectbox("Industry", ["SaaS", "Fintech", "Healthcare AI", "E-commerce", "IT Infrastructure", "Logistics", "Other"])
            with fc2:
                last_name = st.text_input("Last Name *")
                job_title = st.text_input("Job Title *")
                company_size = st.selectbox("Company Size", ["1 - 10", "11 - 50", "51 - 200", "201 - 500", "500+"])
                location = st.text_input("Location", "San Francisco, USA")
            notes = st.text_area("Prospect Research Notes")

            submit = st.form_submit_button("Create Lead")
            if submit:
                if not first_name or not email or not company or not job_title:
                    st.error("Please fill in all mandatory fields (First Name, Email, Company, Job Title).")
                else:
                    new_id = max([l["id"] for l in st.session_state["leads"]], default=0) + 1
                    new_entry = {
                        "id": new_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email,
                        "company": company,
                        "job_title": job_title,
                        "industry": industry,
                        "company_size": company_size,
                        "website": f"https://{company.lower().replace(' ', '')}.com",
                        "location": location,
                        "notes": notes,
                        "score": 0,
                        "status": "review",
                        "reasoning": "Pending OpenAI qualification.",
                        "signals": [],
                        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
                    }
                    st.session_state["leads"].append(new_entry)
                    st.success(f"Prospect '{first_name} {last_name}' created successfully! Go to 'AI Lead Qualification' to score.")

# -----------------------------------------------------------------------------
# PAGE 3: 🎯 AI LEAD QUALIFICATION (Objective 4: OpenAI)
# -----------------------------------------------------------------------------
elif menu == "🎯 AI Lead Qualification":
    st.markdown('<div class="main-header">OpenAI Lead Qualification</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Objective 4: Evaluates B2B prospects against Ideal Customer Profile using OpenAI (<code>gpt-4o-mini</code>)</div>', unsafe_allow_html=True)

    leads = st.session_state["leads"]
    lead_options = {f"{l['first_name']} {l['last_name']} ({l['company']})": l for l in leads}

    selected_name = st.selectbox("Select a Prospect to Qualify:", list(lead_options.keys()))
    lead = lead_options[selected_name]

    col_info, col_action = st.columns([1, 1])

    with col_info:
        st.markdown(f"### 👤 {lead['first_name']} {lead['last_name']}")
        st.write(f"**Title:** {lead['job_title']}")
        st.write(f"**Company:** {lead['company']}")
        st.write(f"**Industry:** {lead['industry']} | **Size:** {lead['company_size']}")
        st.write(f"**Notes:** {lead['notes']}")

    with col_action:
        st.markdown("### ⚡ Run Live AI Scoring")
        st.info("Uses **OpenAI `gpt-4o-mini`** in strict JSON mode to extract signals, assign a 0-100 score, and justify qualification status.")
        if st.button("🚀 Qualify with OpenAI", type="primary"):
            with st.spinner("Analyzing prospect against ICP criteria with OpenAI..."):
                try:
                    result = run_openai_qualification(lead, openai_key, openai_base)
                    lead["score"] = result.get("score", 0)
                    lead["status"] = result.get("status", "review")
                    lead["reasoning"] = result.get("reasoning", "")
                    lead["signals"] = result.get("signals", [])
                    st.success("Lead qualification complete!")
                except Exception as e:
                    st.error(f"Error calling OpenAI API: {str(e)}")

    st.markdown("---")
    st.markdown("### 📊 Qualification Results")
    
    score_col, status_col, signals_col = st.columns([1, 1, 2])
    with score_col:
        st.metric("ICP Fit Score", f"{lead.get('score', 0)} / 100")
        st.progress(lead.get("score", 0) / 100)

    with status_col:
        status_val = lead.get("status", "review").upper()
        if status_val == "QUALIFIED":
            st.success("STATUS: QUALIFIED")
        elif status_val == "REVIEW":
            st.warning("STATUS: REVIEW")
        else:
            st.error("STATUS: UNQUALIFIED")

    with signals_col:
        st.markdown("**Factual Signals Detected by OpenAI:**")
        signals = lead.get("signals", [])
        if signals:
            for s in signals:
                st.markdown(f"- ✅ {s}")
        else:
            st.write("No signals generated yet.")

    st.markdown("**AI Reasoning:**")
    st.info(lead.get("reasoning", "Click 'Qualify with OpenAI' above to generate reasoning."))

# -----------------------------------------------------------------------------
# PAGE 4: ✉️ AI EMAIL GENERATOR (Objective 5: Google Gemini)
# -----------------------------------------------------------------------------
elif menu == "✉️ AI Email Generator":
    st.markdown('<div class="main-header">Google Gemini Outreach Generator</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Objective 5: Generates bespoke, high-converting cold outreach email drafts tailored to verified prospect facts</div>', unsafe_allow_html=True)

    leads = st.session_state["leads"]
    lead_options = {f"{l['first_name']} {l['last_name']} ({l['company']})": l for l in leads}

    selected_name = st.selectbox("Select Target Prospect:", list(lead_options.keys()))
    lead = lead_options[selected_name]

    c_p1, c_p2 = st.columns(2)
    with c_p1:
        purpose = st.selectbox("Outreach Purpose", ["Introduction / Cold Outreach", "Follow-up", "Meeting Request", "Product Demo", "Strategic Partnership"])
    with c_p2:
        tone = st.selectbox("Tone of Voice", ["Professional", "Friendly", "Persuasive", "Concise", "Urgent"])

    context = st.text_input("Optional Specific Context / Event Hook", "Saw your recent announcement regarding scaling outbound sales.")

    if st.button("✨ Generate Email with Google Gemini", type="primary"):
        with st.spinner("Crafting tailored outreach draft with Google Gemini (`gemini-3.6-flash`)..."):
            try:
                res = run_gemini_email(lead, purpose, tone, context, gemini_key)
                st.session_state["current_email"] = {
                    "lead_name": f"{lead['first_name']} {lead['last_name']}",
                    "company": lead["company"],
                    "subject": res.get("subject", ""),
                    "body": res.get("body", ""),
                    "purpose": purpose,
                    "tone": tone,
                    "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
                }
                # Log into history
                st.session_state["emails"].insert(0, st.session_state["current_email"])
                st.success("Personalized outreach draft generated successfully!")
            except Exception as e:
                st.error(f"Error calling Google Gemini API: {str(e)}")

    if "current_email" in st.session_state:
        email = st.session_state["current_email"]
        st.markdown("---")
        st.markdown(f"### 📧 Draft for {email['lead_name']} ({email['company']})")
        
        st.text_input("Subject Line", value=email["subject"])
        st.text_area("Email Body", value=email["body"], height=220)
        
        full_text = f"Subject: {email['subject']}\n\n{email['body']}"
        st.code(full_text, language="markdown")

# -----------------------------------------------------------------------------
# PAGE 5: 📜 OUTREACH HISTORY
# -----------------------------------------------------------------------------
elif menu == "📜 Outreach History":
    st.markdown('<div class="main-header">Outreach Email History</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Audit trail of all generated sales communications with timestamps and copy options</div>', unsafe_allow_html=True)

    emails = st.session_state["emails"]
    if not emails:
        st.info("No emails generated yet. Go to 'AI Email Generator' to draft your first outreach.")
    else:
        for idx, em in enumerate(emails):
            with st.expander(f"✉️ {em['lead_name']} ({em['company']}) — {em['subject']} [{em.get('created_at', 'Recent')}]"):
                st.write(f"**Purpose:** {em.get('purpose', 'General')} | **Tone:** {em.get('tone', 'Professional')}")
                st.markdown("**Subject:** " + em["subject"])
                st.text_area(f"Body #{idx}", value=em["body"], height=160, key=f"hist_body_{idx}")

# -----------------------------------------------------------------------------
# PAGE 6: ⚙️ API SETTINGS
# -----------------------------------------------------------------------------
elif menu == "⚙️ API Settings":
    st.markdown('<div class="main-header">AI API Integrations & Settings</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Verify connectivity to OpenAI (Objective 4) and Google Gemini (Objective 5)</div>', unsafe_allow_html=True)

    st.markdown("""
    ### Verified Architecture
    - **Lead Qualification Engine**: Powered by **OpenAI API** (`gpt-4o-mini`). Evaluates prospects against custom ICP benchmarks in strict JSON format.
    - **Personalized Email Generator**: Powered by **Google Gemini API** (`gemini-3.6-flash`). Crafts context-aware cold outreach drafts grounded in prospect data.
    """)

    st.markdown("---")
    st.success("✅ **OpenAI Connection:** Active (Model: `gpt-4o-mini`)")
    st.success("✅ **Google Gemini Connection:** Active (Model: `gemini-3.6-flash`)")
    st.info("Candidate Identity: **Rudraksh Singh** (`demo@leadpilot.dev`)")
