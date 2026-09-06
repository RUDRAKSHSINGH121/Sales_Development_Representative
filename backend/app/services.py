import json
from openai import OpenAI
from google import genai
from .config import settings
from .models import Lead

OPENAI_MODELS = [
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-3.5-turbo",
]

GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
]

def _clean_json(raw: str) -> dict:
    if not raw:
        return {}
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise

def _generate_with_openai(prompt: str) -> str:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    
    kwargs = {"api_key": settings.openai_api_key, "timeout": 25.0}
    if settings.openai_base_url:
        kwargs["base_url"] = settings.openai_base_url

    client = OpenAI(**kwargs)
    last_err = None
    for model_name in OPENAI_MODELS:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert B2B SDR AI. Always respond in strict, valid JSON format only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            content = response.choices[0].message.content
            if content:
                return content
        except Exception as e:
            last_err = e
            continue
    raise last_err or RuntimeError("OpenAI content generation failed")

def _generate_with_gemini(prompt: str) -> str:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    client = genai.Client(api_key=settings.gemini_api_key)
    last_err = None
    for model_name in GEMINI_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            if response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue
    raise last_err or RuntimeError("Gemini content generation failed")

def lead_context(lead: Lead) -> str:
    return json.dumps(
        {
            "name": f"{lead.first_name} {lead.last_name}",
            "company": lead.company,
            "role": lead.job_title,
            "industry": lead.industry,
            "company_size": lead.company_size,
            "website": lead.website,
            "notes": lead.notes,
        },
        default=str,
    )

def qualify(lead: Lead) -> dict:
    """
    Objective 4: OpenAI-based Lead Qualification.
    Evaluates B2B lead fit using only supplied facts and returns structured scoring, status, reasoning, and key signals.
    """
    prompt = (
        f"Evaluate this B2B lead for sales qualification using only supplied facts. "
        f"Return JSON strictly with the following keys:\n"
        f"- 'score': integer between 0 and 100 representing ICP fit\n"
        f"- 'status': one of 'qualified', 'review', or 'unqualified'\n"
        f"- 'reasoning': concise 1-2 sentence explanation of the score\n"
        f"- 'signals': array of 2-4 factual qualification signal strings observed from the lead data\n\n"
        f"Do not invent facts. Lead Profile:\n{lead_context(lead)}"
    )
    raw_text = _generate_with_openai(prompt)
    data = _clean_json(raw_text)
    score = max(0, min(100, int(data.get("score", 50))))
    status = str(data.get("status", "review")).lower()
    if status not in {"qualified", "review", "unqualified"}:
        status = "review"

    raw_signals = data.get("signals", [])
    signals = []
    if isinstance(raw_signals, dict):
        for k, v in raw_signals.items():
            val_str = ", ".join(str(x) for x in v) if isinstance(v, list) else str(v)
            signals.append(f"{k.replace('_', ' ').title()}: {val_str}")
    elif isinstance(raw_signals, list):
        for s in raw_signals:
            if isinstance(s, dict):
                signals.append(": ".join(str(x) for x in s.values()))
            else:
                signals.append(str(s))
    else:
        signals = [str(raw_signals)]

    if not signals:
        signals = [f"Company: {lead.company}", f"Role: {lead.job_title or 'Contact'}"]

    return {
        "score": score,
        "status": status,
        "reasoning": str(data.get("reasoning", "Evaluated based on provided company and profile data.")),
        "signals": signals[:4],
    }

def generate_email(lead: Lead, purpose: str, tone: str, context: str | None) -> dict:
    """
    Objective 5: Gemini-based Personalized Email Generation.
    Generates tailored B2B outreach drafts using supplied lead information and Google Gemini.
    """
    prompt = (
        f'Write a highly personalized, compelling B2B sales email as strict JSON: {{"subject": string, "body": string}}.\n'
        f"Use only these lead facts and optional SDR context; do not fabricate claims or company achievements.\n"
        f"Target Lead: {lead_context(lead)}\n"
        f"Email Purpose: {purpose}\n"
        f"Tone: {tone}\n"
        f"Additional SDR Context: {context or 'None'}\n\n"
        f"Ensure the email has a captivating subject line and a concise, high-converting body with a clear call to action."
    )
    raw_text = _generate_with_gemini(prompt)
    data = _clean_json(raw_text)
    return {
        "subject": str(data.get("subject", "Introduction"))[:255],
        "body": str(data.get("body", "")),
    }
